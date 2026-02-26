import jwt from 'jsonwebtoken';
import User from '../../server/models/User.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { serializeUser } from '../_lib/serializers.js';
import { hashOtp, isOtpExpired, isValidOtpFormat } from '../../server/utils/otp.js';

const MAX_OTP_ATTEMPTS = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

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
      const token = jwt.sign({ userId: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
      return res.status(200).json({ token, user: serializeUser(user) });
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

    const token = jwt.sign({ userId: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ token, user: serializeUser(user) });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Server error during OTP verification' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
