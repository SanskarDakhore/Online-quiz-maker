import User from '../../server/models/User.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { buildOtpPayload } from '../../server/utils/otp.js';
import { sendOtpEmail } from '../../server/utils/otpEmail.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

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
    return res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Server error during OTP resend' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
