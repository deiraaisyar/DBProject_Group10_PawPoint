import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, clinicAPI } from '../../services/api';
import logo from '../../assets/logopaw.svg';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_no: '',
    role: 'owner',
    license_no: '',
    clinic_id: '',
  });
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      setLoadingClinics(true);
      try {
        const res = await clinicAPI.getAll();
        setClinics(res.data || []);
      } catch (err) {
        console.error('Failed to load clinics', err);
        setError('Failed to load clinics. Please refresh and try again.');
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset veterinarian-only fields when switching to a non-vet role
    if (name === 'role' && value !== 'vet' && value !== 'veterinarian') {
      setFormData({
        ...formData,
        role: value,
        license_no: '',
        clinic_id: '',
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.role === 'vet' && (!formData.license_no || !formData.clinic_id)) {
      setError('License number and clinic/hospital are required for veterinarians.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        clinic_id: formData.clinic_id ? Number(formData.clinic_id) : undefined,
      };
      await authAPI.register(payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white w-24 h-24 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-3">
            <img src={logo} alt="PawPoint Logo" className="w-full h-full" />
          </div>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              PawPoint
            </span>
          </h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Get Started</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone_no"
                placeholder="+62 812 3456 7890"
                value={formData.phone_no}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
              >
                <option value="owner">Pet Owner</option>
                <option value="vet">Veterinarian</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">Admin accounts are provisioned by the company and cannot be registered here.</p>
            </div>

            {/* Conditional License Number field for Veterinarians */}
            {formData.role === 'vet' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                      👨‍⚕️ Veterinarian License Number *
                    </label>
                    <input
                      type="text"
                      name="license_no"
                      placeholder="e.g., VET-2024-12345"
                      value={formData.license_no}
                      onChange={handleChange}
                      required={formData.role === 'vet'}
                      className="w-full border-2 border-blue-300 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                    />
                    <p className="text-xs text-blue-700 mt-2">
                      ⚠️ Your license number must be registered in our system to create a veterinarian account.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                      🏥 Clinic / Hospital Affiliation *
                    </label>
                    <select
                      name="clinic_id"
                      value={formData.clinic_id}
                      onChange={handleChange}
                      required={formData.role === 'vet'}
                      disabled={loadingClinics}
                      className="w-full border-2 border-blue-300 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none bg-white disabled:opacity-60"
                    >
                      <option value="">{loadingClinics ? 'Loading clinics...' : 'Select clinic / hospital'}</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.clinic_id} value={clinic.clinic_id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-blue-700 mt-2">
                      Link your account to your current clinic or hospital.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-lg
                         hover:from-purple-700 hover:to-pink-700 transition shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 hover:text-purple-600 transition font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Register;
