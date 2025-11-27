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

  // hide certain items for admin (e.g., My Pets is not relevant)
  const itemsToShow = menuItems.filter(item => !(user?.role === 'admin' && item.id === 'pets'))

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
