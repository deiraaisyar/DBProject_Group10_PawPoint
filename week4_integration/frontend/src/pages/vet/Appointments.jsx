import { useState, useEffect } from 'react';
import { appointmentAPI, treatmentAPI } from '../../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [treatmentData, setTreatmentData] = useState({
    diagnosis: '',
    note: '',
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentAPI.getAll();
        setAppointments(response.data);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      ));

      // If status changed to completed, show treatment form
      if (newStatus === 'completed') {
        setSelectedApt(appointmentId);
        setShowTreatmentForm(true);
      }

      alert(`Appointment status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update appointment status:', err);
      alert('Failed to update appointment status');
    }
  };

  const handleTreatmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await treatmentAPI.create({
        ...treatmentData,
        appointment_id: selectedApt,
      });

      alert('Treatment record created successfully!');
      setShowTreatmentForm(false);
      setTreatmentData({ diagnosis: '', note: '' });
      setSelectedApt(null);
    } catch (err) {
      console.error('Failed to create treatment:', err);
      alert('Treatment record may have been auto-created by trigger');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Treatment Form Modal */}
        {showTreatmentForm && selectedApt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <h3 className="text-2xl font-bold">📋 Add Treatment Record</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleTreatmentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Diagnosis *
                    </label>
                    <input
                      type="text"
                      value={treatmentData.diagnosis}
                      onChange={(e) => setTreatmentData({ ...treatmentData, diagnosis: e.target.value })}
                      placeholder="Enter diagnosis"
                      required
                      className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={treatmentData.note}
                      onChange={(e) => setTreatmentData({ ...treatmentData, note: e.target.value })}
                      placeholder="Enter treatment notes"
                      rows="4"
                      className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                      ✓ Save Treatment
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTreatmentForm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text mb-2">
            📅 Appointments
          </h1>
          <p className="text-gray-600 text-lg">Manage all your scheduled appointments</p>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📋</span>
              All Appointments
            </h2>
            <p className="text-purple-100 mt-1">Total: {appointments.length} appointments</p>
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

                      {apt.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(apt.appointment_id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition transform hover:scale-105"
                          >
                            ✓ Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.appointment_id, 'cancelled')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition transform hover:scale-105"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      )}
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

export default Appointments;
