import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [activePanel, setActivePanel] = useState('intro'); // 'intro' | 'login'

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

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      setMessage('');

      const result = await login(submitData.email, submitData.password);
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (result.user.role === 'teacher') {
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

  return (
    <div className="auth-shell min-vh-100 d-flex align-items-center justify-content-center p-3">
      <motion.div
        className="auth-module-wrap w-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <section className="auth-module-stack card-glass">
          <AnimatePresence mode="wait">
            {activePanel === 'intro' && (
              <motion.div
                key="intro-panel"
                className="auth-panel-layer auth-intro-layer"
                initial={{ opacity: 0, y: -26, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.985 }}
                transition={{ duration: 0.34, ease: 'easeInOut' }}
              >
                <p className="auth-kicker">QuizMaster</p>
                <h1 className="mb-3">Build. Publish. Master learning.</h1>
                <p className="mb-4">Teachers launch assessments quickly. Students learn with instant, structured feedback.</p>
                <div className="auth-hero-points mb-4">
                  <span>Role-based dashboards</span>
                  <span>Secure result scoring</span>
                  <span>Exam mode + tracking</span>
                </div>
                <button className="btn btn-gradient px-4" onClick={() => setActivePanel('login')}>
                  Continue to Login
                </button>
              </motion.div>
            )}

            {activePanel === 'login' && (
              <motion.div
                key="login-panel"
                className="auth-panel-layer auth-login-layer"
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.985 }}
                transition={{ duration: 0.34, ease: 'easeInOut' }}
              >
                <h2 className="gradient-text text-center mb-2">Welcome Back</h2>
                <p className="text-secondary text-center mb-4">Login to continue your quiz journey</p>

                {message && (
                  <div
                    className={`alert ${message.includes('Failed') || message.includes('Cannot connect') || message.includes('Database connection') ? 'alert-danger' : 'alert-success'} fade show`}
                    role="alert"
                  >
                    {message}
                  </div>
                )}

                <ul className="nav nav-tabs mb-4" id="authTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'student' ? 'active' : ''}`}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'student'}
                      onClick={() => setActiveTab('student')}
                    >
                      Student Login
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'admin'}
                      onClick={() => setActiveTab('admin')}
                    >
                      Teacher Login
                    </button>
                  </li>
                </ul>

                <div className="tab-content" id="authTabContent">
                  <div className={`tab-pane fade ${activeTab === 'student' ? 'show active' : ''}`}>
                    <div className="mb-3 text-center">
                      <p className="text-muted">Login as a student to take quizzes and track your progress</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form-grid">
                      <div className="auth-field">
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

                      <div className="auth-field">
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

                  <div className={`tab-pane fade ${activeTab === 'admin' ? 'show active' : ''}`}>
                    <div className="mb-3 text-center">
                      <p className="text-muted">Login as a teacher to create and manage quizzes</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form-grid">
                      <div className="auth-field">
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

                      <div className="auth-field">
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

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setActivePanel('intro')}>
                    Back to Intro
                  </button>
                  <p className="text-center mb-0">
                    Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>
    </div>
  );
};

export default Login;
