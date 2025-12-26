import { useState } from 'react';
import { vetAPI } from '../../services/api';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    day: 'monday',
    time_start: '09:00',
    time_end: '17:00',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await vetAPI.createSchedule(formData);
      setFormData({ day: 'monday', time_start: '09:00', time_end: '17:00' });
      setShowForm(false);
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
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
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
