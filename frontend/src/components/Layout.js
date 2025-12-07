import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../firebase/utils';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!userProfile) return [];
    
    const role = userProfile.role;
    
    if (role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'Profile' },
        { path: '/admin/doctors', label: 'Manage Doctors' },
        { path: '/admin/appointments', label: 'All Appointments' },
        { path: '/admin/users', label: 'Manage Users' }
      ];
    } else if (role === 'doctor') {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'Profile' },
        { path: '/doctor/availability', label: 'Availability' },
        { path: '/doctor/appointments', label: 'My Appointments' }
      ];
    } else {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'Profile' },
        { path: '/doctors/search', label: 'Find Doctors' },
        { path: '/appointments', label: 'My Appointments' }
      ];
    }
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <Link to="/dashboard">MediHub</Link>
          </div>
          <div className="nav-user">
            <span>{userProfile?.firstName} {userProfile?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="layout-content">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

