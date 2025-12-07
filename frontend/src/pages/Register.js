import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, setDocument } from '../firebase/utils';
import { sendEmailVerification } from 'firebase/auth';
import { validateEmail, validatePassword, validatePhone } from '../utils/validators';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserPlus } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'patient'
  });
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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneCheck = validatePhone(formData.phone);
      if (!phoneCheck.valid) {
        newErrors.phone = phoneCheck.error;
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.valid) {
        newErrors.password = passwordCheck.error;
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    const loadingToast = toast.loading('Creating your account...');

    const result = await signUp(formData.email, formData.password);
    
    if (result.success) {
      // Send verification email immediately
      try {
        await sendEmailVerification(result.user, {
          url: window.location.origin + '/dashboard',
          handleCodeInApp: false
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Continue even if email fails - user can resend from verify page
      }

      // Create user profile in Firestore using uid as document ID
      const profileData = {
        uid: result.user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date()
      };

      const profileResult = await setDocument('users', result.user.uid, profileData);

      if (profileResult.success) {
        toast.success('Account created successfully!', { id: loadingToast });
        navigate('/verify-email');
      } else {
        toast.error('Account created but profile setup failed', { id: loadingToast });
      }
    } else {
      const errorMsg = result.error?.includes('email-already-in-use')
        ? 'An account with this email already exists'
        : result.error || 'Failed to create account';
      toast.error(errorMsg, { id: loadingToast });
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'input-error' : ''}
                placeholder="Enter your first name"
                disabled={loading}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'input-error' : ''}
                placeholder="Enter your last name"
                disabled={loading}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>
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
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
              placeholder="Enter your phone number"
              disabled={loading}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
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
              placeholder="Create a password (min. 6 characters)"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'input-error' : ''}
              placeholder="Confirm your password"
              disabled={loading}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-full">
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

