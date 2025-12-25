// Vercel API route for getting a specific quiz by ID
import Quiz from '../../server/models/Quiz.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Connect to database
      await connectToDatabase();
      
      // Get quiz by ID
      const quiz = await Quiz.findById(id).select('-questions.options._id');
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Only return published quizzes (or all if we want to allow access to creator)
      if (!quiz.published) {
        // For now, we'll allow access to any quiz if found by ID
        // In a real app, you might want to check if the user is the creator
      }
      
      res.status(200).json(quiz);
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ error: 'Server error getting quiz' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Connect to database
      await connectToDatabase();
      
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const token = authHeader.split(' ')[1];
      const jwt = (await import('jsonwebtoken')).default;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const { title, description, category, difficulty, timer, questions, published } = req.body;

      // Find the quiz and check if the user is the creator
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      if (quiz.creatorId.toString() !== decoded.userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this quiz' });
      }

      // Update quiz
      quiz.title = title || quiz.title;
      quiz.description = description || quiz.description;
      quiz.category = category || quiz.category;
      quiz.difficulty = difficulty || quiz.difficulty;
      quiz.timer = timer || quiz.timer;
      quiz.questions = questions || quiz.questions;
      if (published !== undefined) {
        quiz.published = published;
      }

      await quiz.save();

      res.status(200).json({
        message: 'Quiz updated successfully',
        quizId: quiz._id,
        title: quiz.title
      });
    } catch (error) {
      console.error('Update quiz error:', error);
      res.status(500).json({ error: 'Server error updating quiz' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Connect to database
      await connectToDatabase();
      
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const token = authHeader.split(' ')[1];
      const jwt = (await import('jsonwebtoken')).default;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Find the quiz and check if the user is the creator
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      if (quiz.creatorId.toString() !== decoded.userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this quiz' });
      }

      await Quiz.deleteOne({ _id: id });

      res.status(200).json({
        message: 'Quiz deleted successfully'
      });
    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ error: 'Server error deleting quiz' });
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