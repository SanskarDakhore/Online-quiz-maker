import Result from '../../server/models/Result.js';
import Quiz from '../../server/models/Quiz.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { serializeResult } from '../_lib/serializers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const user = await requireAuth(req, res);
    if (!user) return;
    if (!requireRole(user, 'student')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const results = await Result.find({ studentId: user.uid }).sort({ timestamp: -1 });
    const quizIds = [...new Set(results.map((r) => r.quizId))];
    const quizzes = await Quiz.find({ quizId: { $in: quizIds } });
    const quizMap = new Map(quizzes.map((q) => [q.quizId, q]));

    return res.status(200).json(results.map((result) => serializeResult(result, quizMap.get(result.quizId))));
  } catch (error) {
    console.error('Get my results error:', error);
    return res.status(500).json({ error: 'Server error getting user results' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
