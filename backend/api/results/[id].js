import Result from '../../server/models/Result.js';
import Quiz from '../../server/models/Quiz.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { requireAuth } from '../_lib/auth.js';
import { serializeResult } from '../_lib/serializers.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const user = await requireAuth(req, res);
    if (!user) return;

    const result = await Result.findOne({ resultId: id });
    if (!result) return res.status(404).json({ error: 'Result not found' });

    const quiz = await Quiz.findOne({ quizId: result.quizId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found for this result' });

    const canAccess =
      (user.role === 'student' && result.studentId === user.uid) ||
      (user.role === 'teacher' && quiz.createdBy === user.uid);

    if (!canAccess) {
      return res.status(403).json({ error: 'Not authorized to access this result' });
    }

    return res.status(200).json(serializeResult(result, quiz, { includeReviewQuestions: true }));
  } catch (error) {
    console.error('Get result error:', error);
    return res.status(500).json({ error: 'Server error getting result' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
