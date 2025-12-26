import { useEffect, useState } from 'react';
import { vetAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Schedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentVetId, setCurrentVetId] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    time_start: '09:00',
    time_end: '17:00',
  });

  // Load the logged-in vet's veterinarian_id and their schedules
  useEffect(() => {
    const init = async () => {
      try {
        // Find veterinarian record for the current user
        const vetsRes = await vetAPI.getAll();
        const me = vetsRes.data.find(v => v.user_id === user?.user_id);
        if (me) {
          setCurrentVetId(me.veterinarian_id);
          // Load existing schedules
          const schedRes = await vetAPI.getSchedules(me.veterinarian_id);
          setSchedules(schedRes.data || []);
        }
      } catch (err) {
        console.error('Failed to initialize vet schedule page:', err);
      }
    };
    init();
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
      // Normalize payload with veterinarian_id and capitalized day
      const payload = {
        day: formData.day,
        time_start: formData.time_start,
        time_end: formData.time_end,
        veterinarian_id: currentVetId,
      };
      await vetAPI.createSchedule(payload);
      // Reset and refresh
      setFormData({ day: 'Monday', time_start: '09:00', time_end: '17:00' });
      setShowForm(false);
      const schedRes = await vetAPI.getSchedules(currentVetId);
      setSchedules(schedRes.data || []);
    } catch (err) {
      console.error('Failed to add schedule:', err);
    }
  };

  return (
    <>
    <div className="min-h-screen max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Work Schedule</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {showForm ? 'Cancel' : 'Add Schedule'}
      </button>

      {showForm && (
        <form onSubmit={handleAddSchedule} className="bg-gray-100 p-4 rounded mb-4 space-y-4">
          <select
            name="day"
            value={formData.day}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
          <input
            type="time"
            name="time_start"
            value={formData.time_start}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="time"
            name="time_end"
            value={formData.time_end}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Save Schedule
          </button>
        </form>
      )}

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <p className="text-gray-600">No schedules added yet</p>
        ) : (
          schedules.map((schedule, idx) => (
            <div key={idx} className="bg-white border rounded p-4">
              <p className="font-semibold capitalize">{schedule.day}</p>
              <p className="text-sm text-gray-600">
                {schedule.time_start} - {schedule.time_end}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Schedule;
