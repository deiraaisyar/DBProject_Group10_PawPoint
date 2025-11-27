import React, { useEffect, useState } from 'react'
import '../styles/dashboard.css'
import api from '../api'

export default function Dashboard({ user, activePage, onNavigate }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 })

  useEffect(() => {
    // Fetch stats based on user role
    async function fetchStats() {
      try {
        if (user?.role === 'pet_owner') {
          const appts = await api.getAppointmentList()
          setStats({
            total: appts.length,
            pending: appts.filter(a => a.status === 'Scheduled').length,
            completed: appts.filter(a => a.status === 'Completed').length
          })
        } else if (user?.role === 'vet') {
          const appts = await api.getAppointmentList()
          setStats({
            total: appts.length,
            pending: appts.filter(a => a.status === 'Scheduled').length,
            completed: appts.filter(a => a.status === 'Completed').length
          })
        } else if (user?.role === 'admin') {
          const users = await api.getUsers()
          setStats({
            total: users.length,
            pending: 0,
            completed: 0
          })
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    fetchStats()
  }, [user])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.username}!</h1>
          <p>Here's what's happening with your clinic today</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('appointments')}>
          + New Appointment
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Total Appointments</div>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <p className="stat-number">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <p className="stat-number">{stats.completed}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div>
                <p><strong>New pet registered</strong></p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <div>
                <p><strong>Appointment scheduled</strong></p>
                <small>4 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <div>
                <p><strong>Appointment completed</strong></p>
                <small>1 day ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
