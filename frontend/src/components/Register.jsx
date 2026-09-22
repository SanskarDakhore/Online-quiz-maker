import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import GoogleAuthButton from './GoogleAuthButton';
import ThemeSwitcher from './ThemeSwitcher';
import './Auth.css';
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
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingRole, setPendingRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const response = await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      );

      if (response?.requiresOtpVerification) {
        setOtpMode(true);
        setPendingEmail(response.email || formData.email.trim().toLowerCase());
        setPendingRole(formData.role);
        setMessage(response.message || 'OTP sent! Please check your inbox to activate your account.');
        return;
      }

      if (response?.user?.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (response?.user?.role === 'student') {
        navigate('/student/quizzes');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account';

      if (error.message) {
        errorMessage = error.message;
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submission
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    if (!/^\d{6}$/.test(otpCode.trim())) {
      setErrors({ otp: 'Enter the 6-digit verification code' });
      return;
    }

    try {
      setLoading(true);
      const response = await verifyRegistrationOtp(pendingEmail, otpCode.trim());
      const role = response?.user?.role || pendingRole;

      if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/quizzes');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage(error.message || 'Failed to verify code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setMessage('');
      await resendRegistrationOtp(pendingEmail);
      setMessage('A fresh 6-digit verification code has been dispatched to your email.');
    } catch (error) {
      console.error('OTP resend error:', error);
      setMessage(error.message || 'Failed to resend code. Please wait a moment before retrying.');
    } finally {
      setLoading(false);
    }
  };

  const activeRoleColor = formData.role === 'student' ? 'rgba(16, 185, 129, 0.45)' : 'rgba(245, 158, 11, 0.45)';

  return (
    <div className="auth-ambient-canvas">
      {/* Concentric Water Drop Ripples in Background */}
      <div className="water-ripple-container">
        <div className="water-ripple" />
        <div className="water-ripple" />
        <div className="water-ripple" />
      </div>

      {/* Ambient Moving Liquid Orbs */}
      <div className="liquid-orb-layer">
        <div className="liquid-orb liquid-orb-1" />
        <div className="liquid-orb liquid-orb-2" />
        <div className="liquid-orb liquid-orb-3" />
        <div className="liquid-orb liquid-orb-4" />
      </div>

      {/* 3D Perspective Card Container */}
      <div className="liquid-card-perspective">
        <motion.div
          className="liquid-glass-card"
          style={{ '--liquid-card-glow': activeRoleColor }}
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3 }}
        >
          {/* Top Branding & Theme Toggle */}
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
            {!otpMode ? (
              /* --- REGISTRATION FORM --- */
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.32, ease: 'easeInOut' }}
              >
                {/* Header Titles */}
                <div className="liquid-auth-header text-center">
                  <div className="liquid-header-titles">
                    <h2>Create Account</h2>
                  </div>
                  <p className="liquid-header-subtitle">
                    Join our quiz community as an educator or active learner
                  </p>
                </div>

                {/* Status / Error Message */}
                {message && (
                  <div
                    className={`liquid-alert ${
                      message.includes('Failed') ? 'liquid-alert-danger' : 'liquid-alert-success'
                    }`}
                    role="alert"
                  >
                    <i
                      className={`bi ${
                        message.includes('Failed') ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'
                      }`}
                    ></i>
                    <div>{message}</div>
                  </div>
                )}

                {/* Interactive Role Selection Cards */}
                <div className="mb-3">
                  <label className="liquid-label mb-2">
                    <span>Select Account Type</span>
                  </label>
                  <div className="liquid-role-cards-grid">
                    <div
                      className={`liquid-role-card ${formData.role === 'student' ? 'active role-student' : ''}`}
                      onClick={() => handleRoleSelect('student')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="liquid-role-card-icon">
                        <i className="bi bi-mortarboard-fill"></i>
                      </div>
                      <div className="liquid-role-card-title">Student</div>
                      <div className="liquid-role-card-desc">Take tests & track mastery</div>
                    </div>

                    <div
                      className={`liquid-role-card ${formData.role === 'teacher' ? 'active role-teacher' : ''}`}
                      onClick={() => handleRoleSelect('teacher')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="liquid-role-card-icon">
                        <i className="bi bi-person-video3"></i>
                      </div>
                      <div className="liquid-role-card-title">Teacher</div>
                      <div className="liquid-role-card-desc">Publish exams & evaluate</div>
                    </div>
                  </div>
                </div>

                {/* Registration Fields */}
                <form onSubmit={handleSubmit} className="liquid-form-grid" noValidate>
                  {/* Full Name */}
                  <div className="liquid-field-group">
                    <label htmlFor="fullName" className="liquid-label">
                      <span>Full Name</span>
                    </label>
                    <div className="liquid-input-wrapper">
                      <i className="bi bi-person liquid-input-icon"></i>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        autoComplete="name"
                        className={`liquid-input ${errors.fullName ? 'is-invalid' : ''}`}
                        placeholder="e.g. Alex Morgan"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.fullName && (
                      <div className="liquid-field-error">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{errors.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="liquid-field-group">
                    <label htmlFor="email" className="liquid-label">
                      <span>Email Address</span>
                    </label>
                    <div className="liquid-input-wrapper">
                      <i className="bi bi-envelope liquid-input-icon"></i>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        className={`liquid-input ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="alex@example.com"
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

                  {/* Password */}
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
                        autoComplete="new-password"
                        className={`liquid-input has-toggle ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="At least 6 characters"
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

                  {/* Confirm Password */}
                  <div className="liquid-field-group">
                    <label htmlFor="confirmPassword" className="liquid-label">
                      <span>Confirm Password</span>
                    </label>
                    <div className="liquid-input-wrapper">
                      <i className="bi bi-shield-check liquid-input-icon"></i>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        autoComplete="new-password"
                        className={`liquid-input has-toggle ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="liquid-input-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="liquid-field-error">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className={`btn-liquid-hero ${formData.role === 'student' ? 'btn-liquid-student' : 'btn-liquid-teacher'} mt-2`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <span>Creating Your Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Register as {formData.role === 'student' ? 'Student' : 'Teacher'}</span>
                        <i className="bi bi-arrow-right-short" style={{ fontSize: '1.25rem' }}></i>
                      </>
                    )}
                  </motion.button>

                  {/* Glass Divider */}
                  <div className="liquid-divider">
                    <div className="liquid-divider-line"></div>
                    <span className="liquid-divider-badge">or sign up with</span>
                    <div className="liquid-divider-line"></div>
                  </div>

                  {/* Google OAuth Button */}
                  <div className="liquid-google-wrapper">
                    <GoogleAuthButton
                      role={formData.role}
                      buttonText="signup_with"
                      onSuccess={(result) => {
                        if (result?.user?.role === 'teacher') {
                          navigate('/teacher/dashboard');
                        } else {
                          navigate('/student/quizzes');
                        }
                      }}
                      onError={(err) => setMessage(err.message || 'Failed to sign up with Google')}
                    />
                  </div>
                </form>

                {/* Footer */}
                <div className="liquid-card-footer justify-content-center">
                  <p className="liquid-footer-text">
                    Already have an account?{' '}
                    <Link to="/login" className="liquid-footer-link">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* --- OTP VERIFICATION CARD --- */
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.32, ease: 'easeInOut' }}
              >
                <div className="liquid-otp-header">
                  <div className="liquid-otp-emblem">
                    <i className="bi bi-shield-lock-fill"></i>
                  </div>
                  <div className="liquid-header-titles">
                    <h2>Verify Your Email</h2>
                  </div>
                  <p className="liquid-header-subtitle">
                    We sent a 6-digit confirmation code to <br />
                    <strong className="text-white">{pendingEmail}</strong>
                  </p>
                </div>

                {message && (
                  <div
                    className={`liquid-alert ${
                      message.includes('Failed') ? 'liquid-alert-danger' : 'liquid-alert-success'
                    }`}
                    role="alert"
                  >
                    <i
                      className={`bi ${
                        message.includes('Failed') ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'
                      }`}
                    ></i>
                    <div>{message}</div>
                  </div>
                )}

                <form onSubmit={handleOtpVerification} className="liquid-form-grid" noValidate>
                  <div className="liquid-field-group">
                    <label htmlFor="otp" className="liquid-label justify-content-center">
                      <span>Enter 6-Digit Code</span>
                    </label>
                    <div className="liquid-input-wrapper">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        id="otp"
                        name="otp"
                        autoFocus
                        className={`liquid-input liquid-otp-input ${errors.otp ? 'is-invalid' : ''}`}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ''));
                          if (errors.otp) setErrors({});
                        }}
                        disabled={loading}
                      />
                    </div>
                    {errors.otp && (
                      <div className="liquid-field-error justify-content-center">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{errors.otp}</span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="btn-liquid-hero btn-liquid-student mt-2"
                    disabled={loading || otpCode.length < 6}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle" style={{ fontSize: '1.2rem' }}></i>
                        <span>Verify & Activate Account</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    className="liquid-footer-btn w-100 justify-content-center py-2"
                    disabled={loading}
                    onClick={handleResendOtp}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                    <span>Resend Code to Email</span>
                  </button>
                </form>

                <div className="liquid-card-footer justify-content-center">
                  <button
                    type="button"
                    className="liquid-footer-btn"
                    onClick={() => setOtpMode(false)}
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Back to Registration</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
