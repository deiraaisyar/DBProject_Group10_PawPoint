import { useEffect, useState } from 'react';
import { vetAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Schedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentVetId, setCurrentVetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    day: 'monday',
    time_start: '09:00',
    time_end: '17:00',
  });

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Load the logged-in vet's veterinarian_id and their schedules
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Find veterinarian record for the current user
        const vetsRes = await vetAPI.getAll();
        console.log('All vets:', vetsRes.data);
        console.log('Current user:', user);
        
        const me = vetsRes.data.find(v => v.user_id === user?.user_id);
        console.log('Found vet record:', me);
        
        if (me) {
          setCurrentVetId(me.veterinarian_id);
          // Load existing schedules
          const schedRes = await vetAPI.getSchedules(me.veterinarian_id);
          // Sort schedules by day of week
          const sorted = (schedRes.data || []).sort((a, b) => {
            return dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase());
          });
          setSchedules(sorted);
        } else {
          console.error('No veterinarian record found for user_id:', user?.user_id);
          // Show helpful error message
          alert('⚠️ Veterinarian profile not found. Please make sure:\n\n1. You registered with a valid license number\n2. Your license is registered in the system\n3. You have the veterinarian role\n\nPlease contact administrator if the problem persists.');
        }
      } catch (err) {
        console.error('Failed to initialize vet schedule page:', err);
        alert('❌ Failed to load schedule. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.user_id) {
      init();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      if (!currentVetId) {
        alert('Unable to determine your veterinarian ID. Please re-login.');
        return;
      }

      // Validate time
      if (formData.time_start >= formData.time_end) {
        alert('⚠️ End time must be after start time!');
        return;
      }

      // Check if schedule already exists for this day
      const existingSchedule = schedules.find(
        s => s.day.toLowerCase() === formData.day.toLowerCase()
      );
      if (existingSchedule) {
        alert('⚠️ You already have a schedule for this day. Please edit or delete it first.');
        return;
      }

      // Normalize payload with veterinarian_id and lowercase day
      const payload = {
        day: formData.day.toLowerCase(),
        time_start: formData.time_start,
        time_end: formData.time_end,
        veterinarian_id: currentVetId,
      };
      await vetAPI.createSchedule(payload);
      // Reset and refresh
      setFormData({ day: 'monday', time_start: '09:00', time_end: '17:00' });
      setShowForm(false);
      const schedRes = await vetAPI.getSchedules(currentVetId);
      const sorted = (schedRes.data || []).sort((a, b) => {
        return dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase());
      });
      setSchedules(sorted);
      alert('✅ Schedule added successfully!');
    } catch (err) {
      console.error('Failed to add schedule:', err);
      
      // Get detailed error message from backend
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      console.error('Error details:', errorMsg);
      
      alert(`❌ Failed to add schedule:\n\n${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text mb-2">
            📅 My Work Schedule
          </h1>
          <p className="text-gray-600 text-lg">Manage your availability and working hours</p>
        </div>

        {/* Add Schedule Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${
              showForm 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            } text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            {showForm ? '✖ Cancel' : '➕ Add New Schedule'}
          </button>
        </div>

        {/* Add Schedule Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🆕</span>
              Add New Schedule
            </h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📆 Day of Week
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className="w-full border-2 border-purple-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {dayOrder.map(day => (
                    <option key={day} value={day}>{dayNames[day]}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⏰ Start Time
                  </label>
                  <input
                    type="time"
                    name="time_start"
                    value={formData.time_start}
                    onChange={handleChange}
                    className="w-full border-2 border-purple-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⏰ End Time
                  </label>
                  <input
                    type="time"
                    name="time_end"
                    value={formData.time_end}
                    onChange={handleChange}
                    className="w-full border-2 border-purple-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                ✅ Save Schedule
              </button>
            </form>
          </div>
        )}

        {/* Schedules List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🗓️</span>
              Current Schedule
            </h2>
            <p className="text-purple-100 mt-1">Total: {schedules.length} day(s) scheduled</p>
          </div>

          <div className="p-6">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-xl font-semibold text-gray-700">No schedule added yet</p>
                <p className="text-gray-500 mt-2">Click "Add New Schedule" to set your working hours</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map((schedule, idx) => (
                  <div 
                    key={idx} 
                    className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 capitalize">
                        {dayNames[schedule.day.toLowerCase()] || schedule.day}
                      </h3>
                      <span className="text-2xl">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(schedule.day.toLowerCase()) ? '💼' : '🌟'}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">⏰</span>
                        <span className="font-mono text-lg">
                          {schedule.time_start} - {schedule.time_end}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {(() => {
                          const start = schedule.time_start.split(':');
                          const end = schedule.time_end.split(':');
                          const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
                          const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
                          const durationMinutes = endMinutes - startMinutes;
                          const hours = Math.floor(durationMinutes / 60);
                          const minutes = durationMinutes % 60;
                          return `Duration: ${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
                        })()}
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

export default Schedule;
