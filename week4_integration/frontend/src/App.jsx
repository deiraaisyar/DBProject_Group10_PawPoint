import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Owner pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerPets from './pages/owner/Pets';
import OwnerPetDetail from './pages/owner/PetDetail';
import OwnerAppointments from './pages/owner/Appointments';

// Vet pages
import VetDashboard from './pages/vet/Dashboard';
import VetAppointments from './pages/vet/Appointments';
import VetTreatments from './pages/vet/Treatments';
import VetSchedule from './pages/vet/Schedule';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminClinics from './pages/admin/Clinics';
import AdminReports from './pages/admin/Reports';

import './App.css';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-16">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

          {/* Owner routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute requiredRole="pet_owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/pets"
            element={
              <ProtectedRoute requiredRole="pet_owner">
                <OwnerPets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/pets/:petId"
            element={
              <ProtectedRoute requiredRole="pet_owner">
                <OwnerPetDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/appointments"
            element={
              <ProtectedRoute requiredRole="pet_owner">
                <OwnerAppointments />
              </ProtectedRoute>
            }
          />

          {/* Vet routes */}
          <Route
            path="/vet/dashboard"
            element={
              <ProtectedRoute requiredRole="veterinarian">
                <VetDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vet/appointments"
            element={
              <ProtectedRoute requiredRole="veterinarian">
                <VetAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vet/treatments"
            element={
              <ProtectedRoute requiredRole="veterinarian">
                <VetTreatments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vet/schedule"
            element={
              <ProtectedRoute requiredRole="veterinarian">
                <VetSchedule />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clinics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminClinics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

