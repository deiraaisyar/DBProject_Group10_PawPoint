import { useState, useEffect } from 'react';
import { reportsAPI, appointmentAPI, treatmentAPI } from '../../services/api';

const Reports = () => {
  const [statusReport, setStatusReport] = useState([]);
  const [clinicReport, setClinicReport] = useState([]);
  const [treatmentReport, setTreatmentReport] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [status, clinic, treatmentReports, appointmentList, treatmentList] = await Promise.all([
          reportsAPI.appointmentsByStatus(),
          reportsAPI.appointmentsByClinic(),
          reportsAPI.treatments(),
          appointmentAPI.getAll(),
          treatmentAPI.getAll(),
        ]);
        
        // Debug: Log data structure
        console.log('Appointments data:', appointmentList.data);
        console.log('First appointment:', appointmentList.data[0]);
        console.log('Treatments data:', treatmentList.data);
        console.log('First treatment:', treatmentList.data[0]);
        
        setStatusReport(status.data);
        setClinicReport(clinic.data);
        setTreatmentReport(treatmentReports.data);
        setAppointments(appointmentList.data);
        setTreatments(treatmentList.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Reports...</p>
        </div>
      </div>
    );
  }

  const totalAppointments = statusReport.reduce((sum, item) => sum + parseInt(item.total || 0), 0);
  const totalTreatments = treatments.length;
  const totalClinics = clinicReport.length;

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: '📅',
      completed: '✅',
      cancelled: '❌',
      pending: '⏳',
    };
    return icons[status?.toLowerCase()] || '📋';
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text mb-2">
            📊 Reports & Analytics
          </h1>
          <p className="text-gray-600 text-lg">Comprehensive overview of appointments, clinics, and treatments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-4xl">📅</span>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-medium">Total</p>
                <p className="text-4xl font-bold">{totalAppointments}</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold">Appointments</h3>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-4xl">🏥</span>
              </div>
              <div className="text-right">
                <p className="text-pink-100 text-sm font-medium">Active</p>
                <p className="text-4xl font-bold">{totalClinics}</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold">Clinics</h3>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <span className="text-4xl">💊</span>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm font-medium">Total</p>
                <p className="text-4xl font-bold">{totalTreatments}</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold">Treatments</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
              activeTab === 'appointments'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📅 Appointments
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
              activeTab === 'treatments'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💊 Treatments
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments by Status */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>📊</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Appointments by Status
                </span>
              </h3>
              <div className="space-y-4">
                {statusReport.map((item) => (
                  <div key={item.status} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getStatusIcon(item.status)}</span>
                        <span className="font-semibold text-gray-700 capitalize">{item.status}</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 group-hover:from-purple-600 group-hover:to-pink-600"
                        style={{ width: `${(item.total / totalAppointments) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((item.total / totalAppointments) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments by Clinic */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>🏥</span>
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
                  Appointments by Clinic
                </span>
              </h3>
              <div className="space-y-4">
                {clinicReport.map((item, index) => (
                  <div key={item.clinic || index} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.clinic || 'Unknown Clinic'}</p>
                        <p className="text-sm text-gray-500">
                          {((item.total / totalAppointments) * 100).toFixed(1)}% of total appointments
                        </p>
                      </div>
                      <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
                          {item.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📅</span>
                Appointment History
              </h3>
              <p className="text-purple-100 mt-1">Complete list of all appointments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pet</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Clinic</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((apt, index) => (
                    <tr key={apt.appointment_id || index} className="hover:bg-purple-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {apt.datetime ? new Date(apt.datetime).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {apt.datetime ? new Date(apt.datetime).toLocaleTimeString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{apt.pet_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{apt.owner_name || apt.owner || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{apt.clinic_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                          {getStatusIcon(apt.status)}
                          <span className="capitalize">{apt.status || 'unknown'}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {appointments.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-lg font-semibold">No appointments found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>💊</span>
                Treatment History
              </h3>
              <p className="text-purple-100 mt-1">Complete list of all treatments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pet</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Diagnosis</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prescription</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Veterinarian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {treatments.map((treatment, index) => (
                    <tr key={treatment.appointment_id || index} className="hover:bg-purple-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {treatment.date ? new Date(treatment.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{treatment.pet_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{treatment.diagnosis || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{treatment.prescription || treatment.note || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{treatment.vet_name || treatment.veterinarian || 'N/A'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {treatments.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <span className="text-6xl mb-4 block">💊</span>
                <p className="text-lg font-semibold">No treatments found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    {/* Footer is rendered globally in App.jsx */}
    </>
  );
};

export default Reports;
