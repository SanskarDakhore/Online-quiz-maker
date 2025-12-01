import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'admin'
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set the role based on active tab
    const role = activeTab === 'student' ? 'student' : 'teacher';
    
    // Update form data with correct role
    const submitData = {
      ...formData,
      role: role
    };
    
    // Validate form with updated data
    const newErrors = {};
    
    if (!submitData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(submitData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!submitData.password) {
      newErrors.password = 'Password is required';
    } else if (submitData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      setMessage('');
      
      const result = await login(submitData.email, submitData.password);
      console.log('Login successful, result:', result);
      
      // Add a small delay to ensure state is properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on role
      if (result.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/quizzes');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login';
      
      // Handle specific errors
      if (error.message) {
        errorMessage = error.message;
        // Provide more user-friendly error messages
        if (errorMessage.includes('Failed to connect')) {
          errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
        } else if (errorMessage.includes('Database connection failed')) {
          errorMessage = 'Database connection failed. Please check the MongoDB Atlas configuration.';
        } else if (errorMessage.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to continue your quiz journey</p>
        
        {message && (
          <div className={`auth-message ${message.includes('Failed') || message.includes('Cannot connect') || message.includes('Database connection') ? 'error' : ''}`}>
            {message}
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            Student Login
          </button>
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Teacher Login
          </button>
        </div>
        
        {/* Student Login Section */}
        {activeTab === 'student' && (
          <motion.div 
            className="login-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-description">
              <p>Login as a student to take quizzes and track your progress</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                  placeholder="Enter your student email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="Enter your password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              
              <input type="hidden" name="role" value="student" />

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login as Student'}
              </button>
            </form>
          </motion.div>
        )}
        
        {/* Admin Login Section */}
        {activeTab === 'admin' && (
          <motion.div 
            className="login-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-description">
              <p>Login as an admin/teacher to create and manage quizzes</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                  placeholder="Enter your admin email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="Enter your password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              
              <input type="hidden" name="role" value="teacher" />

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login as Teacher'}
              </button>
            </form>
          </motion.div>
        )}
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;