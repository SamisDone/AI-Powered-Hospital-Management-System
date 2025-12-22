import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Search, Plus, Pill } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { listenToCollection, updateDocument, addDocument } from '@/lib/firebase-utils';

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName?: string;
  patientName?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  reason?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const statusConfig = {
  'scheduled': { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
  'in-progress': { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
  'completed': { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Completed' },
  'cancelled': { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Cancelled' }
};

export default function AppointmentsPage() {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isDoctor = userProfile?.role === 'doctor';
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (!userProfile) return;

    let unsub: () => void;

    if (isAdmin) {
      unsub = listenToCollection<Appointment>(
        'appointments',
        [],
        (data) => {
          const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setAppointments(sorted);
          setLoading(false);
        }
      );
    } else {
      const field = isDoctor ? 'doctorId' : 'patientId';
      unsub = listenToCollection<Appointment>(
        'appointments',
        [{ field, operator: '==', value: userProfile.uid }],
        (data) => {
          const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setAppointments(sorted);
          setLoading(false);
        }
      );
    }

    return () => unsub && unsub();
  }, [userProfile?.uid, isAdmin, isDoctor]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    if (!userProfile) return;

    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    try {
      await updateDocument('appointments', id, { status: 'cancelled' });
      
      // Create notification for the OTHER party
      const recipientId = isDoctor ? appointment.patientId : appointment.doctorId;
      const cancelerName = isDoctor ? `Dr. ${userProfile.firstName} ${userProfile.lastName}` : `${userProfile.firstName} ${userProfile.lastName}`;
      
      await addDocument('notifications', {
        userId: recipientId,
        title: 'Appointment Cancelled',
        message: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled by ${cancelerName}.`,
        type: 'alert',
        read: false
      });

      toast.success('Appointment cancelled');
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleComplete = async (id: string) => {
    if (!userProfile) return;
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    try {
      await updateDocument('appointments', id, { status: 'completed' });
      
      // Notify patient
      await addDocument('notifications', {
        userId: appointment.patientId,
        title: 'Consultation Completed',
        message: `Your appointment with Dr. ${userProfile.firstName} ${userProfile.lastName} has been marked as completed. You can now view your records or prescriptions if any were issued.`,
        type: 'appointment',
        read: false
      });

      toast.success('Appointment marked as completed');
    } catch {
      toast.error('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = 
      a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Appointments">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isAdmin ? 'All Appointments' : 'My Appointments'}</h1>
            <p className="text-muted-foreground">View and manage appointments</p>
          </div>
          <div className="flex items-center gap-2">
            {!isDoctor && !isAdmin && (
              <Button variant="gradient" asChild>
                <Link to="/doctor/search">
                  <Plus className="w-4 h-4 mr-2" />
                  Book New
                </Link>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <motion.div variants={fadeIn}>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments</h3>
                <p className="text-muted-foreground mb-4">
                  {filter !== 'all' 
                    ? `No ${filter} appointments found`
                    : isDoctor 
                      ? "You don't have any appointments scheduled"
                      : "Book your first appointment with a doctor"}
                </p>
                {!isDoctor && !isAdmin && (
                  <Button variant="gradient" asChild>
                    <Link to="/doctor/search">
                      <Search className="w-4 h-4 mr-2" />
                      Find a Doctor
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => {
                const status = statusConfig[appointment.status];
                const StatusIcon = status.icon;
                const canCancel = appointment.status === 'scheduled' && !isAdmin;
                const canComplete = isDoctor && appointment.status === 'scheduled';
                const canPrescribe = isDoctor && appointment.status === 'completed';
                
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {isDoctor || isAdmin
                                  ? appointment.patientName 
                                  : appointment.doctorName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{appointment.date}</span>
                                <span>•</span>
                                <span>{appointment.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            {canComplete && (
                              <Button size="sm" onClick={() => handleComplete(appointment.id)}>
                                Complete
                              </Button>
                            )}
                            {canCancel && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleCancel(appointment.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {canPrescribe && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-primary"
                                asChild
                              >
                                <Link 
                                  to="/prescriptions"
                                  search={{ 
                                    patientId: appointment.patientId, 
                                    patientName: appointment.patientName || '' 
                                  }}
                                >
                                  <Pill className="w-4 h-4 mr-1" />
                                  Prescribe
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                        {appointment.reason && (
                          <p className="mt-4 text-sm text-muted-foreground pl-16">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
