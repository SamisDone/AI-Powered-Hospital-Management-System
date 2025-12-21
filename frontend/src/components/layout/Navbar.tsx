import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Activity, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <nav className="glass-card mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-foreground">
                  MediHub
                </span>
                <span className="text-[10px] font-medium text-primary tracking-widest">
                  AI POWERED
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative group",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {currentUser ? (
                <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg rounded-xl">
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-border/50"
              >
                <div className="flex flex-col gap-3">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="flex flex-col gap-2 pt-4">
                    {currentUser ? (
                      <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80">
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" asChild className="w-full">
                          <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                        </Button>
                        <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80">
                          <Link to="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </motion.header>
  );
}
