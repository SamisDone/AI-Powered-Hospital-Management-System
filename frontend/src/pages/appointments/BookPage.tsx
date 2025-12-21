import { useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// This page redirects to the SlotsPage with the doctorId
// The actual booking flow happens in SlotsPage
export default function BookAppointmentPage() {
  const { doctorId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  useEffect(() => {
    if (doctorId) {
      // Redirect to the slots page for this doctor
      navigate({ to: '/doctor/$doctorId/slots', params: { doctorId }, replace: true });
    } else {
      // No doctor specified, go to search
      navigate({ to: '/doctor/search', replace: true });
    }
  }, [doctorId, navigate]);

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Book Appointment">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    </DashboardLayout>
  );
}
