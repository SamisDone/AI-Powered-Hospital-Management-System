import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '../firebase/config';
import './Auth.css';

const VerifyEmail = () => {
  const { currentUser } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // Automatically send verification email when component loads
  useEffect(() => {
    if (currentUser && !currentUser.emailVerified) {
      handleSendVerification();
    }
  }, [currentUser]);

  // Check email verification status periodically
  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return;

    const interval = setInterval(async () => {
      try {
        await reload(currentUser);
        if (currentUser.emailVerified) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  const handleSendVerification = async () => {
    if (!currentUser) return;
    
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      await sendEmailVerification(currentUser, {
        url: window.location.origin + '/dashboard',
        handleCodeInApp: false
      });
      setMessage('Verification email sent! Please check your inbox (and spam folder).');
    } catch (error) {
      setError(error.message || 'Failed to send verification email');
      console.error('Verification email error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!currentUser) return;
    
    setChecking(true);
    setError('');
    
    try {
      await reload(currentUser);
      if (currentUser.emailVerified) {
        navigate('/dashboard');
      } else {
        setError('Email not verified yet. Please check your email and click the verification link.');
      }
    } catch (error) {
      setError('Error checking verification status');
      console.error('Error:', error);
    } finally {
      setChecking(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Email</h2>
        {!currentUser?.emailVerified ? (
          <>
            <p>We've sent a verification email to:</p>
            <p style={{ fontWeight: 'bold', margin: '10px 0' }}>{currentUser?.email}</p>
            
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
              <strong>Can't find the email?</strong>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Check your <strong>spam/junk folder</strong></li>
                <li>Wait a few minutes - emails can be delayed</li>
                <li>Make sure you entered the correct email address</li>
                <li>Check if your email provider is blocking Firebase emails</li>
              </ul>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleSendVerification} 
                disabled={loading}
                className="btn-secondary"
                style={{ flex: 1, minWidth: '150px' }}
              >
                {loading ? 'Sending...' : 'Resend Email'}
              </button>
              <button 
                onClick={handleCheckVerification} 
                disabled={checking}
                className="btn-primary"
                style={{ flex: 1, minWidth: '150px' }}
              >
                {checking ? 'Checking...' : 'I\'ve Verified'}
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className="success-message">Email verified successfully!</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

