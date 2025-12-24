import React from 'react'
import '../styles/sidebar.css'

export default function Sidebar({ user, onLogout, activePage, onChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pets', label: 'My Pets' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'vets', label: 'Veterinarians' },
    { id: 'clinics', label: 'Clinics' },
  ]

  // Admin sees more options
  if (user?.role === 'admin') {
    menuItems.push({ id: 'users', label: 'Users' })
    menuItems.push({ id: 'reports', label: 'Reports' })
  }

  // hide My Pets for admin; hide pets and appointments for non-petowner roles
  const itemsToShow = menuItems.filter(item => {
    if (user?.role === 'admin' && item.id === 'pets') return false
    if (user?.role === 'vet' && (item.id === 'pets' || item.id === 'appointments')) return false
    if (user?.role === 'pet_owner' && item.id === 'vets') return false
    if (user?.role === 'pet_owner' && item.id === 'clinics') return false
    return true
  })

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>PawPoint</h2>
      </div>

      <nav className="sidebar-nav">
        {itemsToShow.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.username || 'User'}</p>
            <p className="user-role">{user?.role || 'guest'}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
