import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Veterinarian(){
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedPet, setSelectedPet] = useState(null)
  const [openTreatmentId, setOpenTreatmentId] = useState(null)
  const [treatmentForm, setTreatmentForm] = useState({ diagnosis:'', treatment:'', prescription:'' })

  const currentUser = (()=>{ try { return JSON.parse(localStorage.getItem('user')||'null') } catch(e){ return null } })()

  useEffect(()=>{
    api.getAppointmentList().then(list=>{
      // filter appointments assigned to this veterinarian
      if (currentUser){
        const mine = list.filter(a => String(a.vet_id) === String(currentUser.user_id) || String(a.vet_id) === String(currentUser.vet_id) )
        setAppointments(mine)
      } else setAppointments(list)
    }).catch(()=>setAppointments([]))
  },[])

  async function submitTreatment(appointment_id){
    try{
      const payload = { appointment_id, ...treatmentForm }
      await api.createTreatment(payload)
      setOpenTreatmentId(null)
      setTreatmentForm({ diagnosis:'', treatment:'', prescription:'' })
      // optionally refresh appointments or show success
      alert('Treatment recorded')
    }catch(err){ alert('Failed: '+err.message) }
  }

  async function openDetails(a){
    setSelectedAppointment(a)
    if (a && a.pet_id){
      try{ const pet = await api.getPet(a.pet_id); setSelectedPet(pet) }catch(e){ setSelectedPet(null) }
    } else setSelectedPet(null)
  }

  return (
    <div>
      <h2>Veterinarian</h2>
      <p>View assigned appointments and record treatments.</p>
      <div>
        {appointments.length===0 ? <div>No appointments</div> : appointments.map(a=> (
          <div key={a.appointment_id} className="list-item">
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div onClick={()=>openDetails(a)} style={{cursor:'pointer'}}>
                <strong>{a.appointment_date}</strong> — {a.pet_name? a.pet_name : `Pet ${a.pet_id}`} (Status: {a.status})
                <div style={{marginTop:6}}>{a.notes}</div>
              </div>
            </div>

            {selectedAppointment && selectedAppointment.appointment_id===a.appointment_id && (
              <div style={{marginTop:12,borderTop:'1px solid #eee',paddingTop:8}}>
                <h4>Appointment</h4>
                <div><strong>Date:</strong> {selectedAppointment.appointment_date}</div>
                <div><strong>Notes:</strong> {selectedAppointment.notes || '—'}</div>
                <h4 style={{marginTop:8}}>Pet Information</h4>
                {selectedPet ? (
                  <div>
                    <div>Name: {selectedPet.name}</div>
                    <div>Species: {selectedPet.species}</div>
                    <div>Breed: {selectedPet.breed}</div>
                    <div>Age: {selectedPet.age}</div>
                  </div>
                ) : <div>Loading pet info...</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
