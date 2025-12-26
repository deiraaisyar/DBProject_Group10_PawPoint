import { useState, useEffect } from 'react';
import { petAPI } from '../../services/api';

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
      setFormData({ name: '', species: '', breed: '', gender: 'male', birth_date: '', age: 0 });
      setShowForm(false);
      fetchPets();
    } catch (err) {
      console.error('Failed to add pet:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div>Loading...</div>;

  return (    <>    <div className="min-h-screen max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Pets</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {showForm ? 'Cancel' : 'Add Pet'}
      </button>

      {showForm && (
        <form onSubmit={handleAddPet} className="bg-gray-100 p-4 rounded mb-4 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Pet Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="species"
            placeholder="Species"
            value={formData.species}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="breed"
            placeholder="Breed"
            value={formData.breed}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Save Pet
          </button>
        </form>
      )}

      <div className="space-y-4">
        {pets.map((pet) => (
          <div key={pet.pet_id} className="bg-white border rounded p-4">
            <h3 className="text-xl font-semibold">{pet.name}</h3>
            <p className="text-gray-600">{pet.species} - {pet.breed}</p>
            <p className="text-sm text-gray-500">Age: {pet.age} | Gender: {pet.gender}</p>
          </div>
        ))}
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Pets;
