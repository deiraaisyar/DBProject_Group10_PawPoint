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

  if (loading) return <div>Loading...</div>;
  if (!pet) return <div>Pet not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">{pet.name}</h1>
      <div className="bg-white border rounded p-6 space-y-4">
        <div>
          <label className="font-semibold">Species:</label>
          <p>{pet.species}</p>
        </div>
        <div>
          <label className="font-semibold">Breed:</label>
          <p>{pet.breed}</p>
        </div>
        <div>
          <label className="font-semibold">Gender:</label>
          <p>{pet.gender}</p>
        </div>
        <div>
          <label className="font-semibold">Birth Date:</label>
          <p>{pet.birth_date}</p>
        </div>
        <div>
          <label className="font-semibold">Age:</label>
          <p>{pet.age} years</p>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;
