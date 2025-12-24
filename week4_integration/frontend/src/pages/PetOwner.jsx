import React, { useEffect, useState } from 'react'
import api from '../api'

export default function PetOwner(){
  const [appointments, setAppointments] = useState([])
  const [pets, setPets] = useState([])
  const [owners, setOwners] = useState([])
  const [message, setMessage] = useState(null)

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch(e){ return null }
  })()

  useEffect(()=>{
    api.getOwners().then(setOwners).catch(()=>setOwners([]))
    api.getAppointmentList().then(setAppointments).catch(()=>setAppointments([]))
    api.getPets().then(setPets).catch(()=>setPets([]))
  },[])

  // compute counts for this user's pets
  const myOwnerIds = owners.filter(o=> currentUser && (o.user_id===(currentUser.user_id) || o.user_id===currentUser.user_id)).map(o=>o.owner_id)
  const myPets = pets.filter(p=> myOwnerIds.includes(p.owner_id))
  const pastCount = appointments.filter(a=> a.status==='Completed' && myPets.some(p=> p.pet_id===a.pet_id)).length
  const pendingCount = appointments.filter(a=> (a.status==='Pending' || a.status==='Scheduled') && myPets.some(p=> p.pet_id===a.pet_id)).length

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <div className="stat-card">Total pets: <strong>{myPets.length}</strong></div>
        <div className="stat-card">Past appointments: <strong>{pastCount}</strong></div>
        <div className="stat-card">Pending approvals: <strong>{pendingCount}</strong></div>
      </div>
      {message && <div style={{marginTop:12}}>{message}</div>}
    </div>
  )
}
