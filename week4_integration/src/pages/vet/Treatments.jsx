import { useState, useEffect } from 'react';
import { treatmentAPI } from '../../services/api';

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await treatmentAPI.getAll();
        setTreatments(response.data);
      } catch (err) {
        console.error('Failed to fetch treatments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <div className="min-h-screen max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Treatments</h1>
      <div className="space-y-4">
        {treatments.map((treatment) => (
          <div key={treatment.record_id} className="bg-white border rounded p-4">
            <p className="text-gray-600">Appointment: {treatment.appointment_id}</p>
            <p className="text-sm">Date: {treatment.date}</p>
            <p className="text-sm">Diagnosis: {treatment.diagnosis}</p>
            <p className="text-sm">Note: {treatment.note}</p>
          </div>
        ))}
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Treatments;
