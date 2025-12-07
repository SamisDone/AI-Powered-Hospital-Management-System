import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to access this page.</p>
        <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  );
};

export default Unauthorized;

