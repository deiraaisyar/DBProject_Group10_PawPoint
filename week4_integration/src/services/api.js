const API_BASE_URL = 'http://localhost:5000'

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }
  
  return data
}

// Auth APIs
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    return handleResponse(response)
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    return handleResponse(response)
  },
}

// Token management
export const tokenManager = {
  setToken: (token) => {
    localStorage.setItem('token', token)
  },
  
  getToken: () => {
    return localStorage.getItem('token')
  },
  
  removeToken: () => {
    localStorage.removeItem('token')
  },
  
  setUserRole: (role) => {
    localStorage.setItem('role', role)
  },
  
  getUserRole: () => {
    return localStorage.getItem('role')
  },
  
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  },
}

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = tokenManager.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}
