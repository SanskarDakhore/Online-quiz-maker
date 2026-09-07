import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import User from '../../server/models/User.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { serializeUser } from '../../api/_lib/serializers.js';

const googleClient = new OAuth2Client();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured on server' });
    }

    const { credential, role = 'student' } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured on server' });
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId
      });
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({ error: 'Invalid Google authentication token' });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Unable to retrieve email from Google profile' });
    }

    const normalizedEmail = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || payload.given_name || normalizedEmail.split('@')[0];
    const avatar = payload.picture || null;

    let user = await User.findOne({
      $or: [
        { googleId },
        { email: normalizedEmail }
      ]
    });

    if (user) {
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        changed = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        user.otpHash = null;
        user.otpExpiresAt = null;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    } else {
      const validRole = ['teacher', 'student'].includes(role) ? role : 'student';
      user = new User({
        uid: uuidv4(),
        name,
        email: normalizedEmail,
        role: validRole,
        googleId,
        avatar,
        authProvider: 'google',
        isVerified: true,
        badges: validRole === 'student' ? ['Quiz Rookie'] : []
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user.uid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Google OAuth handler error:', error);
    return res.status(500).json({ error: 'Server error during Google authentication' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
