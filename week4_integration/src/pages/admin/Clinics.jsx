import { useState, useEffect } from 'react';
import { clinicAPI } from '../../services/api';

const Clinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    address: '',
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const response = await clinicAPI.getAll();
      setClinics(response.data);
    } catch (err) {
      console.error('Failed to fetch clinics:', err);
      alert('Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      if (editingClinic) {
        await clinicAPI.update(editingClinic.clinic_id, formData);
        alert('Clinic updated successfully!');
      } else {
        await clinicAPI.create(formData);
        alert('Clinic added successfully!');
      }
      setFormData({ name: '', phone_no: '', address: '' });
      setShowForm(false);
      setEditingClinic(null);
      fetchClinics();
    } catch (err) {
      console.error('Failed to save clinic:', err);
      alert('Failed to save clinic');
    }
  };

  const handleEdit = (clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      phone_no: clinic.phone_no || '',
      address: clinic.address || '',
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingClinic(null);
    setFormData({ name: '', phone_no: '', address: '' });
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text mb-2">
              🏥 Clinic Management
            </h1>
            <p className="text-gray-600 text-lg">Manage veterinary clinics in the system</p>
          </div>
          <button
            onClick={() => {
              if (showForm && !editingClinic) {
                handleCancelEdit();
              } else if (!showForm) {
                setShowForm(true);
              }
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition shadow-lg transform hover:scale-105 flex items-center gap-2 ${
              showForm && !editingClinic
                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {showForm && !editingClinic ? (
              <>
                <span>✕</span>
                <span>Cancel</span>
              </>
            ) : (
              <>
                <span>➕</span>
                <span>Add New Clinic</span>
              </>
            )}
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white mb-8 transform hover:scale-105 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-1">Total Clinics</p>
              <p className="text-5xl font-bold">{clinics.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <span className="text-6xl">🏥</span>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              {editingClinic ? '✏️ Edit Clinic' : '➕ Add New Clinic'}
            </h2>
            <form onSubmit={handleAddClinic} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🏥 Clinic Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter clinic name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📞 Phone Number</label>
                <input
                  type="tel"
                  name="phone_no"
                  placeholder="Enter phone number"
                  value={formData.phone_no}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Address</label>
                <textarea
                  name="address"
                  placeholder="Enter clinic address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>{editingClinic ? 'Update Clinic' : 'Save Clinic'}</span>
                </button>
                {editingClinic && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition shadow-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <div key={clinic.clinic_id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden border-2 border-purple-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">🏥</span>
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                    #{clinic.clinic_id}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{clinic.name}</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 font-medium">📞</span>
                    <span className="text-gray-700">{clinic.phone_no || 'No phone'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 font-medium">📍</span>
                    <span className="text-gray-700">{clinic.address || 'No address'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(clinic)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-md transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>✏️</span>
                  <span>Edit Clinic</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {clinics.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <span className="text-6xl mb-4 block">🏥</span>
            <p className="text-xl font-semibold text-gray-700 mb-2">No clinics yet</p>
            <p className="text-gray-500">Add your first clinic to get started</p>
          </div>
        )}
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Clinics;
