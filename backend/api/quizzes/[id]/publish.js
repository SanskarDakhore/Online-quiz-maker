import Quiz from '../../../server/models/Quiz.js';
import { connectToDatabase } from '../../../server/utils/connectDb.js';
import { requireAuth, requireRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    const user = await requireAuth(req, res);
    if (!user) return;
    if (!requireRole(user, 'teacher')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { published } = req.body;

    if (typeof published !== 'boolean') {
      return res.status(400).json({ error: 'Published field is required and must be a boolean' });
    }

    // Find the quiz and check if the user is the creator
    const quiz = await Quiz.findOne({ quizId: id });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.createdBy !== user.uid) {
      return res.status(403).json({ error: 'Not authorized to publish this quiz' });
    }

    // Update published status
    quiz.published = published;
    await quiz.save();

    res.status(200).json({
      message: `Quiz ${published ? 'published' : 'unpublished'} successfully`,
      quizId: quiz.quizId,
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
