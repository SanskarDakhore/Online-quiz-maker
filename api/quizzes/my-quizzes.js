// Vercel API route for getting user's own quizzes
import Quiz from '../../server/models/Quiz.js';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../server/utils/connectDb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get quizzes created by the user
    const quizzes = await Quiz.find({ creatorId: decoded.userId });
    
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({ error: 'Server error getting user quizzes' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};