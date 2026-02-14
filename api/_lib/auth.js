import jwt from 'jsonwebtoken';
import User from '../../server/models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

export const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, JWT_SECRET);
};

export const requireAuth = async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return null;
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    if (error.message === 'JWT_SECRET is not configured') {
      res.status(500).json({ error: 'JWT_SECRET is not configured on server' });
      return null;
    }
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  const user = await User.findOne({ uid: decoded.userId });
  if (!user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  return user;
};

export const requireRole = (user, ...roles) => {
  return roles.includes(user.role);
};
