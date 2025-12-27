import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import logo from '../../assets/logopaw.svg';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });
      const response = await authAPI.login(formData.email, formData.password);
      console.log('Login response:', response.data);
      
      const userData = {
        user_id: response.data.user_id,
        role: response.data.role,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: formData.email,
      };
      
      login(userData, response.data.access_token);
      
      // Redirect based on role
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else if (response.data.role === 'veterinarian') {
        navigate('/vet');
      } else {
        navigate('/owner');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMsg);
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
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back!</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-lg
                         hover:from-purple-700 hover:to-pink-700 transition shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700 transition">
                Register here
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

export default Login;
