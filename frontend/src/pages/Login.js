import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../firebase/utils';
import { validateEmail } from '../utils/validators';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { LogIn } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Signing in...');

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Welcome back!', { id: loadingToast });
        navigate('/dashboard');
      } else {
        const errorMsg = result.error?.includes('user-not-found') 
          ? 'No account found with this email'
          : result.error?.includes('wrong-password')
          ? 'Incorrect password'
          : result.error || 'Failed to sign in';
        toast.error(errorMsg, { id: loadingToast });
      }
    } catch (error) {
      toast.error('An unexpected error occurred', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn size={32} className="auth-icon" />
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-full">
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/register" className="auth-link">Don't have an account? <strong>Register</strong></Link>
          <Link to="/reset-password" className="auth-link">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

