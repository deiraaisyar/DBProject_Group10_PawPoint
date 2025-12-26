import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
              <h1 className="text-5xl md:text-6xl font-extrabold">
                Welcome back, {user?.first_name}! 🐾
              </h1>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Your trusted companion for pet care management
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition text-white transform hover:scale-105">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-bold mb-2">Appointments</h3>
              <p className="text-purple-100">Manage your schedule easily</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition text-white transform hover:scale-105">
              <div className="text-5xl mb-4">🐾</div>
              <h3 className="text-2xl font-bold mb-2">My Pets</h3>
              <p className="text-pink-100">Keep track of your beloved pets</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition text-white transform hover:scale-105">
              <div className="text-5xl mb-4">⚕️</div>
              <h3 className="text-2xl font-bold mb-2">Health Records</h3>
              <p className="text-purple-100">Monitor pet health status</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user?.role === 'pet_owner' ? '/owner/dashboard' : user?.role === 'veterinarian' ? '/vet/dashboard' : '/admin/dashboard'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg
                         hover:from-purple-700 hover:to-pink-700 transition shadow-lg transform hover:scale-105"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-purple-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-8 bg-white rounded-full p-6 shadow-2xl">
            <div className="text-7xl md:text-8xl animate-bounce">🐾</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-transparent bg-clip-text drop-shadow-lg">
              PawPoint
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Your trusted veterinary appointment management system.<br/>
            Keep your pets healthy, happy, and cared for. 🐶🐱
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-semibold text-lg
                         hover:from-purple-700 hover:to-pink-700 transition shadow-lg transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-purple-600 px-10 py-4 rounded-xl font-semibold text-lg border-2 border-purple-600
                         hover:bg-purple-50 transition shadow-lg transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon="📅"
            title="Easy Scheduling"
            desc="Book and manage veterinary appointments with just a few clicks. Never miss an appointment!"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon="🐕"
            title="Pet Management"
            desc="Store and track your pets' information, medical history, and important dates securely."
            gradient="from-pink-500 to-rose-500"
          />
          <FeatureCard
            icon="🩺"
            title="Health Tracking"
            desc="Access treatment records, prescriptions, and appointment status in real-time."
            gradient="from-purple-600 to-indigo-600"
          />
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-12 mb-20 border-2 border-purple-200">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              Why Choose PawPoint?
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BenefitItem icon="🔐" text="Secure & private data protection" />
            <BenefitItem icon="👨‍⚕️" text="Connect with experienced veterinarians" />
            <BenefitItem icon="📱" text="Mobile-friendly responsive design" />
            <BenefitItem icon="⚡" text="Fast & reliable appointment booking" />
            <BenefitItem icon="📊" text="Detailed health reports & analytics" />
            <BenefitItem icon="🔔" text="Real-time notifications & reminders" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-purple-100 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of pet owners who trust PawPoint for their pet care needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 px-10 py-4 rounded-xl font-bold text-lg
                         hover:bg-gray-100 transition shadow-lg transform hover:scale-105"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg
                         hover:bg-white hover:text-purple-600 transition shadow-lg transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer is rendered globally in App.jsx */}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white`}>
    <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-white/90 leading-relaxed">{desc}</p>
  </div>
);

const BenefitItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition">
    <div className="text-3xl bg-gradient-to-r from-purple-500 to-pink-500 text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
      {icon}
    </div>
    <p className="text-gray-800 font-semibold text-lg">{text}</p>
  </div>
);

export default Landing;
