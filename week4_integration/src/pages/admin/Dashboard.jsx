import { useState, useEffect } from 'react';
import { appointmentAPI, userAPI, clinicAPI, treatmentAPI } from '../../services/api';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalUsers: 0,
    totalClinics: 0,
    totalTreatments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appointmentsRes, usersRes, clinicsRes, treatmentsRes] = await Promise.all([
          appointmentAPI.getAll(),
          userAPI.getAll(),
          clinicAPI.getAll(),
          treatmentAPI.getAll(),
        ]);
        
        const allAppointments = appointmentsRes.data;
        const pending = allAppointments.filter(apt => apt.status === 'scheduled');
        
        setAppointments(pending);
        setStats({
          totalAppointments: allAppointments.length,
          pendingAppointments: pending.length,
          totalUsers: usersRes.data.length,
          totalClinics: clinicsRes.data.length,
          totalTreatments: treatmentsRes.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApproveReject = async (aptId, newStatus) => {
    try {
      await appointmentAPI.updateStatus(aptId, newStatus);
      setAppointments(appointments.filter(apt => apt.appointment_id !== aptId));
      setStats(prev => ({ ...prev, pendingAppointments: prev.pendingAppointments - 1 }));
    } catch (err) {
      console.error('Failed to update appointment:', err);
      alert('Failed to update appointment status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text mb-2">
            🏠 Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage appointments and monitor system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-3xl">📅</span>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold">{stats.totalAppointments}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Appointments</h3>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-3xl">⏳</span>
              </div>
              <div className="text-right">
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{stats.pendingAppointments}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">To Review</h3>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-3xl">👥</span>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm font-medium">Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Total Users</h3>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-3xl">🏥</span>
              </div>
              <div className="text-right">
                <p className="text-pink-100 text-sm font-medium">Clinics</p>
                <p className="text-3xl font-bold">{stats.totalClinics}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Active Clinics</h3>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>⏳</span>
              Pending Appointments
            </h2>
            <p className="text-purple-100 mt-1">Review and manage scheduled appointments</p>
          </div>

          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">✅</span>
                <p className="text-xl font-semibold text-gray-700">All caught up!</p>
                <p className="text-gray-500 mt-2">No pending appointments to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.appointment_id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-800">🐾 {apt.pet_name || 'Unknown Pet'}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">🏥 Clinic:</span>
                            <span className="text-gray-700 font-semibold">{apt.clinic_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">📅 Date:</span>
                            <span className="text-gray-700 font-semibold">
                              {apt.datetime ? new Date(apt.datetime).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">⏰ Time:</span>
                            <span className="text-gray-700 font-semibold">
                              {apt.datetime ? new Date(apt.datetime).toLocaleTimeString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">👤 Owner:</span>
                            <span className="text-gray-700 font-semibold">{apt.owner_name || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-3">
                        <button
                          onClick={() => handleApproveReject(apt.appointment_id, 'completed')}
                          className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <span>✓</span>
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApproveReject(apt.appointment_id, 'cancelled')}
                          className="flex-1 md:flex-none bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <span>✕</span>
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Dashboard;
