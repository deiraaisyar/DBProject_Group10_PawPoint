import React, { useState } from 'react'
import '../styles/login.css'

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('pet_owner')
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      // For demo: just validate and store in localStorage
      if (!email || !password) {
        setError('Email and password required')
        return
      }
      const user = {
        id: Math.random(),
        email,
        username: email.split('@')[0],
        role: 'pet_owner' // In real app, get from backend
      }
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', 'demo-token-' + Date.now())
      onLoginSuccess(user)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    try {
      if (!username || !email || !password) {
        setError('All fields required')
        return
      }
      const user = {
        id: Math.random(),
        email,
        username,
        role
      }
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', 'demo-token-' + Date.now())
      onLoginSuccess(user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🐾 PawPoint</h1>
          <p>Veterinary Appointment System</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <h2>Login to Your Account</h2>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </label>
            <button type="submit" className="btn-primary">
              Login Now
            </button>
            <div className="toggle-auth">
              Don't have an account?{' '}
              <a onClick={() => { setIsLogin(false); setError(''); }}>
                Register here
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2>Create Your Account</h2>
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="john_doe"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </label>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="pet_owner">Pet Owner</option>
                <option value="vet">Veterinarian</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button type="submit" className="btn-primary">
              Register Now
            </button>
            <div className="toggle-auth">
              Already have an account?{' '}
              <a onClick={() => { setIsLogin(true); setError(''); }}>
                Login here
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
