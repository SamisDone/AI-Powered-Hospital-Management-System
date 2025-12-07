import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const sizeClass = `spinner-${size}`;
  
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className={`spinner ${sizeClass}`}></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return <div className={`spinner ${sizeClass}`}></div>;
};

export default LoadingSpinner;

