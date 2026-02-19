import { connectToDatabase } from '../../server/utils/connectDb.js';
import { requireAuth } from '../_lib/auth.js';
import { serializeUser } from '../_lib/serializers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    const user = await requireAuth(req, res);
    if (!user) return;

    res.status(200).json({
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error getting user profile' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
