import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Admin(){
  const [appointments, setAppointments] = useState([])
  const [pets, setPets] = useState([])
  const [owners, setOwners] = useState([])
  const [vets, setVets] = useState([])
  const [clinics, setClinics] = useState([])
  const [message, setMessage] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(()=>{ 
    api.getAppointmentList().then(setAppointments).catch(()=>setAppointments([]))
    api.getPets().then(setPets).catch(()=>setPets([]))
    api.getOwners().then(setOwners).catch(()=>setOwners([]))
    api.getVets().then(setVets).catch(()=>setVets([]))
    api.getClinics().then(setClinics).catch(()=>setClinics([]))
  },[])

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

  // Helper functions to get names
  const getPetName = (petId) => pets.find(p=> p.pet_id==petId)?.name || `Pet ${petId}`
  const getOwnerName = (petId) => {
    const pet = pets.find(p=> p.pet_id==petId)
    if (!pet) return '—'
    const owner = owners.find(o=> o.owner_id==pet.owner_id)
    return owner?.name || '—'
  }
  const getVetName = (vetId) => vets.find(v=> v.vet_id==vetId)?.name || `Vet ${vetId}`
  const getClinicName = (clinicId) => clinics.find(c=> c.clinic_id==clinicId)?.name || '—'

  const pendingAppointments = appointments.filter(a => a.status==='Pending' || a.status==='Scheduled')

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Review and approve/reject pending appointments</p>

      <h3 style={{marginTop:24}}>Appointments List</h3>
      {pendingAppointments.length===0 ? (
        <div>No pending appointments</div>
      ) : (
        <div>
          {pendingAppointments.map(a=> (
            <div key={a.appointment_id} className="list-item" style={{cursor:'pointer',padding:'12px',marginBottom:'8px',border:'1px solid #ddd',borderRadius:'4px'}} onClick={()=>setSelectedAppointment(a)}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12}}>
                <div><strong>Pet:</strong> {getPetName(a.pet_id)}</div>
                <div><strong>Owner:</strong> {getOwnerName(a.pet_id)}</div>
                <div><strong>Vet:</strong> {getVetName(a.vet_id)}</div>
                <div><strong>Clinic:</strong> {getClinicName(a.clinic_id)}</div>
              </div>
              <div style={{marginTop:8,fontSize:'0.9em',color:'#666'}}>Date: {a.appointment_date}</div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <div style={{marginTop:24,padding:16,backgroundColor:'#f5f5f5',borderRadius:'4px',borderLeft:'4px solid #4CAF50'}}>
          <h4>Appointment Details</h4>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
            <div><strong>Pet:</strong> {getPetName(selectedAppointment.pet_id)}</div>
            <div><strong>Owner:</strong> {getOwnerName(selectedAppointment.pet_id)}</div>
            <div><strong>Vet:</strong> {getVetName(selectedAppointment.vet_id)}</div>
            <div><strong>Clinic:</strong> {getClinicName(selectedAppointment.clinic_id)}</div>
            <div style={{gridColumn:'1 / -1'}}><strong>Date & Time:</strong> {selectedAppointment.appointment_date}</div>
            <div style={{gridColumn:'1 / -1'}}><strong>Notes:</strong> {selectedAppointment.notes || '—'}</div>
          </div>

          <div style={{marginTop:16,display:'flex',gap:8}}>
            <button style={{padding:'8px 16px',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={()=>approveAppointment(selectedAppointment.appointment_id)}>Approve</button>
            <button style={{padding:'8px 16px',backgroundColor:'#f44336',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={()=>rejectAppointment(selectedAppointment.appointment_id)}>Reject</button>
            <button style={{padding:'8px 16px',backgroundColor:'#999',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={()=>setSelectedAppointment(null)}>Close</button>
          </div>
        </div>
      )}

      {message && <div style={{marginTop:12,padding:12,backgroundColor:'#e8f5e9',borderRadius:'4px',color:'#2e7d32'}}>{message}</div>}
    </div>
  )
}
