import { useState, useEffect } from 'react';
import { treatmentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Treatments = () => {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await treatmentAPI.getAll();
        // Filter treatments for current veterinarian only
        const myTreatments = response.data.filter(
          treatment => treatment.user_id === user?.user_id
        );
        setTreatments(myTreatments);
      } catch (err) {
        console.error('Failed to fetch treatments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchTreatments();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Treatments...</p>
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
            💊 Treatment Records
          </h1>
          <p className="text-gray-600 text-lg">View and manage all treatment records</p>
        </div>

        {/* Treatments List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📋</span>
              My Treatments
            </h2>
            <p className="text-purple-100 mt-1">Total: {treatments.length} treatment records</p>
          </div>

          <div className="p-6">
            {treatments.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">✅</span>
                <p className="text-xl font-semibold text-gray-700">No treatment records</p>
                <p className="text-gray-500 mt-2">Start treating patients to create records</p>
              </div>
            ) : (
              <div className="space-y-4">
                {treatments.map((treatment) => (
                  <div key={treatment.record_id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-800">🐾 {treatment.pet_name || 'Unknown Pet'}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">📅 Date:</span>
                            <span className="text-gray-700 font-semibold">{treatment.date || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">👨‍⚕️ Veterinarian:</span>
                            <span className="text-gray-700 font-semibold">{treatment.vet_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">🆔 License:</span>
                            <span className="text-gray-700 font-semibold">{treatment.license_no || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Diagnosis:</span> {treatment.diagnosis || 'N/A'}</p>
                          <p className="text-sm text-gray-600 mt-1"><span className="font-semibold text-gray-700">Notes:</span> {treatment.note || 'No notes'}</p>
                        </div>
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

export default Treatments;
