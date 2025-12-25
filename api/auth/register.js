// Vercel API route for user registration
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
    
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'All fields are required: email, password, fullName, role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      role: role.toLowerCase() // Ensure role is lowercase
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        uid: user._id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role
      }
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