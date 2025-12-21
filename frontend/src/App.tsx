import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FullPageLoader } from '@/components/ui/loading-spinner';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AIReportSummaryPage from '@/pages/AIReportSummaryPage';

// Dashboards
import PatientDashboard from '@/pages/patient/PatientDashboard';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Doctor Pages
import DoctorSearchPage from '@/pages/doctor/SearchPage';
import DoctorSlotsPage from '@/pages/doctor/SlotsPage';
import DoctorAvailabilityPage from '@/pages/doctor/AvailabilityPage';

// Admin Pages
import AdminUsersPage from '@/pages/admin/UsersPage';

// Appointment Pages
import AppointmentsPage from '@/pages/appointments/ListPage';
import BookAppointmentPage from '@/pages/appointments/BookPage';

// Additional Pages
import PrescriptionsPage from '@/pages/patient/PrescriptionsPage';
import MedicalRecordsPage from '@/pages/patient/MedicalRecordsPage';

import './index.css';

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={<LandingPage />} 
      />
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={currentUser ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
      />
      <Route 
        path="/verify-email" 
        element={currentUser ? <VerifyEmailPage /> : <Navigate to="/login" replace />} 
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/doctor/search"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DoctorSearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/:doctorId/slots"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DoctorSlotsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments/book/:doctorId"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointmentPage />
          </ProtectedRoute>
        }
      />

      {/* Prescriptions & Records */}
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute>
            <PrescriptionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records"
        element={
          <ProtectedRoute>
            <MedicalRecordsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-report-summary"
        element={
          <ProtectedRoute>
            <AIReportSummaryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAvailabilityPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <AppointmentsPage />
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
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardRedirect() {
  const { userProfile, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  if (userProfile?.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (userProfile?.role === 'doctor') {
    return <Navigate to="/dashboard/doctor" replace />;
  }
  return <Navigate to="/dashboard/patient" replace />;
}

import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="MediHub-theme">
        <AuthProvider>
          <AppRoutes />
          <Toaster 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
