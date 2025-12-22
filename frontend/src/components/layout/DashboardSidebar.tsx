import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Shield,
  UserCog,
  Pill,
  Search,
  Brain,
  Beaker,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MedAvatar } from "@/components/ui/MedAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { listenToCollection } from "@/lib/firebase-utils";

interface SidebarProps {
  role: "patient" | "doctor" | "admin";
}

const roleNavigation = {
  patient: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: Search, label: "Find Doctors", href: "/doctor/search" },
    { icon: Brain, label: "Report Summary", href: "/ai-report-summary" },
    { icon: BarChart3, label: "Health Insights", href: "/analytics" },
    { icon: Pill, label: "Prescriptions", href: "/prescriptions" },
    { icon: FileText, label: "Medical Records", href: "/medical-records" },
    { icon: Beaker, label: "Test Booking", href: "/test-booking" },
    { icon: Receipt, label: "Billing", href: "/billing" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  doctor: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Patient Queue", href: "/doctor/appointments" },
    { icon: Calendar, label: "Availability", href: "/doctor/availability" },
    { icon: Brain, label: "AI Report Genius", href: "/ai-report-summary" },
    { icon: BarChart3, label: "Analytics & Reports", href: "/analytics" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
    { icon: Receipt, label: "Financials", href: "/admin/billing" },
    { icon: BarChart3, label: "System Analytics", href: "/admin/analytics" },
    { icon: UserCog, label: "User Management", href: "/admin/users" },
    { icon: Shield, label: "System Status", href: "/admin/status" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
};

export function DashboardSidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const navigation = roleNavigation[role];

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = listenToCollection<any>(
      'notifications',
      [
        { field: 'userId', operator: '==', value: currentUser.uid },
        { field: 'read', operator: '==', value: false }
      ],
      (data) => {
        setUnreadCount(data.length);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen glass border-r border-border/50 flex flex-col relative"
    >
      {/* Header */}
      <Link 
        to="/dashboard"
        className={cn(
          "p-4 border-b border-border/50 flex items-center hover:bg-muted/30 transition-colors",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg text-foreground leading-none">
                MediHub
              </span>
              <span className="text-[10px] font-medium text-primary tracking-widest">
                AI POWERED
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item, index) => {
          const isActive = currentPath === item.href;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  collapsed && "justify-center px-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border/50">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-muted/30",
          collapsed && "justify-center"
        )}>
          <MedAvatar fallback={userName} size="sm" status="online" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className={cn(
          "mt-3 flex gap-2",
          collapsed ? "flex-col" : "flex-row"
        )}>
          <Button 
            variant="ghost" 
            size={collapsed ? "icon" : "sm"} 
            className="flex-1 relative"
            onClick={() => navigate({ to: "/notifications" })}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            {!collapsed && <span className="ml-2">Notifications</span>}
          </Button>
          <Button 
            variant="ghost" 
            size={collapsed ? "icon" : "sm"} 
            className="flex-1"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-4 bg-background border border-border shadow-md rounded-full w-8 h-8"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </motion.aside>
  );
}
