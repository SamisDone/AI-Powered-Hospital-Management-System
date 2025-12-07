import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { setDocument, getDocument } from '../firebase/utils';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import './Profile.css';

const Profile = () => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    specialty: '',
    qualifications: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || currentUser?.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        gender: userProfile.gender || '',
        specialty: userProfile.specialty || '',
        qualifications: userProfile.qualifications || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const loadingToast = toast.loading('Updating profile...');

    try {
      // Use setDocument with merge: true so it works whether document exists or not
      const result = await setDocument('users', currentUser.uid, {
        ...formData,
        uid: currentUser.uid,
        email: currentUser.email // Preserve email from auth
      });
      
      if (result.success) {
        // Refresh user profile
        const profileResult = await getDocument('users', currentUser.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
        toast.success('Profile updated successfully!', { id: loadingToast });
        setMessage('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile', { id: loadingToast });
        setMessage('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile', { id: loadingToast });
      setMessage('Error updating profile');
    }
    
    setLoading(false);
  };

  return (
    <Layout>
      <div className="profile-page">
        <h1>My Profile</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="3"
              />
            </div>
          </div>

          {userProfile?.role === 'doctor' && (
            <div className="form-section">
              <h2>Professional Information</h2>
              <div className="form-group">
                <label>Specialty</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
              <div className="form-group">
                <label>Qualifications</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="e.g., MD, MBBS"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="4"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
          )}

          {message && (
            <div className={message.includes('success') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;

