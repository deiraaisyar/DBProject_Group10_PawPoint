import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { petAPI } from '../../services/api';

const PetDetail = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await petAPI.getById(petId);
        setPet(response.data);
      } catch (err) {
        console.error('Failed to fetch pet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-700">🐾 Pet not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>

          {/* Content */}
          <div className="p-10">
            {/* Pet Icon */}
            <div className="text-center mb-8">
              <span className="text-7xl block mb-4">🐾</span>
            </div>

            {/* Pet Name - LARGE AND PROMINENT */}
            <div className="text-center mb-10 pb-8 border-b-2 border-gray-100">
              <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
                {pet.name}
              </h1>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Species */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-l-4 border-purple-600">
                <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">🦴 Species</p>
                <p className="text-3xl font-bold text-gray-800">{pet.species}</p>
              </div>

              {/* Breed */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-l-4 border-pink-600">
                <p className="text-sm font-bold text-pink-600 uppercase tracking-wider mb-2">📝 Breed</p>
                <p className="text-3xl font-bold text-gray-800">{pet.breed || '-'}</p>
              </div>

              {/* Gender */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-l-4 border-blue-600">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">👫 Gender</p>
                <p className="text-3xl font-bold text-gray-800 capitalize">{pet.gender}</p>
              </div>

              {/* Age */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-l-4 border-green-600">
                <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">🎂 Age</p>
                <p className="text-3xl font-bold text-gray-800">{pet.age} years</p>
              </div>
            </div>

            {/* Birth Date - Full Width & PROMINENT */}
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-8 border-l-4 border-yellow-500 border-r-4 border-orange-500">
              <p className="text-sm font-bold text-yellow-700 uppercase tracking-wider mb-3">📅 Birth Date</p>
              <p className="text-4xl font-black text-gray-800">{formatDate(pet.birth_date)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;
