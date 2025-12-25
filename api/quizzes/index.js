// Vercel API route for getting all quizzes
import Quiz from '../../server/models/Quiz.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    // Get all published quizzes
    const quizzes = await Quiz.find({ published: true }).select('-questions.options._id');
    
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Server error getting quizzes' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};