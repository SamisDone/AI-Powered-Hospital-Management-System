import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileText, Brain, CheckCircle2, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { MedAvatar } from "@/components/ui/MedAvatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { listenToCollection, updateDocument } from "@/lib/firebase-utils";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
}

// Get local date in YYYY-MM-DD format
const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DoctorDashboard() {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const userName = userProfile?.firstName || currentUser?.displayName || currentUser?.email?.split("@")[0] || "Doctor";
  
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(userProfile?.isAvailable ?? true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = listenToCollection<Appointment>(
      'appointments',
      [{ field: 'doctorId', operator: '==', value: userProfile.uid }],
      (data: Appointment[]) => {
        setAllAppointments(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid]);

  // Calculate stats from all appointments
  const today = getLocalDate();
  const todayAppointments = allAppointments.filter(a => a.date === today);
  const todayPending = todayAppointments.filter(a => a.status === 'scheduled' || a.status === 'in-progress');
  const todayCompleted = todayAppointments.filter(a => a.status === 'completed').length;
  const totalPatients = new Set(allAppointments.map(a => a.patientId)).size;

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!userProfile?.uid) return;
    
    setIsAvailable(checked);
    try {
      await updateDocument('users', userProfile.uid, { isAvailable: checked });
      if (setUserProfile) {
        setUserProfile({ ...userProfile, isAvailable: checked });
      }
      toast.success(checked ? 'You are now available' : 'You are now unavailable');
    } catch {
      toast.error('Failed to update availability');
      setIsAvailable(!checked);
    }
  };

  const handleStartConsultation = async (appointmentId: string) => {
    try {
      await updateDocument('appointments', appointmentId, { status: 'in-progress' });
      toast.success('Consultation started');
    } catch {
      toast.error('Failed to start consultation');
    }
  };

  const handleCompleteConsultation = async (appointmentId: string) => {
    try {
      await updateDocument('appointments', appointmentId, { status: 'completed' });
      toast.success('Consultation completed');
    } catch {
      toast.error('Failed to complete consultation');
    }
  };

  return (
    <DashboardLayout role="doctor" title={`Good morning, Dr. ${userName}`}>
      <div className="space-y-6">
        {/* Stats & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Today's Patients" 
            value={loading ? "..." : todayAppointments.length.toString()} 
            icon={<Users className="w-5 h-5 text-primary" />} 
            variant="primary" 
          />
          <StatsCard 
            title="Completed Today" 
            value={loading ? "..." : todayCompleted.toString()} 
            icon={<CheckCircle2 className="w-5 h-5 text-success" />} 
          />
          <StatsCard 
            title="Total Patients" 
            value={loading ? "..." : totalPatients.toString()} 
            icon={<FileText className="w-5 h-5 text-accent" />} 
          />
          <GlassCard className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Availability</p>
              <p className={`font-semibold ${isAvailable ? 'text-success' : 'text-muted-foreground'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={handleAvailabilityToggle} />
          </GlassCard>
        </div>

        {/* Patient Queue */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Today's Queue ({todayPending.length} pending)</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/appointments">View all <Calendar className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : todayPending.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {todayAppointments.length === 0 
                  ? "No appointments scheduled for today"
                  : "All appointments completed for today!"}
              </p>
            ) : (
              todayPending.map((patient) => (
                <motion.div 
                  key={patient.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-4 rounded-xl bg-muted/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <MedAvatar 
                      fallback={patient.patientName} 
                      size="md" 
                      status={patient.status === "in-progress" ? "busy" : "online"} 
                    />
                    <div>
                      <p className="font-medium">{patient.patientName}</p>
                      <p className="text-sm text-muted-foreground">{patient.reason || "Consultation"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{patient.time}</span>
                    {patient.status === "in-progress" ? (
                      <Button size="sm" onClick={() => handleCompleteConsultation(patient.id)} className="rounded-xl">
                        Complete
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleStartConsultation(patient.id)} className="rounded-xl">
                        Start
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>

        {/* AI Assistant */}
        <GlassCard className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Medical Report Summary</h3>
              <p className="text-sm text-muted-foreground">Upload medical reports to get AI-powered summaries</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl shadow-lg" asChild>
              <Link to="/medical-records">Upload Reports</Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
