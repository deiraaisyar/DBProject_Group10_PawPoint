import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completed: 0,
    scheduled: 0,
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentAPI.getAll();
        const data = response.data;
        setAppointments(data);
        setStats({
          totalAppointments: data.length,
          completed: data.filter(a => a.status === 'completed').length,
          scheduled: data.filter(a => a.status === 'scheduled').length,
        });
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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
            👨‍⚕️ Veterinarian Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your appointments and patient care</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <h3 className="text-lg font-semibold">All Appointments</h3>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-3xl">⏳</span>
              </div>
              <div className="text-right">
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{stats.scheduled}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Scheduled</h3>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-3xl">✅</span>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Completed</h3>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📋</span>
              My Appointments
            </h2>
            <p className="text-purple-100 mt-1">All your scheduled and completed appointments</p>
          </div>

          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">✅</span>
                <p className="text-xl font-semibold text-gray-700">No appointments</p>
                <p className="text-gray-500 mt-2">You're all caught up!</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
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
                            <span className="text-gray-500 font-medium">👤 Owner:</span>
                            <span className="text-gray-700 font-semibold">{apt.owner_name || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                          apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status}
                        </span>
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
