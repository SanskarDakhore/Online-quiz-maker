// Vercel API route for creating a new quiz
import Quiz from '../../server/models/Quiz.js';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../server/utils/connectDb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    const { title, description, category, difficulty, timer, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }

    // Create new quiz
    const quiz = new Quiz({
      title,
      description: description || '',
      category: category || 'General',
      difficulty: difficulty || 'Medium',
      timer: timer || 30,
      questions,
      creatorId: decoded.userId, // Store the creator's ID
      published: false // Default to unpublished
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quizId: quiz._id,
      title: quiz.title,
      creatorId: quiz.creatorId
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Server error creating quiz' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};