import Quiz from '../../server/models/Quiz.js';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import {
  serializeQuizForStudentList,
  serializeQuizForTeacher
} from '../_lib/serializers.js';

const normalizeTimerMinutes = (value, fallback = 10) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const quizzes = await Quiz.find({ published: true }).sort({ createdAt: -1 });
      return res.status(200).json(quizzes.map(serializeQuizForStudentList));
    }

    if (!requireRole(user, 'teacher')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const {
      title,
      description,
      category,
      difficulty,
      timer,
      timerPerQuestion,
      examMode,
      resultReleaseMode,
      resultReleaseDate,
      questions,
      published
    } = req.body || {};

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }

    const quiz = new Quiz({
      quizId: uuidv4(),
      title,
      description: description || '',
      category: category || 'General',
      difficulty: difficulty || 'Medium',
      timer: normalizeTimerMinutes(timer, 10),
      timerPerQuestion: !!timerPerQuestion,
      examMode: !!examMode,
      resultReleaseMode: resultReleaseMode || 'immediate',
      resultReleaseDate: resultReleaseDate || null,
      questions,
      createdBy: user.uid,
      published: !!published
    });

    await quiz.save();
    return res.status(201).json(serializeQuizForTeacher(quiz));
  } catch (error) {
    console.error('Quizzes handler error:', error);
    return res.status(500).json({ error: 'Server error processing quizzes request' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
