import { useState, useEffect } from 'react';
import { appointmentAPI, petAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalPets: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pets = await petAPI.getAll();
        const appointments = await appointmentAPI.getAll();
        setStats({
          totalPets: pets.data.length,
          appointments: appointments.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <div className="min-h-screen max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-6 rounded">
          <h2 className="text-xl font-semibold">Total Pets</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalPets}</p>
        </div>
        <div className="bg-green-100 p-6 rounded">
          <h2 className="text-xl font-semibold">Appointments</h2>
          <p className="text-3xl font-bold text-green-600">{stats.appointments}</p>
        </div>
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Dashboard;
