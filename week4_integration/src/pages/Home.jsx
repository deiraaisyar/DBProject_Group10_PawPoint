import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            PawPoint
          </h1>
          <p className="text-blue-100 text-lg">
            Pet Care Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome! 👋
            </h2>
            <p className="text-gray-600">
              Manage your pet appointments with ease
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-center"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="block w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-lg border-2 border-purple-600 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 text-center"
            >
              Create Account
            </Link>
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">🐕</div>
                <p className="text-xs text-gray-600">Pet Management</p>
              </div>
              <div>
                <div className="text-2xl mb-1">📅</div>
                <p className="text-xs text-gray-600">Appointments</p>
              </div>
              <div>
                <div className="text-2xl mb-1">⚕️</div>
                <p className="text-xs text-gray-600">Vet Care</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6">
          © 2025 PawPoint. All rights reserved.
        </p>
      </div>
    </div>
  )
}
