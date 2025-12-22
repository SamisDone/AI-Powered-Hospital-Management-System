import { 
  createRootRoute, 
  createRoute, 
  createRouter,
  Outlet,
  Navigate
} from '@tanstack/react-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';

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
import AdminAnalyticsPage from '@/pages/admin/AnalyticsPage';
import SystemStatusPage from '@/pages/admin/SystemStatusPage';

// Appointment Pages
import AppointmentsPage from '@/pages/appointments/ListPage';
import BookAppointmentPage from '@/pages/appointments/BookPage';

// Additional Pages
import PrescriptionsPage from '@/pages/patient/PrescriptionsPage';
import MedicalRecordsPage from '@/pages/patient/MedicalRecordsPage';
import TestBookingPage from '@/pages/patient/TestBookingPage';
import BillingPage from '@/pages/patient/BillingPage';

// Root Route
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="light" storageKey="MediHub-theme">
      <AuthProvider>
        <Outlet />
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
  ),
});

// Route Definitions
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: VerifyEmailPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
});

// Protected Section Wrapper (equivalent to DashboardRedirect or ProtectedRoute)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => {
    const { userProfile, loading } = useAuth();
    if (loading) return <FullPageLoader />;
    if (userProfile?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (userProfile?.role === 'doctor') return <Navigate to="/dashboard/doctor" replace />;
    return <Navigate to="/dashboard/patient" replace />;
  },
});

const patientDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/patient',
  component: PatientDashboard,
});

const doctorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/doctor',
  component: DoctorDashboard,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/admin',
  component: AdminDashboard,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const doctorSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doctor/search',
  component: DoctorSearchPage,
});

const doctorSlotsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doctor/$doctorId/slots',
  component: DoctorSlotsPage,
});

const appointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/appointments',
  component: AppointmentsPage,
});

const bookAppointmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/appointments/book/$doctorId',
  component: BookAppointmentPage,
});

const prescriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prescriptions',
  component: PrescriptionsPage,
});

const medicalRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/medical-records',
  component: MedicalRecordsPage,
});

const testBookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test-booking',
  component: TestBookingPage,
});

const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/billing',
  component: BillingPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const aiReportSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-report-summary',
  component: AIReportSummaryPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: AnalyticsPage,
});

const doctorAvailabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doctor/availability',
  component: DoctorAvailabilityPage,
});

const doctorAppointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doctor/appointments',
  component: AppointmentsPage,
});

const adminDashboardSectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});

const adminAppointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/appointments',
  component: AppointmentsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: AdminUsersPage,
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/analytics',
  component: AdminAnalyticsPage,
});

const adminStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/status',
  component: SystemStatusPage,
});

const adminBillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/billing',
  component: BillingPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  verifyEmailRoute,
  resetPasswordRoute,
  dashboardRoute,
  patientDashboardRoute,
  doctorDashboardRoute,
  adminDashboardRoute,
  profileRoute,
  doctorSearchRoute,
  doctorSlotsRoute,
  appointmentsRoute,
  bookAppointmentRoute,
  prescriptionsRoute,
  medicalRecordsRoute,
  testBookingRoute,
  billingRoute,
  notificationsRoute,
  settingsRoute,
  aiReportSummaryRoute,
  analyticsRoute,
  reportsRoute,
  doctorAvailabilityRoute,
  doctorAppointmentsRoute,
  adminDashboardSectionRoute,
  adminAppointmentsRoute,
  adminUsersRoute,
  adminAnalyticsRoute,
  adminStatusRoute,
  adminBillingRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
