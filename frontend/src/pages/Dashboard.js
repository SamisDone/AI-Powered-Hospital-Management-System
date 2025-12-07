import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCollection } from '../firebase/utils';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Clock, CheckCircle, User, Stethoscope, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [userProfile, navigate]);
  const [stats, setStats] = useState({
    appointments: 0,
    upcoming: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile) return;

      try {
        const filters = [{ field: 'userId', operator: '==', value: userProfile.uid }];
        const result = await getCollection('appointments', filters);
        
        if (result.success) {
          const appointments = result.data;
          setStats({
            appointments: appointments.length,
            upcoming: appointments.filter(a => a.status === 'scheduled').length,
            completed: appointments.filter(a => a.status === 'completed').length
          });
        } else {
          toast.error('Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userProfile]);

  const getDashboardContent = () => {
    if (!userProfile) return null;

    const role = userProfile.role;

    if (role === 'admin') {
      return (
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon admin">
              <User size={24} />
            </div>
            <h3>Total Users</h3>
            <p className="stat-number">-</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon doctor">
              <Stethoscope size={24} />
            </div>
            <h3>Total Doctors</h3>
            <p className="stat-number">-</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon appointment">
              <Activity size={24} />
            </div>
            <h3>Total Appointments</h3>
            <p className="stat-number">-</p>
          </div>
        </div>
      );
    } else if (role === 'doctor') {
      return (
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon appointment">
              <Calendar size={24} />
            </div>
            <h3>Total Appointments</h3>
            <p className="stat-number">{stats.appointments}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon upcoming">
              <Clock size={24} />
            </div>
            <h3>Upcoming</h3>
            <p className="stat-number">{stats.upcoming}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon appointment">
              <Calendar size={24} />
            </div>
            <h3>My Appointments</h3>
            <p className="stat-number">{stats.appointments}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon upcoming">
              <Clock size={24} />
            </div>
            <h3>Upcoming</h3>
            <p className="stat-number">{stats.upcoming}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </div>
      );
    }
  };

  if (loading || !userProfile) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <LoadingSpinner size="large" />
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>Welcome, {userProfile?.firstName || 'User'}!</h1>
        <p className="dashboard-subtitle">Role: {userProfile?.role || 'patient'}</p>
        {getDashboardContent()}
      </div>
    </Layout>
  );
};

export default Dashboard;

