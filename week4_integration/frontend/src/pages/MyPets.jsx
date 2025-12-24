import React, { useEffect, useState } from 'react'
import api from '../api'

export default function MyPets(){
  const [pets, setPets] = useState([])
  const [owners, setOwners] = useState([])
  const [message, setMessage] = useState(null)
  const [petForm, setPetForm] = useState({ owner_id:'', name:'', species:'', breed:'', age:'', gender:'Unknown' })

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch(e){ return null }
  })()

  useEffect(()=>{
    api.getOwners().then(setOwners).catch(()=>setOwners([]))
    api.getPets().then(setPets).catch(()=>setPets([]))
  },[])

  // compute this user's owners
  const myOwnerIds = owners.filter(o=> currentUser && (o.user_id===(currentUser.user_id) || o.user_id===currentUser.user_id)).map(o=>o.owner_id)
  const myPets = pets.filter(p=> myOwnerIds.includes(p.owner_id))
  const myOwner = owners.find(o=> myOwnerIds.includes(o.owner_id))

  async function submitPet(e){
    e.preventDefault()
    setMessage(null)
    try{
      if (!myOwner) return setMessage('No owner profile found. Please create one first.')
      const payload = { ...petForm, owner_id: myOwner.owner_id }
      await api.createPet(payload)
      setMessage('Pet added successfully')
      api.getPets().then(setPets)
      setPetForm({ owner_id:'', name:'', species:'', breed:'', age:'', gender:'Unknown' })
    }catch(err){ setMessage(err.message || String(err)) }
  }

  return (
    <div>
      <h3>Add Pet</h3>
      <form onSubmit={submitPet} style={{marginBottom:20}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <label>Pet name<input value={petForm.name} onChange={e=>setPetForm({...petForm,name:e.target.value})} /></label>
          <label>Species<input value={petForm.species} onChange={e=>setPetForm({...petForm,species:e.target.value})} /></label>
          <label>Breed<input value={petForm.breed} onChange={e=>setPetForm({...petForm,breed:e.target.value})} /></label>
          <label>Age<input value={petForm.age} onChange={e=>setPetForm({...petForm,age:e.target.value})} /></label>
          <label>Gender<select value={petForm.gender} onChange={e=>setPetForm({...petForm,gender:e.target.value})}><option>Unknown</option><option>Male</option><option>Female</option></select></label>
        </div>
        <button type="submit" style={{marginTop:12}}>Add Pet</button>
      </form>

      <h3 style={{marginTop:24}}>My Pets</h3>
      <div>
        {myPets.length===0 ? <div>No pets yet</div> : (
          myPets.map(p=> (
            <div key={p.pet_id} className="list-item">{p.name} — {p.species} ({p.breed})</div>
          ))
        )}
      </div>

      {message && <div style={{marginTop:12}}>{message}</div>}
    </div>
  )
}
