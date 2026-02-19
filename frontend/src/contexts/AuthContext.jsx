import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import sessionService from '../services/sessionService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new user
  const register = async (email, password, fullName, role) => {
    try {
      const data = await apiService.register(email, password, fullName, role);
      const user = data.user;
      
      setCurrentUser(user);
      setUserRole(user.role);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const data = await apiService.login(email, password);
      const user = data.user;
      
      // Create session for the user
      const session = sessionService.createSession(user.uid);
      
      // Store session ID in localStorage
      localStorage.setItem('current_session_id', session.sessionId);
      
      // Store current user in localStorage to prevent immediate redirects
      localStorage.setItem('current_user', JSON.stringify(user));
      
      setCurrentUser(user);
      setUserRole(user.role);
      
      return data;
    } catch (error) {
      console.error('Email/Password login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Remove current session
      const sessionId = localStorage.getItem('current_session_id');
      if (currentUser && sessionId) {
        sessionService.removeSession(currentUser.uid, sessionId);
        localStorage.removeItem('current_session_id');
      }
      
      // Remove current user from localStorage
      localStorage.removeItem('current_user');
      
      // Logout from API
      await apiService.logout();
      
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get current user
  const getCurrentUser = async () => {
    try {
      const data = await apiService.getCurrentUser();
      const user = data.user;
      
      // Update current user in localStorage
      localStorage.setItem('current_user', JSON.stringify(user));
      
      setCurrentUser(user);
      setUserRole(user.role);
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      // If token is invalid, logout
      if (error.message.includes('token') || error.message.includes('Session expired')) {
        await logout();
      }
      throw error;
    }
  };

  useEffect(() => {
    // Load sessions from storage
    sessionService.loadSessionsFromStorage();
    // Try to activate the database (resume paused Atlas cluster) when app loads
    // This call is non-blocking and will silently fail if not configured
    (async () => {
      try {
        await apiService.activateDb();
      } catch {}
    })();
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Instead of immediately calling getCurrentUser, check if we already have user data
      // This prevents immediate redirects after login
      const storedCurrentUser = localStorage.getItem('current_user');
      if (storedCurrentUser) {
        const user = JSON.parse(storedCurrentUser);
        setCurrentUser(user);
        setUserRole(user.role);
        setLoading(false);
        
        // Still verify the user in the background
        getCurrentUser()
          .catch(() => {});
      } else {
        getCurrentUser()
          .then(() => {
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
    
    // Set up token refresh interval
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        // In a real app, you might want to refresh the token here
        // For now, we'll just check if it's still valid
        getCurrentUser().catch((error) => {
          console.log('Token refresh failed:', error);
        });
      }
    }, 30 * 60 * 1000); // Check every 30 minutes
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    register,
    login,
    logout,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
