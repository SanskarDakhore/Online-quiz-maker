import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';
import '../bootstrap-theme.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { register } = useAuth();
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
    
    // Validate form
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      setMessage('');
      
      await register(formData.email, formData.password, formData.fullName, formData.role);
      
      // Redirect based on role
      if (formData.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/quizzes');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account';
      
      // Handle specific errors
      if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-vh-100 d-flex align-items-center justify-content-center p-3">
      <motion.div 
        className="auth-grid auth-grid-single w-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <section className="auth-hero card-glass">
          <p className="auth-kicker">Start Here</p>
          <h1>Create your classroom space.</h1>
          <p>Register as teacher to publish quizzes or as student to attempt and track progress.</p>
        </section>

        <section className="auth-panel card card-glass p-4 shadow rounded-4 w-100">
          <div className="theme-inline">
            <ThemeSwitcher compact />
          </div>
          <h2 className="gradient-text text-center mb-2">Create Account</h2>
          <p className="text-secondary text-center mb-4">Join our quiz platform today</p>
          
          {message && (
            <div className={`alert ${message.includes('Failed') ? 'alert-danger' : 'alert-success'} fade show`} role="alert">
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form-grid">
            <div className="auth-field">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-control input-glass ${errors.fullName ? 'is-invalid' : ''}`}
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
            </div>
            
            <div className="auth-field">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control input-glass ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            
            <div className="auth-field">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className={`form-control input-glass ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            
            <div className="auth-field">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className={`form-control input-glass ${errors.confirmPassword ? 'is-invalid' : ''}`}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
            
            <div className="auth-field">
              <label htmlFor="role" className="form-label">I am a...</label>
              <select
                className="form-select input-glass"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-gradient w-100 py-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : 'Register'}
            </button>
          </form>
          
          <hr className="my-4" />
          
          <p className="text-center mb-0">
            Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link>
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export default Register;
