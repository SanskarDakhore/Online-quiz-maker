import Quiz from '../../server/models/Quiz.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import {
  serializeQuizForStudentPlay,
  serializeQuizForTeacher
} from '../_lib/serializers.js';

const findQuiz = async (quizId) => Quiz.findOne({ quizId });

export default async function handler(req, res) {
  const { id } = req.query;

  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const quiz = await findQuiz(id);
      if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

      if (!quiz.published && quiz.createdBy !== user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (user.role === 'teacher' && quiz.createdBy === user.uid) {
        return res.status(200).json(serializeQuizForTeacher(quiz));
      }

      return res.status(200).json(serializeQuizForStudentPlay(quiz));
    }

    if (!requireRole(user, 'teacher')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const quiz = await findQuiz(id);
    if (!quiz || quiz.createdBy !== user.uid) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }

    if (req.method === 'PUT') {
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

      if (title !== undefined) quiz.title = title;
      if (description !== undefined) quiz.description = description;
      if (category !== undefined) quiz.category = category;
      if (difficulty !== undefined) quiz.difficulty = difficulty;
      if (timer !== undefined) quiz.timer = timer;
      if (timerPerQuestion !== undefined) quiz.timerPerQuestion = !!timerPerQuestion;
      if (examMode !== undefined) quiz.examMode = !!examMode;
      if (resultReleaseMode !== undefined) quiz.resultReleaseMode = resultReleaseMode;
      if (resultReleaseDate !== undefined) quiz.resultReleaseDate = resultReleaseDate || null;
      if (questions !== undefined) quiz.questions = questions;
      if (published !== undefined) quiz.published = !!published;

      await quiz.save();
      return res.status(200).json(serializeQuizForTeacher(quiz));
    }

    await Quiz.deleteOne({ _id: quiz._id });
    return res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Quiz handler error:', error);
    return res.status(500).json({ error: 'Server error processing quiz request' });
  }
}

export const config = {
  api: {
    externalResolver: true
  }
};
