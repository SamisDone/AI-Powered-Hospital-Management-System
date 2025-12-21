import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, Heart, ArrowRight, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { sendEmailVerification } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { signUp, setDocument } from '@/lib/firebase-utils';

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
      staggerChildren: 0.08
    }
  }
};

type Role = 'patient' | 'doctor';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: Role;
  specialization?: string;
  licenseNumber?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'doctor') {
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password);
      
      if (result.success && result.data) {
        const user = result.data;
        
        // Create user profile in Firestore
        await setDocument('users', user.uid, {
          uid: user.uid,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          ...(formData.role === 'doctor' && {
            specialization: formData.specialization,
            licenseNumber: formData.licenseNumber
          }),
          createdAt: new Date()
        });

        // Send verification email
        await sendEmailVerification(user, {
          url: `${window.location.origin}/login`
        });

        toast.success('Account created! Please verify your email.');
        navigate({ to: '/verify-email' });
      } else {
        const errorMsg = result.error?.includes('email-already-in-use')
          ? 'An account with this email already exists'
          : result.error || 'Failed to create account';
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
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background overflow-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="w-full max-w-lg"
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
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription className="text-base">
                  Join MediHub to access quality healthcare
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <motion.div variants={fadeIn} className="space-y-2">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        formData.role === 'patient' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <User className={`w-6 h-6 ${formData.role === 'patient' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`font-medium ${formData.role === 'patient' ? 'text-primary' : ''}`}>Patient</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        formData.role === 'doctor' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Stethoscope className={`w-6 h-6 ${formData.role === 'doctor' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`font-medium ${formData.role === 'doctor' ? 'text-primary' : ''}`}>Doctor</span>
                    </button>
                  </div>
                </motion.div>

                {/* Name Fields */}
                <motion.div variants={fadeIn} className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`pl-9 ${errors.firstName ? 'border-destructive' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? 'border-destructive' : ''}
                      disabled={loading}
                    />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-9 ${errors.email ? 'border-destructive' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </motion.div>

                {/* Phone */}
                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pl-9 ${errors.phone ? 'border-destructive' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </motion.div>

                {/* Doctor-specific fields */}
                {formData.role === 'doctor' && (
                  <>
                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        placeholder="e.g., Cardiology, Dermatology"
                        value={formData.specialization || ''}
                        onChange={handleChange}
                        className={errors.specialization ? 'border-destructive' : ''}
                        disabled={loading}
                      />
                      {errors.specialization && <p className="text-xs text-destructive">{errors.specialization}</p>}
                    </motion.div>
                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        placeholder="Medical license number"
                        value={formData.licenseNumber || ''}
                        onChange={handleChange}
                        className={errors.licenseNumber ? 'border-destructive' : ''}
                        disabled={loading}
                      />
                      {errors.licenseNumber && <p className="text-xs text-destructive">{errors.licenseNumber}</p>}
                    </motion.div>
                  </>
                )}

                {/* Password Fields */}
                <motion.div variants={fadeIn} className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-9 ${errors.password ? 'border-destructive' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'border-destructive' : ''}
                      disabled={loading}
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
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
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={fadeIn} className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent via-accent/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
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
              Start Your <br />Health Journey
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl opacity-90 mb-8">
              Create your account today and gain access to world-class healthcare services at your fingertips.
            </motion.p>
            
            <motion.div variants={fadeIn} className="space-y-4">
              {[
                "Access 500+ verified doctors",
                "Book appointments 24/7",
                "Secure health records"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
