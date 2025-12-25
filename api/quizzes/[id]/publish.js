// Vercel API route for publishing/unpublishing a quiz
import Quiz from '../../../server/models/Quiz.js';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../server/utils/connectDb.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
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

    const { published } = req.body;

    if (typeof published !== 'boolean') {
      return res.status(400).json({ error: 'Published field is required and must be a boolean' });
    }

    // Find the quiz and check if the user is the creator
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.creatorId.toString() !== decoded.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to publish this quiz' });
    }

    // Update published status
    quiz.published = published;
    await quiz.save();

    res.status(200).json({
      message: `Quiz ${published ? 'published' : 'unpublished'} successfully`,
      quizId: quiz._id,
      published: quiz.published
    });
  } catch (error) {
    console.error('Publish quiz error:', error);
    res.status(500).json({ error: 'Server error publishing quiz' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};