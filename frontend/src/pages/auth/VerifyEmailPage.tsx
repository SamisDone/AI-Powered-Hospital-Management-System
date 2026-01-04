import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle, Heart, ArrowRight } from 'lucide-react';
import { sendEmailVerification, reload } from 'firebase/auth';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function VerifyEmailPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  // Check verification status periodically
  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return;

    const interval = setInterval(async () => {
      try {
        await reload(currentUser);
        if (currentUser.emailVerified) {
          setVerified(true);
          clearInterval(interval);
          toast.success('Email verified successfully!');
          setTimeout(() => navigate({ to: '/dashboard' }), 1500);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  const handleResend = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await sendEmailVerification(currentUser, {
        url: `${window.location.origin}/login`
      });
      toast.success('Verification email sent!');
    } catch {
      toast.error('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await reload(currentUser);
      if (currentUser.emailVerified) {
        setVerified(true);
        toast.success('Email verified!');
        setTimeout(() => navigate({ to: '/dashboard' }), 1500);
      } else {
        toast.info('Email not verified yet');
      }
    } catch {
      toast.error('Failed to check verification status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">National Hospital</span>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            {verified ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Email Verified!</CardTitle>
                <CardDescription>
                  Redirecting you to the dashboard...
                </CardDescription>
              </motion.div>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription>
                  We've sent a verification link to:
                  <br />
                  <strong className="text-foreground">{currentUser?.email}</strong>
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          {!verified && (
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Can't find the email?</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Check your spam/junk folder</li>
                  <li>• Wait a few minutes for delivery</li>
                  <li>• Make sure the email address is correct</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckVerification}
                  disabled={loading}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>I've Verified My Email</span>
                </Button>
              </div>

              <div className="text-center pt-4">
                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Back to Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
