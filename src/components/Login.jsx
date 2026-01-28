import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import '../bootstrap-theme.css';

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
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'}}>
      <motion.div 
        className="card card-glass p-4 shadow rounded-4 w-100" style={{ maxWidth: '450px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="gradient-text text-center mb-2">Welcome Back</h2>
        <p className="text-secondary text-center mb-4">Login to continue your quiz journey</p>
        
        {message && (
          <div className={`alert ${message.includes('Failed') || message.includes('Cannot connect') || message.includes('Database connection') ? 'alert-danger' : 'alert-success'} fade show`} role="alert">
            {message}
          </div>
        )}
        
        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4" id="authTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'student' ? 'active' : ''}`}
              id="student-tab"
              data-bs-toggle="tab"
              data-bs-target="#student"
              type="button"
              role="tab"
              aria-controls="student"
              aria-selected={activeTab === 'student'}
              onClick={() => setActiveTab('student')}
            >
              Student Login
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              id="teacher-tab"
              data-bs-toggle="tab"
              data-bs-target="#teacher"
              type="button"
              role="tab"
              aria-controls="teacher"
              aria-selected={activeTab === 'admin'}
              onClick={() => setActiveTab('admin')}
            >
              Teacher Login
            </button>
          </li>
        </ul>
        
        <div className="tab-content" id="authTabContent">
          {/* Student Login Section */}
          <div className={`tab-pane fade ${activeTab === 'student' ? 'show active' : ''}`} id="student" role="tabpanel" aria-labelledby="student-tab">
            <div className="mb-3 text-center">
              <p className="text-muted">Login as a student to take quizzes and track your progress</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control input-glass ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your student email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control input-glass ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              
              <input type="hidden" name="role" value="student" />

              <button type="submit" className="btn btn-gradient w-100 py-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : 'Login as Student'}
              </button>
            </form>
          </div>
          
          {/* Teacher Login Section */}
          <div className={`tab-pane fade ${activeTab === 'admin' ? 'show active' : ''}`} id="teacher" role="tabpanel" aria-labelledby="teacher-tab">
            <div className="mb-3 text-center">
              <p className="text-muted">Login as a teacher to create and manage quizzes</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control input-glass ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your teacher email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control input-glass ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              
              <input type="hidden" name="role" value="teacher" />

              <button type="submit" className="btn btn-gradient w-100 py-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : 'Login as Teacher'}
              </button>
            </form>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <p className="text-center mb-0">
          Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;