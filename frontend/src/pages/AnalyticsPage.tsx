import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Layers,
  Search,
  Download,
  Filter
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, type UserProfile } from "@/contexts/AuthContext";
import { listenToCollection } from "@/lib/firebase-utils";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: string;
  createdAt: any;
}

export default function AnalyticsPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({
    growth: "0%",
    totalConsultations: 0,
    completionRate: "0%",
    avgConsultationsPerDay: "0"
  });
  const [departmentData, setDepartmentData] = useState<{name: string, share: number}[]>([]);

  useEffect(() => {
    // Listen to all appointments (admin view)
    const unsubAppointments = listenToCollection<Appointment>(
      'appointments',
      [],
      (data) => {
        setAppointments(data);
        if (doctors.length > 0) calculateStats(data, doctors);
      }
    );

    // Listen to all doctors for department mapping
    const unsubDoctors = listenToCollection<UserProfile>(
      'users',
      [{ field: 'role', operator: '==', value: 'doctor' }],
      (data) => {
        setDoctors(data);
        if (appointments.length > 0) calculateStats(appointments, data);
      }
    );

    setLoading(false);
    return () => {
      unsubAppointments();
      unsubDoctors();
    };
  }, []);

  useEffect(() => {
    if (appointments.length > 0 && doctors.length > 0) {
      calculateStats(appointments, doctors);
    }
  }, [appointments, doctors]);

  const calculateStats = (appts: Appointment[], docs: UserProfile[]) => {
    // 1. Total Consultations
    const total = appts.length;

    // 2. Completion Rate
    const completed = appts.filter(a => a.status === 'completed').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 3. Dept Performance
    const deptMap: Record<string, number> = {};
    const doctorDepts = new Map(docs.map(d => [d.uid, d.specialization || 'General']));
    
    appts.forEach(a => {
      const dept = doctorDepts.get(a.doctorId) || 'General';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const depts = Object.entries(deptMap)
      .map(([name, count]) => ({
        name,
        share: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 5);

    // 4. Growth (comparison)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = appts.filter(a => {
      const d = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.date);
      return d > thirtyDaysAgo;
    }).length;
    const growthVal = total > recent ? Math.round(((recent / (total - recent)) * 100)) : 100;

    // 5. Avg Consultations
    const days = 30; // assuming a 30 day window
    const avg = (recent / days).toFixed(1);

    setStats({
      growth: `+${growthVal}%`,
      totalConsultations: total,
      completionRate: `${rate}%`,
      avgConsultationsPerDay: avg
    });
    setDepartmentData(depts);
  };


  return (
    <DashboardLayout role={userProfile?.role || 'admin'} title="System Analytics">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass">
              <Filter className="w-4 h-4 mr-2" /> Last 30 Days
            </Button>
            <Button variant="outline" size="sm" className="glass">
               <Layers className="w-4 h-4 mr-2" /> All Departments
            </Button>
          </div>
          <Button variant="gradient" size="sm" className="shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
             [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : (
            <>
              <StatsCard title="Traffic Growth" value={stats.growth} icon={<TrendingUp className="w-5 h-5 text-primary" />} variant="primary" />
              <StatsCard title="Total Consultations" value={stats.totalConsultations.toString()} icon={<Users className="w-5 h-5 text-accent" />} />
              <StatsCard title="Completion Rate" value={stats.completionRate} icon={<Activity className="w-5 h-5 text-success" />} />
              <StatsCard title="Avg. Patients/Day" value={stats.avgConsultationsPerDay} icon={<Calendar className="w-5 h-5 text-warning" />} />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Departmental Performance
              </h3>
              <Badge variant="secondary">Live Data</Badge>
            </div>
            
            <div className="space-y-6">
              {departmentData.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No departmental data available yet</div>
              ) : (
                departmentData.map((dept, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-muted-foreground">{dept.share}% Activity</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.share}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-semibold text-lg mb-6">Regional Insights</h3>
            <div className="flex flex-col items-center justify-center p-8 space-y-6">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 border-t-primary animate-spin-slow flex items-center justify-center relative">
                <span className="text-2xl font-bold">84%</span>
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium text-sm">Target Efficiency</p>
                <p className="text-xs text-muted-foreground">System-wide performance index</p>
              </div>
              <div className="w-full pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> High Performance</span>
                  <span className="font-semibold">62%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent" /> Normal</span>
                  <span className="font-semibold">28%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-muted" /> Optimization Needed</span>
                  <span className="font-semibold">10%</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Search & Utility */}
        <GlassCard className="p-4 flex items-center gap-4 bg-muted/10 border-border/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search historical data logs..."
              className="w-full px-10 py-2 rounded-xl bg-background/50 border border-border/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
            />
          </div>
          <Button variant="outline" className="rounded-xl">Advanced Filter</Button>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
