import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('Authenticating token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizmaster_secret');
    console.log('Decoded token:', decoded);
    const user = await User.findOne({ uid: decoded.userId });
    
    if (!user) {
      console.log('User not found for uid:', decoded.userId);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.log('User found:', user);
    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    console.log('Checking authorization for roles:', roles);
    console.log('User object:', req.user);
    
    if (!req.user) {
      console.log('No user object found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log('User role', req.user.role, 'not in allowed roles', roles);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    console.log('Authorization successful');
    next();
  };
};

export { authenticateToken, authorizeRole };