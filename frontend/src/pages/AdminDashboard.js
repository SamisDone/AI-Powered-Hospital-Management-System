import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCollection } from '../firebase/utils';
import Layout from '../components/Layout';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResult, doctorsResult, appointmentsResult] = await Promise.all([
        getCollection('users', []),
        getCollection('users', [{ field: 'role', operator: '==', value: 'doctor' }]),
        getCollection('appointments', [])
      ]);

      setStats({
        totalUsers: usersResult.success ? usersResult.data.length : 0,
        totalDoctors: doctorsResult.success ? doctorsResult.data.length : 0,
        totalAppointments: appointmentsResult.success ? appointmentsResult.data.length : 0,
        pendingAppointments: appointmentsResult.success 
          ? appointmentsResult.data.filter(a => a.status === 'scheduled').length 
          : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Doctors</h3>
            <p className="stat-number">{stats.totalDoctors}</p>
          </div>
          <div className="stat-card">
            <h3>Total Appointments</h3>
            <p className="stat-number">{stats.totalAppointments}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Appointments</h3>
            <p className="stat-number">{stats.pendingAppointments}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

