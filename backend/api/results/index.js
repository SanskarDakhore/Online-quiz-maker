import Result from '../../server/models/Result.js';
import Quiz from '../../server/models/Quiz.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { createScoredResult } from '../_lib/results.js';
import { serializeResult } from '../_lib/serializers.js';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      if (!requireRole(user, 'student')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const results = await Result.find({ studentId: user.uid }).sort({ timestamp: -1 });
      const quizIds = [...new Set(results.map((r) => r.quizId))];
      const quizzes = await Quiz.find({ quizId: { $in: quizIds } });
      const quizMap = new Map(quizzes.map((q) => [q.quizId, q]));

      return res.status(200).json(results.map((result) => serializeResult(result, quizMap.get(result.quizId))));
    }

    if (!requireRole(user, 'student')) {
      return res.status(403).json({ error: 'Only students can submit results' });
    }

    const {
      quizId,
      answers,
      tabSwitchCount,
      autoSubmitReason,
      timeTaken,
      hintsUsed
    } = req.body || {};

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'quizId and answers are required' });
    }

    const submission = await createScoredResult({
      quizId,
      studentId: user.uid,
      answers,
      tabSwitchCount,
      autoSubmitReason,
      timeTaken,
      hintsUsed
    });

    if (submission.error) {
      return res.status(submission.status || 400).json({ error: submission.error });
    }

    return res.status(201).json({
      ...submission.result,
      ...submission.quizMeta
    });
  } catch (error) {
    console.error('Results handler error:', error);
    return res.status(500).json({ error: 'Server error processing results request' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
