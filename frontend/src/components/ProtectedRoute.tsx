import { Navigate } from 'react-router-dom';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import { FullPageLoader } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserProfile['role'][];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
