import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

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
    const { email, password, fullName, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const uid = uuidv4();
    const user = new User({
      uid,
      name: fullName,
      email,
      password: hashedPassword,
      role,
      badges: role === 'student' ? ['Quiz Rookie'] : []
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.uid, role: user.role },
      process.env.JWT_SECRET || 'quizmaster_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', checkDBConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Find user
    const user = await User.findOne({ email });
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
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.uid, role: user.role },
      process.env.JWT_SECRET || 'quizmaster_secret',
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for user:', email, 'Role:', user.role);
    res.json({
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Get current user
router.get('/me', checkDBConnection, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizmaster_secret');
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;