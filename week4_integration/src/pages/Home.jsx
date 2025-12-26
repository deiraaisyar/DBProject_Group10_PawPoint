import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Footer is rendered globally in App.jsx

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, <span className="text-blue-600">{user?.first_name}</span>! 🐾
            </h1>
            <p className="text-xl text-gray-600">
              Your veterinary appointment management system
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule</h3>
              <p className="text-gray-600">Manage your appointments easily</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-2">🐾</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pets</h3>
              <p className="text-gray-600">Keep track of your beloved pets</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-2">⚕️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Health</h3>
              <p className="text-gray-600">Monitor pet health records</p>
            </div>
          </div>

          {/* Footer is rendered globally in App.jsx */}
    </>
  );
}
  // Unauthenticated view
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8 text-6xl md:text-7xl">🐾</div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">PawPoint</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your trusted veterinary appointment management system for pet care
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 text-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 text-lg"
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose PawPoint?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">Book appointments with just a few clicks</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your pet data is protected with encryption</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Vets</h3>
              <p className="text-gray-600">Connect with experienced veterinarians</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">Manage appointments on any device</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of pet owners who trust PawPoint for their pet care needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg transition"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-8 rounded-lg transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
      {/* Footer is rendered globally in App.jsx */}
    </div>
  );
}
