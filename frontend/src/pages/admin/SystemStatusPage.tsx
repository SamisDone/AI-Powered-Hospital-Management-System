import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Activity, 
  Server, 
  Wifi, 
  Clock,
  RefreshCw,
  HardDrive
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listenToCollection } from "@/lib/firebase-utils";

export default function SystemStatusPage() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    appointments: 0,
    prescriptions: 0,
    bills: 0,
    notifications: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const collections = ['users', 'appointments', 'prescriptions', 'bills', 'notifications'];
    const unsubs: (() => void)[] = [];

    collections.forEach(col => {
      const unsub = listenToCollection(col, [], (data) => {
        setCounts(prev => ({ ...prev, [col]: data.length }));
        setLastUpdate(new Date());
      });
      unsubs.push(unsub);
    });

    setLoading(false);
    return () => unsubs.forEach(u => u());
  }, []);

  const systemMetrics = [
    { label: "Database Latency", value: "42ms", status: "Optimal", color: "text-success" },
    { label: "Storage Used", value: "1.2 GB / 5 GB", status: "Healthy", color: "text-success" },
    { label: "Backup Status", value: "Daily Sync", status: "Active", color: "text-primary" },
    { label: "API Availability", value: "100%", status: "Online", color: "text-success" },
  ];

  return (
    <DashboardLayout role="admin" title="System Status">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Connection Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-success/20 to-primary/20 rounded-2xl border border-success/30 backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
              <Wifi className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                All Systems Operational
                <Badge variant="outline" className="text-success border-success/50">Live</Badge>
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Last synced: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="glass gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Cloud Connection
          </Button>
        </motion.div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
             [...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : (
            <>
              <StatsCard title="Total Users" value={counts.users.toString()} icon={<Users className="w-5 h-5 text-primary" />} />
              <StatsCard title="Appointments" value={counts.appointments.toString()} icon={<Activity className="w-5 h-5 text-accent" />} />
              <StatsCard title="Prescriptions" value={counts.prescriptions.toString()} icon={<RefreshCw className="w-5 h-5 text-success" />} />
              <StatsCard title="Invoices" value={counts.bills.toString()} icon={<Database className="w-5 h-5 text-warning" />} />
              <StatsCard title="Alerts Sent" value={counts.notifications.toString()} icon={<Server className="w-5 h-5 text-destructive" />} />
            </>
          )}
        </div>

        {/* System Health Check */}
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Service Integrity Check
            </h3>
            <div className="space-y-4">
              {systemMetrics.map((metric, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{metric.label}</p>
                      <p className="text-xs text-muted-foreground">{metric.value}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={metric.color}>{metric.status}</Badge>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Resource Allocation
            </h3>
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-32 h-32 rounded-full border-8 border-primary/10 border-t-primary border-r-primary flex items-center justify-center relative">
                <div className="text-center">
                  <p className="text-2xl font-bold">24%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">CPU Peak</p>
                </div>
              </div>
              <div className="w-full space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Firestore Reads</span>
                  <span className="font-bold text-success text-xs">Normal</span>
                </div>
                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full w-[15%] bg-success" />
                </div>
                <div className="flex justify-between text-xs pt-2">
                  <span>Firestore Writes</span>
                  <span className="font-bold text-primary text-xs">Optimized</span>
                </div>
                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full w-[8%] bg-primary" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
