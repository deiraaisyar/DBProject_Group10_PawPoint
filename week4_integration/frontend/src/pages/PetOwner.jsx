import React, { useEffect, useState } from 'react'
import api from '../api'

export default function PetOwner(){
  const [owners, setOwners] = useState([])
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [pets, setPets] = useState([])
  const [availableVets, setAvailableVets] = useState([])
  const [scheduleForm, setScheduleForm] = useState({ pet_id:'', appointment_date:'', vet_id:'', notes:'' })

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch(e){ return null }
  })()

  const [form, setForm] = useState({ user_id: currentUser?.user_id || '', name:'', phone:'', address:'' })

  useEffect(()=>{
    api.getOwners().then(setOwners).catch(()=>setOwners([]))
    api.getUsers().then(setUsers).catch(()=>setUsers([]))
    api.getAppointmentList().then(setAppointments).catch(()=>setAppointments([]))
    api.getPets().then(setPets).catch(()=>setPets([]))
  },[])

  async function submitOwner(e){
    e.preventDefault()
    setMessage(null)
    try{
      // if no user selected and we have currentUser, use that
      const payload = { ...form }
      if (!payload.user_id && currentUser?.user_id) payload.user_id = currentUser.user_id

      await api.createOwner(payload)
      setMessage('Owner created')
      api.getOwners().then(setOwners)
      setForm({ ...form, name:'', phone:'', address:'' })
    }catch(err){ setMessage(err.message || String(err)) }
  }

  const [petForm, setPetForm] = useState({ owner_id:'', name:'', species:'', breed:'', age:'', gender:'Unknown' })
  async function submitPet(e){
    e.preventDefault()
    setMessage(null)
    try{
      await api.createPet(petForm)
      setMessage('Pet created')
      setPetForm({ owner_id:'', name:'', species:'', breed:'', age:'', gender:'Unknown' })
      api.getPets().then(setPets)
    }catch(err){ setMessage(err.message || String(err)) }
  }

  // compute counts for this user's pets
  const myOwnerIds = owners.filter(o=> currentUser && (o.user_id===(currentUser.user_id) || o.user_id===currentUser.user_id)).map(o=>o.owner_id)
  const myPets = pets.filter(p=> myOwnerIds.includes(p.owner_id))
  const pastCount = appointments.filter(a=> a.status==='Completed' && myPets.some(p=> p.pet_id===a.pet_id)).length
  const pendingCount = appointments.filter(a=> (a.status==='Pending' || a.status==='Scheduled') && myPets.some(p=> p.pet_id===a.pet_id)).length

  async function checkAvailability(){
    setAvailableVets([])
    if (!scheduleForm.appointment_date) return setMessage('Select date and time')
    try{
      const vets = await api.getVets()
      const appts = await api.getAppointmentList()
      // naive availability: vet is busy if they have an appointment at the exact same datetime
      const busyVetIds = appts.filter(a=> a.appointment_date===scheduleForm.appointment_date).map(a=> a.vet_id)
      const available = vets.filter(v=> !busyVetIds.includes(v.vet_id))
      setAvailableVets(available)
      if (available.length===0) setMessage('No vets available at that time')
      else setMessage(`${available.length} vets available`)    
    }catch(err){ setMessage(err.message || String(err)) }
  }

  async function submitSchedule(e){
    e.preventDefault()
    setMessage(null)
    try{
      if (!scheduleForm.pet_id) return setMessage('Select a pet')
      if (!scheduleForm.vet_id) return setMessage('Select a vet')
      const payload = { pet_id: scheduleForm.pet_id, vet_id: scheduleForm.vet_id, appointment_date: scheduleForm.appointment_date, notes: scheduleForm.notes, status:'Pending' }
      await api.createAppointment(payload)
      setMessage('Appointment request submitted')
      api.getAppointmentList().then(setAppointments)
      setScheduleForm({ pet_id:'', appointment_date:'', vet_id:'', notes:'' })
      setAvailableVets([])
    }catch(err){ setMessage(err.message || String(err)) }
  }

  return (
    <div>
      <h2>Pet Owner</h2>
      <p>Register an owner or create a pet for an existing owner.</p>

      <div style={{display:'flex',gap:16}}>
        <div style={{flex:1}}>
          <h3>Create Owner</h3>
          <form onSubmit={submitOwner}>
            <label>User account
              <select value={form.user_id} onChange={e=>setForm({...form,user_id:e.target.value})}>
                <option value="">-- select user account --</option>
                {users.map(u=> (<option key={u.user_id} value={u.user_id}>{u.username} ({u.email||'no-email'})</option>))}
              </select>
            </label>
            <label>name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
            <label>phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></label>
            <label>address<textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></label>
            <button type="submit">Create Owner</button>
          </form>
        </div>

        <div style={{flex:1}}>
          <h3>Create Pet</h3>
          <form onSubmit={submitPet}>
            <label>Owner
              <select value={petForm.owner_id} onChange={e=>setPetForm({...petForm,owner_id:e.target.value})}>
                <option value="">-- select owner --</option>
                {owners.map(o=> (<option key={o.owner_id} value={o.owner_id}>{o.name}{o.phone?` — ${o.phone}`:''}</option>))}
              </select>
            </label>
            <label>name<input value={petForm.name} onChange={e=>setPetForm({...petForm,name:e.target.value})} /></label>
            <label>species<input value={petForm.species} onChange={e=>setPetForm({...petForm,species:e.target.value})} /></label>
            <label>breed<input value={petForm.breed} onChange={e=>setPetForm({...petForm,breed:e.target.value})} /></label>
            <label>age<input value={petForm.age} onChange={e=>setPetForm({...petForm,age:e.target.value})} /></label>
            <label>gender<select value={petForm.gender} onChange={e=>setPetForm({...petForm,gender:e.target.value})}><option>Unknown</option><option>Male</option><option>Female</option></select></label>
            <button type="submit">Create Pet</button>
          </form>
        </div>
      </div>

      <h3>Owners</h3>
      <div>
        {owners.length===0 ? <div>No owners yet</div> : owners.map(o=> (
          <div key={o.owner_id} className="list-item">{o.name} {o.phone?`(${o.phone})`:''}</div>
        ))}
      </div>

      <h3 style={{marginTop:24}}>Dashboard</h3>
      <div style={{display:'flex',gap:12}}>
        <div className="stat-card">Past appointments: <strong>{pastCount}</strong></div>
        <div className="stat-card">Pending approvals: <strong>{pendingCount}</strong></div>
      </div>

      <h3 style={{marginTop:20}}>Request Appointment</h3>
      <form onSubmit={submitSchedule} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignItems:'end'}}>
        <label>Pet
          <select value={scheduleForm.pet_id} onChange={e=>setScheduleForm({...scheduleForm,pet_id:e.target.value})}>
            <option value="">-- select pet --</option>
            {myPets.map(p=> (<option key={p.pet_id} value={p.pet_id}>{p.name} — {p.species}</option>))}
          </select>
        </label>
        <label>Date & Time
          <input type="datetime-local" value={scheduleForm.appointment_date} onChange={e=>setScheduleForm({...scheduleForm,appointment_date:e.target.value})} />
        </label>
        <label>Notes<textarea value={scheduleForm.notes} onChange={e=>setScheduleForm({...scheduleForm,notes:e.target.value})} /></label>
        <div style={{display:'flex',gap:8}}>
          <button type="button" onClick={checkAvailability}>Check availability</button>
          <button type="submit">Request appointment</button>
        </div>
      </form>

      {availableVets.length>0 && (
        <div style={{marginTop:12}}>
          <h4>Available vets at selected time</h4>
          <select value={scheduleForm.vet_id} onChange={e=>setScheduleForm({...scheduleForm,vet_id:e.target.value})}>
            <option value="">-- select vet --</option>
            {availableVets.map(v=> (<option key={v.vet_id} value={v.vet_id}>{v.name} — {v.specialty||'General'}</option>))}
          </select>
        </div>
      )}

      <h3 style={{marginTop:24}}>Appointments</h3>
      <div>
        {appointments && appointments.length===0 ? <div>No appointments</div> : (
          appointments.filter(a=> myPets.some(p=> p.pet_id===a.pet_id)).map(a=> (
            <div key={a.appointment_id} className="list-item">{a.appointment_date} — Pet {a.pet_id} (Status: {a.status})</div>
          ))
        )}
      </div>

      {message && <div style={{marginTop:12}}>{message}</div>}
    </div>
  )
}
