import React from 'react'

export default function NavBar({ active, onChange }){
  return (
    <div className="nav" role="tablist">
      <button aria-pressed={active==='petowner'} onClick={()=>onChange('petowner')}>Pet Owner</button>
      <button aria-pressed={active==='vet'} onClick={()=>onChange('vet')}>Veterinarian</button>
      <button aria-pressed={active==='admin'} onClick={()=>onChange('admin')}>Admin</button>
    </div>
  )
}
