import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Activity, TrendingUp, AlertTriangle, Receipt, CreditCard } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsCard } from "@/components/ui/StatsCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/skeleton";
import { listenToCollection } from "@/lib/firebase-utils";
import type { UserProfile } from "@/contexts/AuthContext";
interface Appointment {
  id: string;
  date: string;
  status: string;
}

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    outstandingBills: 0,
    weeklyAppointments: [0, 0, 0, 0, 0, 0, 0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to all users
    const unsubUsers = listenToCollection<UserProfile>(
      'users',
      [],
      (data: UserProfile[]) => {
        const patients = data.filter(u => u.role === 'patient').length;
        const doctors = data.filter(u => u.role === 'doctor').length;
        setStats(prev => ({ ...prev, totalPatients: patients, totalDoctors: doctors }));
        setLoading(false);
      }
    );

    // Listen to all appointments
    const unsubAppointments = listenToCollection<Appointment>(
      'appointments',
      [],
      (data: Appointment[]) => {
        const today = getLocalDate();
        const todayAppts = data.filter(a => a.date === today).length;
        
        // Calculate weekly appointments
        const weekly = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        data.forEach(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          
          const diffTime = now.getTime() - aptDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7) {
            weekly[6 - diffDays]++;
          }
        });
        
        setStats(prev => ({ 
          ...prev, 
          todayAppointments: todayAppts,
          weeklyAppointments: weekly
        }));
      }
    );

    // Listen to all bills for financial stats
    const unsubBills = listenToCollection<any>(
      'bills',
      [],
      (data) => {
        const totalRevenue = data
          .filter(b => b.status === 'paid')
          .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        const outstanding = data.filter(b => b.status === 'unpaid').length;
        
        setStats(prev => ({ 
          ...prev, 
          totalRevenue,
          outstandingBills: outstanding
        }));
      }
    );

    return () => {
      unsubUsers();
      unsubAppointments();
      unsubBills();
    };
  }, []);

  const maxWeekly = Math.max(...stats.weeklyAppointments, 1);

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : (
            <>
              <StatsCard title="Total Patients" value={stats.totalPatients.toLocaleString()} change={12} changeLabel="this month" icon={<Users className="w-5 h-5 text-primary" />} variant="primary" />
              <StatsCard title="Total Revenue" value={`${stats.totalRevenue.toLocaleString()} BDT`} icon={<Receipt className="w-5 h-5 text-success" />} />
              <StatsCard title="Outstanding Bills" value={stats.outstandingBills.toString()} icon={<CreditCard className="w-5 h-5 text-destructive" />} />
              <StatsCard title="Appointments Today" value={stats.todayAppointments.toString()} icon={<Activity className="w-5 h-5 text-accent" />} />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <h3 className="font-semibold mb-4">Weekly Appointments</h3>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <>
                <div className="h-48 flex items-end justify-between gap-2">
                  {stats.weeklyAppointments.map((value, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      animate={{ height: `${(value / maxWeekly) * 100}%` }} 
                      transition={{ delay: i * 0.1 }} 
                      className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg min-h-[4px]"
                    >
                      <div className="text-xs text-center text-primary-foreground font-medium pt-1">
                        {value > 0 && value}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </>
            )}
          </GlassCard>

          <GlassCard className="p-6 flex flex-col items-center justify-center">
            <ProgressRing progress={99.9} color="success" label="Uptime" />
            <p className="mt-4 text-sm text-muted-foreground text-center">System running optimally</p>
          </GlassCard>
        </div>

        {/* Alerts */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">System Alerts</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-4">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium">Server maintenance scheduled</p>
                <p className="text-sm text-muted-foreground">Dec 25, 2025 at 2:00 AM - Expected 30 min downtime</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-4">
              <TrendingUp className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium">User registrations increasing</p>
                <p className="text-sm text-muted-foreground">{stats.totalPatients + stats.totalDoctors} total users registered</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
