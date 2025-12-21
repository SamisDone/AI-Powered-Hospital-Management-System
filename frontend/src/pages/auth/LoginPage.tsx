import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Heart, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { signIn } from '@/lib/firebase-utils';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        toast.success('Welcome back!');
        navigate({ to: '/dashboard' });
      } else {
        const errorMsg = result.error?.includes('user-not-found') 
          ? 'No account found with this email'
          : result.error?.includes('wrong-password')
          ? 'Incorrect password'
          : result.error || 'Failed to sign in';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Heart className="w-7 h-7" />
              </div>
              <span className="text-3xl font-bold">MediHub</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl font-bold mb-6 leading-tight">
              Welcome Back to <br />Better Healthcare
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl opacity-90 mb-8">
              Sign in to manage your appointments, connect with doctors, and take control of your health journey.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>24/7 Access</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div variants={fadeIn} className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">MediHub</span>
          </motion.div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <motion.div variants={fadeIn}>
                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                <CardDescription className="text-base">
                  Enter your credentials to access your account
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      to="/reset-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      className={`pl-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </motion.div>

                <motion.div variants={fadeIn}>
                  <Button 
                    type="submit" 
                    variant="gradient" 
                    size="lg" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={fadeIn} className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">
                      New to MediHub?
                    </span>
                  </div>
                </div>

                <Link to="/register" className="block mt-4">
                  <Button variant="outline" size="lg" className="w-full group">
                    Create an Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>

          <motion.p variants={fadeIn} className="text-center text-sm text-muted-foreground mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
