import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import User from '../../server/models/User.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { buildOtpPayload } from '../../server/utils/otp.js';
import { sendOtpEmail } from '../../server/utils/otpEmail.js';

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

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toLowerCase();

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
      user.password = hashedPassword;
      user.name = fullName.trim();
      user.role = normalizedRole;
      user.badges = normalizedRole === 'student' ? ['Quiz Rookie'] : [];
      user.isVerified = false;
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      user.otpAttempts = 0;
    } else {
      // Create new user
      user = new User({
        uid: randomUUID(),
        email: normalizedEmail,
        password: hashedPassword,
        name: fullName.trim(),
        role: normalizedRole,
        badges: normalizedRole === 'student' ? ['Quiz Rookie'] : [],
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
    res.status(500).json({ error: 'Server error during registration' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
