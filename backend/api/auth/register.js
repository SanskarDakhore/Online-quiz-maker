import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
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

    const { email, password, fullName, role } = req.body || {};

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'All fields are required: email, password, fullName, role' });
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Role must be teacher or student' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      uid: randomUUID(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: fullName.trim(),
      role: role.toLowerCase(),
      badges: role === 'student' ? ['Quiz Rookie'] : []
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.uid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
