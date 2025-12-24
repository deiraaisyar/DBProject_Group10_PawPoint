import React, { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'
import PetOwner from './pages/PetOwner'
import MyPets from './pages/MyPets'
import Appointments from './pages/Appointments'
import Veterinarian from './pages/Veterinarian'
import Admin from './pages/Admin'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')

  useEffect(() => {
    // Check if user is already logged in
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (err) {
        console.error('Failed to parse stored user:', err)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  function handleLoginSuccess(userData) {
    setUser(userData)
    setActivePage('dashboard')
  }

  function handleLogout() {
    setUser(null)
    setActivePage('dashboard')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={user} activePage={activePage} onNavigate={setActivePage} />
      case 'pets':
        return <MyPets />
      case 'appointments':
        return <Appointments />
      case 'vets':
        return <Veterinarian />
      case 'clinics':
        return <Veterinarian />
      case 'users':
        return <Admin />
      case 'reports':
        return <Admin />
      default:
        return <Dashboard user={user} activePage={activePage} onNavigate={setActivePage} />
    }
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        activePage={activePage}
        onChange={setActivePage}
      />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  )
}
