// Vercel API route for getting a specific result by ID
import Result from '../../server/models/Result.js';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../server/utils/connectDb.js';

export default async function handler(req, res) {
  const { id } = req.query;

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

    // Get result by ID
    const result = await Result.findById(id).populate('quizId', 'title description');
    
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    // Check if the user owns this result
    if (result.userId.toString() !== decoded.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to access this result' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Server error getting result' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};