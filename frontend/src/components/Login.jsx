import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import GoogleAuthButton from './GoogleAuthButton';
import ThemeSwitcher from './ThemeSwitcher';
import './Auth.css';
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
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'teacher'
  const [activePanel, setActivePanel] = useState('login'); // 'login' | 'intro'
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const role = activeTab === 'student' ? 'student' : 'teacher';
    const submitData = {
      ...formData,
      role
    };

    const newErrors = {};

    if (!submitData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(submitData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!submitData.password) {
      newErrors.password = 'Password is required';
    } else if (submitData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      setMessage('');

      const result = await login(submitData.email, submitData.password);
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (result?.user?.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/quizzes');
      }
    } catch (error) {
      let errorMessage = 'Failed to login';

      if (error.message) {
        errorMessage = error.message;
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

  const handleGoogleSuccess = (result) => {
    if (result?.user?.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/quizzes');
    }
  };

  const activeRoleColor = activeTab === 'student' ? 'rgba(16, 185, 129, 0.45)' : 'rgba(245, 158, 11, 0.45)';

  return (
    <div className="auth-ambient-canvas">
      {/* Concentric Water Drop Ripples in Background */}
      <div className="water-ripple-container">
        <div className="water-ripple" />
        <div className="water-ripple" />
        <div className="water-ripple" />
      </div>

      {/* Dynamic Animated Liquid Orbs */}
      <div className="liquid-orb-layer">
        <div className="liquid-orb liquid-orb-1" />
        <div className="liquid-orb liquid-orb-2" />
        <div className="liquid-orb liquid-orb-3" />
        <div className="liquid-orb liquid-orb-4" />
      </div>

      {/* 3D Perspective Card Container */}
      <div className={`liquid-card-perspective ${activePanel === 'intro' ? 'wide-mode' : ''}`}>
        <motion.div
          className="liquid-glass-card"
          style={{ '--liquid-card-glow': activeRoleColor }}
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3 }}
        >
          {/* Top Brand & Utility Bar */}
          <div className="liquid-brand-row">
            <Link to="/" className="liquid-brand-badge" title="QuizMaster Home">
              <span className="liquid-brand-emblem">
                <i className="bi bi-mortarboard-fill"></i>
              </span>
              <span className="liquid-brand-text">QuizMaster</span>
            </Link>
            <ThemeSwitcher single />
          </div>

          <AnimatePresence mode="wait">
            {activePanel === 'intro' ? (
              /* --- INTRO VIEW --- */
              <motion.div
                key="intro-panel"
                className="liquid-intro-container"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="liquid-intro-pill">
                  <i className="bi bi-droplet-half"></i> Pure Liquid Learning
                </div>
                <h1 className="liquid-intro-title">Build. Publish. Master learning.</h1>
                <p className="liquid-intro-desc">
                  Teachers launch assessments quickly with real-time analytics. Students learn with instant, structured feedback and tracked credentials.
                </p>

                <div className="liquid-intro-features">
                  <div className="liquid-feature-item">
                    <div className="liquid-feature-icon">
                      <i className="bi bi-speedometer2"></i>
                    </div>
                    <div className="liquid-feature-text">
                      <strong>Role-based Dashboards</strong>
                      <span>Dedicated control centers for educators and learners</span>
                    </div>
                  </div>

                  <div className="liquid-feature-item">
                    <div className="liquid-feature-icon">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <div className="liquid-feature-text">
                      <strong>Secure Real-Time Scoring</strong>
                      <span>Automated evaluation with tamper-resistant audit logs</span>
                    </div>
                  </div>

                  <div className="liquid-feature-item">
                    <div className="liquid-feature-icon">
                      <i className="bi bi-award-fill"></i>
                    </div>
                    <div className="liquid-feature-text">
                      <strong>Exam Mode + Certificate Generation</strong>
                      <span>Automated completion certificates upon qualifying scores</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-liquid-hero btn-liquid-neutral"
                  onClick={() => setActivePanel('login')}
                  style={{ maxWidth: 320 }}
                >
                  <span>Continue to Sign In</span>
                  <i className="bi bi-arrow-right"></i>
                </motion.button>
              </motion.div>
            ) : (
              /* --- LOGIN VIEW --- */
              <motion.div
                key="login-panel"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Header Titles */}
                <div className="liquid-auth-header text-center">
                  <div className="liquid-header-titles">
                    <h2>Welcome Back</h2>
                  </div>
                  <p className="liquid-header-subtitle">
                    Enter your credentials to continue your quiz journey
                  </p>
                </div>

                {/* Status / Error Message */}
                {message && (
                  <div
                    className={`liquid-alert ${
                      message.includes('Failed') ||
                      message.includes('Cannot connect') ||
                      message.includes('Database connection') ||
                      message.includes('Invalid')
                        ? 'liquid-alert-danger'
                        : 'liquid-alert-success'
                    }`}
                    role="alert"
                  >
                    <i
                      className={`bi ${
                        message.includes('Failed') || message.includes('Invalid')
                          ? 'bi-exclamation-triangle-fill'
                          : 'bi-check-circle-fill'
                      }`}
                    ></i>
                    <div>{message}</div>
                  </div>
                )}

                {/* Segmented Role Switcher with Spring Indicator */}
                <div className="liquid-segmented-track" role="tablist" aria-label="Choose Login Role">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'student'}
                    className={`liquid-segmented-tab ${activeTab === 'student' ? 'active' : ''}`}
                    onClick={() => setActiveTab('student')}
                  >
                    <i className="bi bi-mortarboard-fill"></i>
                    <span>Student Login</span>
                    {activeTab === 'student' && (
                      <motion.div
                        layoutId="activeLoginRolePill"
                        className="liquid-active-pill pill-student"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'teacher'}
                    className={`liquid-segmented-tab ${activeTab === 'teacher' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teacher')}
                  >
                    <i className="bi bi-person-video3"></i>
                    <span>Teacher Login</span>
                    {activeTab === 'teacher' && (
                      <motion.div
                        layoutId="activeLoginRolePill"
                        className="liquid-active-pill pill-teacher"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                  </button>
                </div>

                {/* Role description micro-tip */}
                <div className="liquid-role-badge-tip">
                  <i className="bi bi-droplet"></i>
                  <span>
                    {activeTab === 'student'
                      ? 'Access student quizzes, track scores & view certificates'
                      : 'Create exams, publish tests & view student gradebooks'}
                  </span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="liquid-form-grid" noValidate>
                  {/* Email Field */}
                  <div className="liquid-field-group">
                    <label htmlFor="email" className="liquid-label">
                      <span>{activeTab === 'student' ? 'Student Email' : 'Teacher Email'}</span>
                    </label>
                    <div className="liquid-input-wrapper">
                      <i className="bi bi-envelope liquid-input-icon"></i>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        className={`liquid-input ${errors.email ? 'is-invalid' : ''}`}
                        placeholder={activeTab === 'student' ? 'name@student.edu' : 'teacher@institution.edu'}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <div className="liquid-field-error">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="liquid-field-group">
                    <label htmlFor="password" className="liquid-label">
                      <span>Password</span>
                    </label>
                    <div className="liquid-input-wrapper">
                      <i className="bi bi-lock liquid-input-icon"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        className={`liquid-input has-toggle ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter your secret password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="liquid-input-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                      </button>
                    </div>
                    {errors.password && (
                      <div className="liquid-field-error">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  {/* Liquid Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className={`btn-liquid-hero ${activeTab === 'student' ? 'btn-liquid-student' : 'btn-liquid-teacher'} mt-2`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>{activeTab === 'student' ? 'Login as Student' : 'Login as Teacher'}</span>
                        <i className="bi bi-arrow-right-short" style={{ fontSize: '1.25rem' }}></i>
                      </>
                    )}
                  </motion.button>

                  {/* Glass Divider */}
                  <div className="liquid-divider">
                    <div className="liquid-divider-line"></div>
                    <span className="liquid-divider-badge">or continue with</span>
                    <div className="liquid-divider-line"></div>
                  </div>

                  {/* Google OAuth Button */}
                  <div className="liquid-google-wrapper">
                    <GoogleAuthButton
                      role={activeTab === 'student' ? 'student' : 'teacher'}
                      buttonText="signin_with"
                      onSuccess={handleGoogleSuccess}
                      onError={(err) => setMessage(err.message || 'Failed to sign in with Google')}
                    />
                  </div>
                </form>

                {/* Card Footer */}
                <div className="liquid-card-footer">
                  <button
                    type="button"
                    className="liquid-footer-btn"
                    onClick={() => setActivePanel('intro')}
                  >
                    <i className="bi bi-compass"></i>
                    <span>Quick Overview</span>
                  </button>

                  <p className="liquid-footer-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="liquid-footer-link">
                      Register here
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
