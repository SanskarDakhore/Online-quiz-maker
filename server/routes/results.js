import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

const serializeResult = (result, quiz = null, student = null) => ({
  resultId: result.resultId,
  quizId: result.quizId,
  quizTitle: quiz?.title || 'Untitled Quiz',
  studentId: result.studentId,
  studentName: student?.name || undefined,
  studentEmail: student?.email || undefined,
  score: result.score,
  baseScore: result.baseScore ?? result.score,
  hintsUsed: result.hintsUsed || 0,
  pointsDeductedForHints: result.pointsDeductedForHints || 0,
  correctAnswers: result.correctAnswers,
  totalQuestions: result.totalQuestions,
  answers: result.answers || [],
  timestamp: result.timestamp,
  autoSubmitted: !!result.autoSubmitted,
  autoSubmitReason: result.autoSubmitReason || null,
  tabSwitchCount: result.tabSwitchCount || 0,
  timeTaken: result.timeTaken ?? null
});

// Submit quiz result
router.post('/', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { quizId, answers, autoSubmitReason, tabSwitchCount, timeTaken, hintsUsed } = req.body || {};
    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'quizId and answers are required' });
    }

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    if (!quiz.published) return res.status(403).json({ error: 'Quiz is not published' });

    let correctAnswers = 0;
    let totalPossiblePoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question, index) => {
      const points = question.points || 1;
      totalPossiblePoints += points;
      if (answers[index] === question.correctAnswer) {
        correctAnswers += 1;
        earnedPoints += points;
      }
    });

    const totalQuestions = quiz.questions.length;
    const baseScore = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
    const safeHintsUsed = Number.isFinite(hintsUsed) ? Math.max(0, hintsUsed) : 0;
    const pointsDeductedForHints = safeHintsUsed * 2;
    const score = Math.max(0, baseScore - pointsDeductedForHints);

    const result = new Result({
      resultId: uuidv4(),
      quizId,
      studentId: req.user.uid,
      score,
      baseScore,
      hintsUsed: safeHintsUsed,
      pointsDeductedForHints,
      correctAnswers,
      totalQuestions,
      answers: answers.slice(0, totalQuestions),
      autoSubmitted: !!autoSubmitReason && autoSubmitReason !== 'Quiz submitted',
      autoSubmitReason: autoSubmitReason || 'Quiz submitted',
      tabSwitchCount: Number.isFinite(tabSwitchCount) ? tabSwitchCount : 0,
      timeTaken: Number.isFinite(timeTaken) ? timeTaken : null
    });

    await result.save();

    res.status(201).json({
      ...serializeResult(result, quiz),
      resultReleaseMode: quiz.resultReleaseMode || 'immediate',
      resultReleaseDate: quiz.resultReleaseDate || null
    });
  } catch (error) {
    console.error('Error submitting result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student's results
router.get('/my-results', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.uid }).sort({ timestamp: -1 });
    const quizIds = [...new Set(results.map((r) => r.quizId))];
    const quizzes = await Quiz.find({ quizId: { $in: quizIds } });
    const quizMap = new Map(quizzes.map((q) => [q.quizId, q]));

    res.json(results.map((result) => serializeResult(result, quizMap.get(result.quizId))));
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz results (for teachers)
router.get('/quiz/:quizId', authenticateToken, authorizeRole('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      quizId: req.params.quizId,
      createdBy: req.user.uid
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found or access denied' });

    const results = await Result.find({ quizId: req.params.quizId }).sort({ timestamp: -1 });
    const studentIds = [...new Set(results.map((r) => r.studentId))];
    const students = await User.find({ uid: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s.uid, s]));

    res.json(results.map((result) => serializeResult(result, quiz, studentMap.get(result.studentId))));
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific result
router.get('/:resultId', authenticateToken, async (req, res) => {
  try {
    const result = await Result.findOne({ resultId: req.params.resultId });
    if (!result) return res.status(404).json({ error: 'Result not found' });

    const quiz = await Quiz.findOne({ quizId: result.quizId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found for this result' });

    const canAccess =
      (req.user.role === 'student' && result.studentId === req.user.uid) ||
      (req.user.role === 'teacher' && quiz.createdBy === req.user.uid);

    if (!canAccess) return res.status(403).json({ error: 'Access denied' });

    res.json(serializeResult(result, quiz));
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
