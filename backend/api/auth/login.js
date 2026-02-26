import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../server/models/User.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { serializeUser } from '../_lib/serializers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured on server' });
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Account not verified. Please verify OTP before logging in.',
        requiresOtpVerification: true,
        email: user.email
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.uid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
