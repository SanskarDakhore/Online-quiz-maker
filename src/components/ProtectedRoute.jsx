import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  // Debug logging
  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - userRole:', userRole);
  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - requiredRole:', requiredRole);
  
  // Additional debug info
  console.log('ProtectedRoute - localStorage token:', localStorage.getItem('token'));
  console.log('ProtectedRoute - localStorage current_user:', localStorage.getItem('current_user'));
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }
  
  // If no user, redirect to login
  if (!currentUser) {
    console.log('No current user, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // If user exists but role not loaded yet, show loading
  if (currentUser && userRole === null) {
    // This could be a permissions issue, show a friendly message
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', padding: '20px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Loading your profile...
          <br />
          <small>If this takes too long, please check your permissions.</small>
        </p>
      </div>
    );
  }
  
  // Check if role matches required role
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch. Required: ${requiredRole}, Current: ${userRole}`);
    // Show a more informative message
    return (
      <div className="protected-route-container">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required role: {requiredRole}, Your role: {userRole}</p>
        <button 
          onClick={() => window.history.back()} 
          className="protected-route-back-btn"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;