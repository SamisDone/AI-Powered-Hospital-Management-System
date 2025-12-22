import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { DashboardSidebar } from "./DashboardSidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageLoader } from "@/components/ui/loading-spinner";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "patient" | "doctor" | "admin";
  title?: string;
}

export function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  const { loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role={role} />
      
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 glass-subtle border-b border-border/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-foreground"
              >
                {title}
              </motion.h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 w-64 bg-muted/30 border-border/30"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
