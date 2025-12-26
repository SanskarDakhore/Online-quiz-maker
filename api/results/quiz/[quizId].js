// Vercel API route for getting results for a specific quiz
import Result from '../../../server/models/Result.js';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../server/utils/connectDb.js';

export default async function handler(req, res) {
  const { quizId } = req.query;

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

    // Get results for the specific quiz
    const results = await Result.find({ quizId: quizId }).populate('userId', 'fullName email');
    
    // Additional check: ensure the user is the creator of the quiz or an admin
    // For now, we'll allow access if the user is authenticated
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Server error getting quiz results' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};