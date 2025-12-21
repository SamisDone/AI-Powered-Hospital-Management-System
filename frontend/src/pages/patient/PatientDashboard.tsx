import { useState, useEffect } from "react";
import { Calendar, Brain, Pill, FileText, ArrowRight, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ui/AIBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { listenToCollection } from "@/lib/firebase-utils";

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  reason?: string;
}



interface Medication {
  name: string;
  dosage: string;
}

interface Prescription {
  id: string;
  medications?: Medication[];
  medication?: string; // Legacy
  dosage?: string; // Legacy
  frequency?: string;
  refillsRemaining?: number;
}

interface MedicalRecord {
  id: string;
}

export default function PatientDashboard() {
  const { currentUser, userProfile } = useAuth();
  const userName = userProfile?.firstName || currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    // 1. Appointments listener
    const unsubAppts = listenToCollection<Appointment>(
      'appointments',
      [{ field: 'patientId', operator: '==', value: userProfile.uid }],
      (data: Appointment[]) => {
        const active = data.filter((a: Appointment) => a.status === 'scheduled' || a.status === 'in-progress');
        active.sort((a: Appointment, b: Appointment) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
        setAppointments(active.slice(0, 3));
        setLoading(false);
      }
    );

    // 2. Prescriptions listener
    const unsubRx = listenToCollection<Prescription>(
      'prescriptions',
      [
        { field: 'patientId', operator: '==', value: userProfile.uid },
        { field: 'status', operator: '==', value: 'active' }
      ],
      (data: Prescription[]) => setPrescriptions(data)
    );

    // 3. Medical Records listener
    const unsubRecords = listenToCollection<MedicalRecord>(
      'medical_records',
      [{ field: 'patientId', operator: '==', value: userProfile.uid }],
      (data: MedicalRecord[]) => setRecordsCount(data.length)
    );

    return () => {
      unsubAppts();
      unsubRx();
      unsubRecords();
    };
  }, [userProfile?.uid]);

  return (
    <DashboardLayout role="patient" title={`Welcome back, ${userName}`}>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Appointments" 
            value={loading ? "..." : appointments.length.toString()} 
            icon={<Calendar className="w-5 h-5 text-accent" />} 
            variant="primary"
          />
          <StatsCard 
            title="Prescriptions" 
            value={loading ? "..." : prescriptions.length.toString()} 
            icon={<Pill className="w-5 h-5 text-success" />} 
          />
          <StatsCard 
            title="Medical Records" 
            value={loading ? "..." : recordsCount.toString()} 
            icon={<FileText className="w-5 h-5 text-primary" />} 
          />
          <StatsCard 
            title="Health Status" 
            value="Active" 
            icon={<Heart className="w-5 h-5 text-primary" />} 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <GlassCard className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Medical Report Summary</h3>
                  <p className="text-sm text-muted-foreground">Upload reports for AI-powered analysis</p>
                </div>
              </div>
              <AIBadge size="sm">AI Powered</AIBadge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/medical-records" className="block">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors">
                  <p className="text-sm font-medium text-primary mb-1">Upload Records</p>
                  <p className="text-sm text-muted-foreground">Upload medical reports for AI summary</p>
                </div>
              </Link>
              <Link to="/doctor/search" className="block">
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors">
                  <p className="text-sm font-medium text-accent mb-1">Book Appointment</p>
                  <p className="text-sm text-muted-foreground">Find and book with verified doctors</p>
                </div>
              </Link>
            </div>
          </GlassCard>

          {/* Stats Summary */}
          <GlassCard className="p-6 flex flex-col items-center justify-center">
            <ProgressRing progress={appointments.length > 0 ? 100 : 0} color="primary" label="Scheduled" />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              {appointments.length > 0 
                ? `${appointments.length} upcoming appointment(s)` 
                : "No upcoming appointments"}
            </p>
          </GlassCard>
        </div>

        {/* Appointments & Prescriptions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Upcoming Appointments</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/appointments">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No upcoming appointments</p>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{apt.doctorName}</p>
                      <p className="text-sm text-muted-foreground">{apt.reason || "Consultation"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{apt.date}</p>
                      <p className="text-sm text-muted-foreground">{apt.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active Prescriptions</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/prescriptions">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No active prescriptions</p>
              ) : (
                prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-xl bg-muted/30 flex items-center justify-between">
                    <div>
                      {rx.medications && rx.medications.length > 0 ? (
                        <>
                          <p className="font-medium">{rx.medications[0].name}{rx.medications.length > 1 ? ` +${rx.medications.length - 1} more` : ''}</p>
                          <p className="text-sm text-muted-foreground">{rx.medications[0].dosage}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">{rx.medication}</p>
                          <p className="text-sm text-muted-foreground">{rx.dosage} • {rx.frequency}</p>
                        </>
                      )}
                    </div>
                    {(rx.refillsRemaining !== undefined) && (
                      <span className="text-sm text-primary">{rx.refillsRemaining} refills left</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Quick Book CTA */}
        <GlassCard className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Need to see a doctor?</h3>
              <p className="text-muted-foreground">Book an appointment with our verified doctors</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl shadow-lg" asChild>
              <Link to="/doctor/search">Find a Doctor <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
