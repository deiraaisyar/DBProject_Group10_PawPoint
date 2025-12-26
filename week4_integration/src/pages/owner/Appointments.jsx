import { useState, useEffect } from 'react';
import { appointmentAPI, petAPI, clinicAPI, vetAPI } from '../../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [vets, setVets] = useState([]);
  const [vetSchedules, setVetSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVet, setSelectedVet] = useState('');
  const [formData, setFormData] = useState({
    pet_id: '',
    clinic_id: '',
    veterinarian_id: '',
    datetime: '',
    status: 'scheduled',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedVet) {
      fetchVetSchedules(selectedVet);
    }
  }, [selectedVet]);

  const fetchAllData = async () => {
    try {
      const [appointmentsRes, petsRes, clinicsRes, vetsRes] = await Promise.all([
        appointmentAPI.getAll(),
        petAPI.getAll(),
        clinicAPI.getAll(),
        vetAPI.getAll(),
      ]);
      setAppointments(appointmentsRes.data);
      setPets(petsRes.data);
      setClinics(clinicsRes.data);
      setVets(vetsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVetSchedules = async (vetId) => {
    try {
      const response = await vetAPI.getSchedules(vetId);
      setVetSchedules(response.data);
      console.log('Vet schedules loaded:', response.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setVetSchedules([]);
    }
  };

  // Validate if datetime is within vet's working schedule
  const validateDatetimeWithSchedule = (datetimeStr, schedules) => {
    if (!datetimeStr || schedules.length === 0) return true; // Allow if no schedules to validate
    
    const appointmentDate = new Date(datetimeStr);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[appointmentDate.getDay()];
    const dayNameLower = dayName.toLowerCase();
    const appointmentTime = appointmentDate.toTimeString().slice(0, 5); // HH:mm format
    
    // Check if the selected day and time falls within any of the vet's schedules
    const hasValidSlot = schedules.some(schedule => {
      const scheduleDayLower = (schedule.day || '').toLowerCase();
      const isSameDay = scheduleDayLower === dayNameLower;
      const isWithinTime = appointmentTime >= schedule.time_start && appointmentTime <= schedule.time_end;
      return isSameDay && isWithinTime;
    });
    
    return hasValidSlot;
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    
    // Validate datetime with vet schedule
    if (selectedVet && vetSchedules.length > 0) {
      if (!validateDatetimeWithSchedule(formData.datetime, vetSchedules)) {
        alert('❌ Selected time is not within veterinarian\'s available schedule. Please select a time from the available schedule below.');
        return;
      }
    }
    
    try {
      await appointmentAPI.create(formData);
      alert('✅ Appointment created successfully!');
      setFormData({
        pet_id: '',
        clinic_id: '',
        veterinarian_id: '',
        datetime: '',
        status: 'scheduled',
      });
      setShowForm(false);
      setSelectedVet('');
      fetchAllData();
    } catch (err) {
      console.error('Failed to create appointment:', err);
      alert('Failed to create appointment');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'veterinarian_id') {
      setSelectedVet(value);
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
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
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text mb-2">
              📅 My Appointments
            </h1>
            <p className="text-gray-600 text-lg">Manage your pet's veterinary appointments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg transform hover:scale-105"
          >
            {showForm ? '✕ Cancel' : '+ Add Appointment'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book New Appointment</h2>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🐾 Select Pet *</label>
                  <select
                    name="pet_id"
                    value={formData.pet_id}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  >
                    <option value="">Choose a pet...</option>
                    {pets.map(pet => (
                      <option key={pet.pet_id} value={pet.pet_id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🏥 Select Clinic *</label>
                  <select
                    name="clinic_id"
                    value={formData.clinic_id}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  >
                    <option value="">Choose a clinic...</option>
                    {clinics.map(clinic => (
                      <option key={clinic.clinic_id} value={clinic.clinic_id}>
                        {clinic.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍⚕️ Select Veterinarian *</label>
                  <select
                    name="veterinarian_id"
                    value={formData.veterinarian_id}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  >
                    <option value="">Choose a veterinarian...</option>
                    {vets.map(vet => (
                      <option key={vet.veterinarian_id} value={vet.veterinarian_id}>
                        {vet.first_name} {vet.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="datetime"
                    value={formData.datetime}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  />
                  {formData.datetime && selectedVet && vetSchedules.length > 0 && (
                    <div className="mt-2">
                      {validateDatetimeWithSchedule(formData.datetime, vetSchedules) ? (
                        <p className="text-sm text-green-600 font-semibold">✅ Time is available for this veterinarian</p>
                      ) : (
                        <p className="text-sm text-red-600 font-semibold">❌ Time is NOT available for this veterinarian</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedVet && vetSchedules.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⏰</span>
                    <p className="text-sm font-bold text-gray-800">Available Schedule:</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {vetSchedules.map((schedule, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                        <p className="text-sm font-semibold text-blue-900">{schedule.day}</p>
                        <p className="text-sm text-blue-700">🕐 {schedule.time_start} - {schedule.time_end}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3 italic">ℹ️ Please select appointment within these available time slots</p>
                </div>
              )}

              {selectedVet && vetSchedules.length === 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">⚠️ No schedule available for this veterinarian yet.</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-md transform hover:scale-105"
              >
                ✓ Book Appointment
              </button>
            </form>
          </div>
        )}

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
                <span className="text-6xl mb-4 block">📅</span>
                <p className="text-xl font-semibold text-gray-700">No appointments yet</p>
                <p className="text-gray-500 mt-2">Book your first appointment today!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.appointment_id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-3 py-1 text-sm font-bold">
                            #{apt.appointment_id}
                          </div>
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
                            <span className="text-gray-500 font-medium">⏰ Time:</span>
                            <span className="text-gray-700 font-semibold">
                              {apt.datetime ? new Date(apt.datetime).toLocaleTimeString() : 'N/A'}
                            </span>
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

export default Appointments;
