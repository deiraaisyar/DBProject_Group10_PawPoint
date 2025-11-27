import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Admin(){
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ username:'', password:'', role:'admin', email:'' })
  const [appointments, setAppointments] = useState([])
  const [vets, setVets] = useState([])
  const [clinics, setClinics] = useState([])
  const [apptForm, setApptForm] = useState({ pet_id:'', vet_id:'', clinic_id:'', appointment_date:'', notes:'', status:'Scheduled' })
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedPet, setSelectedPet] = useState(null)

  useEffect(()=>{ 
    api.getUsers().then(setUsers).catch(()=>setUsers([]))
    api.getAppointmentList().then(setAppointments).catch(()=>setAppointments([]))
    api.getVets().then(setVets).catch(()=>setVets([]))
    api.getClinics().then(setClinics).catch(()=>setClinics([]))
  },[])

  useEffect(()=>{
    if (selectedAppointment && selectedAppointment.pet_id){
      api.getPet(selectedAppointment.pet_id).then(setSelectedPet).catch(()=>setSelectedPet(null))
    } else {
      setSelectedPet(null)
    }
  },[selectedAppointment])

  async function submit(e){
    e.preventDefault()
    try{
      await api.createUser(form)
      setMessage('User created')
      api.getUsers().then(setUsers)
    }catch(err){ setMessage(err.message) }
  }

  async function submitAppointment(e){
    e.preventDefault()
    try{
      await api.createAppointment(apptForm)
      setMessage('Appointment created')
      api.getAppointmentList().then(setAppointments)
      setApptForm({ pet_id:'', vet_id:'', clinic_id:'', appointment_date:'', notes:'', status:'Scheduled' })
    }catch(err){ setMessage(err.message) }
  }

  async function approveAppointment(id){
    try{
      await api.updateAppointment(id, { status:'Approved' })
      setMessage('Appointment approved')
      api.getAppointmentList().then(setAppointments)
      setSelectedAppointment(null)
    }catch(err){ setMessage(err.message) }
  }

  async function rejectAppointment(id){
    try{
      await api.updateAppointment(id, { status:'Rejected' })
      setMessage('Appointment rejected')
      api.getAppointmentList().then(setAppointments)
      setSelectedAppointment(null)
    }catch(err){ setMessage(err.message) }
  }

  return (
    <div>
      <h2>Admin</h2>
      <p>Manage users (create and list).</p>

      <div style={{display:'flex',gap:16}}>
        <div style={{flex:1}}>
          <h3>Create User</h3>
          <form onSubmit={submit}>
            <label>username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></label>
            <label>password<input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
            <label>role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>admin</option><option>vet</option><option>pet_owner</option></select></label>
            <label>email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
            <button type="submit">Create User</button>
          </form>
          {message && <div style={{marginTop:8}}>{message}</div>}
        </div>

        <div style={{flex:1}}>
          <h3>Schedule Appointment</h3>
          <form onSubmit={submitAppointment}>
            <label>pet_id (enter existing pet id)
              <input value={apptForm.pet_id} onChange={e=>setApptForm({...apptForm,pet_id:e.target.value})} />
            </label>
            <label>vet<select value={apptForm.vet_id} onChange={e=>setApptForm({...apptForm,vet_id:e.target.value})}>
              <option value="">-- select vet --</option>
              {vets.map(v=> <option key={v.vet_id} value={v.vet_id}>{v.name}</option>)}
            </select></label>
            <label>clinic<select value={apptForm.clinic_id} onChange={e=>setApptForm({...apptForm,clinic_id:e.target.value})}>
              <option value="">-- select clinic --</option>
              {clinics.map(c=> <option key={c.clinic_id} value={c.clinic_id}>{c.name}</option>)}
            </select></label>
            <label>appointment_date<input type="datetime-local" value={apptForm.appointment_date} onChange={e=>setApptForm({...apptForm,appointment_date:e.target.value})} /></label>
            <label>notes<textarea value={apptForm.notes} onChange={e=>setApptForm({...apptForm,notes:e.target.value})} /></label>
            <label>status<select value={apptForm.status} onChange={e=>setApptForm({...apptForm,status:e.target.value})}><option>Scheduled</option><option>Completed</option><option>Cancelled</option></select></label>
            <button type="submit">Create Appointment</button>
          </form>

          <h3 style={{marginTop:20}}>Pending Appointments (awaiting approval)</h3>
          {appointments.filter(a => a.status=== 'Pending' || a.status==='Scheduled').length===0 ? (
            <div>No pending appointments</div>
          ) : (
            appointments.filter(a => a.status=== 'Pending' || a.status==='Scheduled').map(a=> (
              <div key={a.appointment_id} className="list-item" style={{cursor:'pointer'}} onClick={()=>setSelectedAppointment(a)}>
                {a.appointment_date} — Pet {a.pet_id} — Vet {a.vet_id}
              </div>
            ))
          )}

          {selectedAppointment && (
            <div style={{marginTop:16,borderTop:'1px solid #eee',paddingTop:12}}>
              <h4>Appointment Details</h4>
              <div><strong>Date:</strong> {selectedAppointment.appointment_date}</div>
              <div><strong>Notes:</strong> {selectedAppointment.notes || '—'}</div>
              <div style={{marginTop:8}}>
                <strong>Pet info:</strong>
                {selectedPet ? (
                  <div style={{marginTop:6}}>
                    <div>Name: {selectedPet.name}</div>
                    <div>Species: {selectedPet.species}</div>
                    <div>Breed: {selectedPet.breed}</div>
                    <div>Age: {selectedPet.age}</div>
                  </div>
                ) : (<div style={{marginTop:6}}>Loading pet...</div>)}
              </div>

              <div style={{marginTop:12,display:'flex',gap:8}}>
                <button onClick={()=>approveAppointment(selectedAppointment.appointment_id)}>Approve</button>
                <button onClick={()=>rejectAppointment(selectedAppointment.appointment_id)}>Reject</button>
                <button onClick={()=>setSelectedAppointment(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
