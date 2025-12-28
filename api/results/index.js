// Vercel API route for handling results
import Result from '../../server/models/Result.js';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../server/utils/connectDb.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get user's results
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

      // Get user's results
      const results = await Result.find({ userId: decoded.userId }).populate('quizId', 'title');
      
      res.status(200).json(results);
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({ error: 'Server error getting results' });
    }
  } else if (req.method === 'POST') {
    // Submit a new result
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

      const { quizId, score, totalQuestions, correctAnswers, answers } = req.body;

      if (!quizId || score === undefined || totalQuestions === undefined || correctAnswers === undefined) {
        return res.status(400).json({ error: 'Quiz ID, score, totalQuestions, and correctAnswers are required' });
      }

      // Create new result
      const result = new Result({
        quizId,
        userId: decoded.userId,
        score,
        baseScore: req.body.baseScore,
        hintsUsed: req.body.hintsUsed || 0,
        pointsDeductedForHints: req.body.pointsDeductedForHints || 0,
        totalQuestions,
        correctAnswers,
        answers: answers || []
      });

      await result.save();

      res.status(201).json({
        message: 'Result submitted successfully',
        resultId: result._id,
        score: result.score
      });
    } catch (error) {
      console.error('Submit result error:', error);
      res.status(500).json({ error: 'Server error submitting result' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};