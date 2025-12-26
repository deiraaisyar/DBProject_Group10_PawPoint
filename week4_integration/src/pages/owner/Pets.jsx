import { useState, useEffect } from 'react';
import { petAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: 'male',
    birth_date: '',
    age: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await petAPI.getAll();
      setPets(response.data);
    } catch (err) {
      console.error('Failed to fetch pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      await petAPI.create(formData);
      alert('Pet added successfully!');
      setFormData({ name: '', species: '', breed: '', gender: 'male', birth_date: '', age: 0 });
      setShowForm(false);
      fetchPets();
    } catch (err) {
      console.error('Failed to add pet:', err);
      alert('Failed to add pet');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Pets...</p>
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
              🐾 My Pets
            </h1>
            <p className="text-gray-600 text-lg">Manage your beloved pets</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg transform hover:scale-105"
          >
            {showForm ? '✕ Cancel' : '+ Add Pet'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Pet</h2>
            <form onSubmit={handleAddPet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🐾 Pet Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Buddy"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🦴 Species *</label>
                  <input
                    type="text"
                    name="species"
                    placeholder="e.g., Dog, Cat"
                    value={formData.species}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Breed</label>
                  <input
                    type="text"
                    name="breed"
                    placeholder="e.g., Golden Retriever"
                    value={formData.breed}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">👫 Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Birth Date</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🎂 Age (years)</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="0"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-md transform hover:scale-105"
              >
                ✓ Save Pet
              </button>
            </form>
          </div>
        )}

        {/* Pets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg">
              <span className="text-6xl mb-4 block">🐾</span>
              <p className="text-xl font-semibold text-gray-700">No pets yet</p>
              <p className="text-gray-500 mt-2">Add your first pet to get started!</p>
            </div>
          ) : (
            pets.map((pet) => (
              <div
                key={pet.pet_id}
                onClick={() => navigate(`/owner/pets/${pet.pet_id}`)}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition cursor-pointer transform hover:scale-105"
              >
                <div className="mb-4">
                  <span className="text-4xl">🐾</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{pet.name}</h3>
                <div className="space-y-2 text-purple-100">
                  <p className="flex items-center gap-2">
                    <span>🦴</span> {pet.species} {pet.breed && `• ${pet.breed}`}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>👫</span> {pet.gender}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🎂</span> {pet.age} years old
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Pets;
