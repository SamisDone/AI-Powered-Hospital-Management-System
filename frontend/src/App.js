import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Doctor Pages
import DoctorAvailability from './pages/DoctorAvailability';
import DoctorSearch from './pages/DoctorSearch';
import DoctorSlots from './pages/DoctorSlots';

// Appointment Pages
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';

import './App.css';

const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={currentUser ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/verify-email" 
        element={currentUser ? <VerifyEmail /> : <Navigate to="/login" replace />} 
      />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/doctors/search"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DoctorSearch />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctors/:doctorId/slots"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DoctorSlots />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments/book/:doctorId"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAvailability />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Appointments />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Manage Doctors - Coming Soon</div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Appointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Manage Users - Coming Soon</div>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
