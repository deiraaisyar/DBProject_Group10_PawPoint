import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [];
    }

    const role = user?.role;

    if (role === 'pet_owner') {
      return [
        { label: 'Dashboard', path: '/owner/dashboard' },
        { label: 'My Pets', path: '/owner/pets' },
        { label: 'Appointments', path: '/owner/appointments' },
      ];
    }

    if (role === 'veterinarian') {
      return [
        { label: 'Dashboard', path: '/vet/dashboard' },
        { label: 'Appointments', path: '/vet/appointments' },
        { label: 'Treatments', path: '/vet/treatments' },
        { label: 'Schedule', path: '/vet/schedule' },
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Clinics', path: '/admin/clinics' },
        { label: 'Reports', path: '/admin/reports' },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:scale-105 transition">
            <span className="text-3xl">🐾</span> PawPoint
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Info & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-white text-sm">
                  <span className="font-semibold">{user?.first_name}</span>
                  <span className="text-purple-100 ml-2">({user?.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:bg-white/20 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md text-sm font-medium transition shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:bg-white/20 p-2 rounded-md transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gradient-to-b from-purple-700 to-pink-700 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 block px-3 py-2 rounded-md text-base font-medium transition"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-purple-400/50 mt-4 pt-4 px-3">
              {isAuthenticated ? (
                <>
                  <div className="text-white text-sm mb-3">
                    <span className="font-semibold block">{user?.first_name}</span>
                    <span className="text-purple-100 text-xs capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block text-center bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md text-sm font-medium transition shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
