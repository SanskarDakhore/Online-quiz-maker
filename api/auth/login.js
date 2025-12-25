// Vercel API route for user login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../server/models/User.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: {
        uid: user._id.toString(),
        email: user.email,
        name: user.fullName || user.name,
        role: user.role
      }
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