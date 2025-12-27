import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (email, password) => api.post('/login', { email, password }),
  profile: () => api.get('/profile'),
};

// Pet endpoints
export const petAPI = {
  getAll: () => api.get('/pets'),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
};

// Appointment endpoints
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
};

// Treatment endpoints
export const treatmentAPI = {
  getAll: () => api.get('/treatments'),
  getById: (id) => api.get(`/treatments/${id}`),
  create: (data) => api.post('/treatments', data),
  update: (id, data) => api.put(`/treatments/${id}`, data),
};

// Veterinarian endpoints
export const vetAPI = {
  getAll: () => api.get('/veterinarians'),
  getById: (id) => api.get(`/veterinarians/${id}`),
  create: (data) => api.post('/veterinarians', data),
  getByClinic: (clinicId) => api.get(`/veterinarians/clinic/${clinicId}`),
  getSchedules: (vetId) => api.get(`/veterinarians/${vetId}/schedules`),
  createSchedule: (data) => api.post('/veterinarian-schedules', data),
};

// Clinic endpoints
export const clinicAPI = {
  getAll: () => api.get('/clinics'),
  getById: (id) => api.get(`/clinics/${id}`),
  create: (data) => api.post('/clinics', data),
  update: (id, data) => api.put(`/clinics/${id}`, data),
};

// User endpoints
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
};

// Owner endpoints
export const ownerAPI = {
  getAll: () => api.get('/owners'),
  create: (data) => api.post('/owners', data),
};

// Reports endpoints
export const reportsAPI = {
  appointmentsByStatus: () => api.get('/reports/appointments/status'),
  appointmentsByClinic: () => api.get('/reports/appointments/clinic'),
  treatments: () => api.get('/reports/treatments'),
};

export default api;
