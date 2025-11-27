const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

async function fetchJson(path, opts){
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(await res.text())
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export async function getUsers(){ return fetchJson('/users') }
export async function createUser(data){ return fetchJson('/users', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }) }

export async function getOwners(){ return fetchJson('/owners') }
export async function createOwner(data){ return fetchJson('/owners', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }) }

export async function createPet(data){ return fetchJson('/pets', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }) }
export async function getAppointmentList(){ return fetchJson('/appointments') }
export async function createAppointment(data){ return fetchJson('/appointments', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }) }

export async function getVets(){ return fetchJson('/vets') }
export async function getClinics(){ return fetchJson('/clinics') }
export async function createClinic(data){ return fetchJson('/clinics', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }) }

export async function createTreatment(data){ return fetchJson('/treatment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }) }

export async function getPets(){ return fetchJson('/pets') }
export async function getPet(id){ return fetchJson(`/pets/${id}`) }
export async function updateAppointment(id, data){ return fetchJson(`/appointments/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }) }

export async function getAppointmentByVet(vetId){ return fetchJson(`/appointments?vets=${vetId}`) }

export default { getUsers, createUser, getOwners, createOwner, createPet, getPets, getPet, getAppointmentList, getAppointmentByVet, createAppointment, getVets, getClinics, createClinic, createTreatment, updateAppointment }
