import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <div className="min-h-screen max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.appointment_id} className="bg-white border rounded p-4">
            <h3 className="font-semibold">{apt.pet_name} - {apt.clinic_name}</h3>
            <p className="text-gray-600">Date: {apt.datetime}</p>
            <p className="text-sm">Status: <span className="font-semibold">{apt.status}</span></p>
          </div>
        ))}
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Appointments;
