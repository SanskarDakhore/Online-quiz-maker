import Result from '../../../server/models/Result.js';
import Quiz from '../../../server/models/Quiz.js';
import User from '../../../server/models/User.js';
import { connectToDatabase } from '../../../server/utils/connectDb.js';
import { requireAuth, requireRole } from '../../_lib/auth.js';
import { serializeResult } from '../../_lib/serializers.js';

export default async function handler(req, res) {
  const { quizId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const user = await requireAuth(req, res);
    if (!user) return;
    if (!requireRole(user, 'teacher')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz || quiz.createdBy !== user.uid) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }

    const results = await Result.find({ quizId }).sort({ timestamp: -1 });
    const studentIds = [...new Set(results.map((r) => r.studentId))];
    const students = await User.find({ uid: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s.uid, s]));

    const payload = results.map((result) => {
      const base = serializeResult(result, quiz);
      const student = studentMap.get(result.studentId);
      return {
        ...base,
        studentName: student?.name || 'Unknown Student',
        studentEmail: student?.email || null
      };
    });

    return res.status(200).json(payload);
  } catch (error) {
    console.error('Get quiz results error:', error);
    return res.status(500).json({ error: 'Server error getting quiz results' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
