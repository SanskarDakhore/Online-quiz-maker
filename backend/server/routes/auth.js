import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { buildOtpPayload, hashOtp, isOtpExpired, isValidOtpFormat } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/otpEmail.js';

const router = express.Router();
const MAX_OTP_ATTEMPTS = 5;

const buildAuthResponse = (user) => ({
  uid: user.uid,
  name: user.name,
  email: user.email,
  role: user.role
});

const issueToken = (user) =>
  jwt.sign({ userId: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

// Middleware to check if database is connected
const checkDBConnection = (req, res, next) => {
  if (!mongoose.connection.readyState) {
    return res.status(503).json({ 
      error: 'Database connection failed. Please check MongoDB Atlas configuration.' 
    });
  }
  next();
};

// Register new user
router.post('/register', checkDBConnection, async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured on server' });
    }

    const { email, password, fullName, role } = req.body;
    const normalizedEmail = String(email || '').toLowerCase();

    if (!normalizedEmail || !password || !fullName || !role) {
      return res.status(400).json({ error: 'All fields are required: email, password, fullName, role' });
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Role must be teacher or student' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { otp, otpHash, otpExpiresAt } = buildOtpPayload(normalizedEmail);
    
    let user = existingUser;
    if (user) {
      user.name = fullName;
      user.password = hashedPassword;
      user.role = role;
      user.badges = role === 'student' ? ['Quiz Rookie'] : [];
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      user.otpAttempts = 0;
      user.isVerified = false;
    } else {
      const uid = uuidv4();
      user = new User({
        uid,
        name: fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        badges: role === 'student' ? ['Quiz Rookie'] : [],
        isVerified: false,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0
      });
    }

    await user.save();
    await sendOtpEmail({ to: normalizedEmail, otp, fullName: user.name });

    res.status(existingUser ? 200 : 201).json({
      requiresOtpVerification: true,
      email: normalizedEmail,
      message: 'OTP sent to your email. Please verify to complete registration.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-otp', checkDBConnection, async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured on server' });
    }

    const { email, otp } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    if (!normalizedEmail || !isValidOtpFormat(normalizedOtp)) {
      return res.status(400).json({ error: 'Valid email and 6-digit OTP are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      const token = issueToken(user);
      return res.json({ token, user: buildAuthResponse(user) });
    }

    if (isOtpExpired(user.otpExpiresAt)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    if ((user.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many invalid OTP attempts. Please request a new code.' });
    }

    const expectedHash = hashOtp(normalizedEmail, normalizedOtp);
    if (!user.otpHash || user.otpHash !== expectedHash) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    const token = issueToken(user);
    return res.json({ token, user: buildAuthResponse(user) });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/resend-otp', checkDBConnection, async (req, res) => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    const { otp, otpHash, otpExpiresAt } = buildOtpPayload(normalizedEmail);
    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0;
    await user.save();

    await sendOtpEmail({ to: normalizedEmail, otp, fullName: user.name });
    return res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', checkDBConnection, async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured on server' });
    }

    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase();
    console.log('Login attempt for email:', normalizedEmail);
    
    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('User found:', user.email, user.role);
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Account not verified. Please verify OTP before logging in.',
        requiresOtpVerification: true,
        email: user.email
      });
    }
    
    // Generate JWT token
    const token = issueToken(user);
    
    console.log('Login successful for user:', email, 'Role:', user.role);
    res.json({
      token,
      user: buildAuthResponse(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Get current user
router.get('/me', checkDBConnection, async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured on server' });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ uid: decoded.userId });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
