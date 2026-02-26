import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();
const MARKS_PER_CORRECT = 4;
const MARKS_PER_INCORRECT = -3;
const HINT_DEDUCTION = 2;

const clampPercentage = (value) => Math.min(100, Math.max(0, Math.round(value)));

const isAnswered = (value) => Number.isInteger(value);

const deriveMarksSummary = ({
  answers = [],
  totalQuestions = 0,
  correctAnswers = 0,
  hintsUsed = 0,
  attemptedAnswers = null,
  incorrectAnswers = null,
  totalMarks = null,
  baseMarks = null,
  obtainedMarks = null,
  score = null,
  baseScore = null,
  accuracy = null
}) => {
  const safeTotalQuestions = Number.isFinite(totalQuestions) ? Math.max(0, totalQuestions) : 0;
  const safeCorrect = Number.isFinite(correctAnswers) ? Math.max(0, correctAnswers) : 0;
  const safeHintsUsed = Number.isFinite(hintsUsed) ? Math.max(0, hintsUsed) : 0;
  const computedAttempted = Array.isArray(answers) ? answers.filter((answer) => isAnswered(answer)).length : 0;
  const safeAttempted = Number.isFinite(attemptedAnswers) ? Math.max(0, attemptedAnswers) : computedAttempted;
  const safeIncorrect = Number.isFinite(incorrectAnswers)
    ? Math.max(0, incorrectAnswers)
    : Math.max(0, safeAttempted - safeCorrect);

  const safeTotalMarks = Number.isFinite(totalMarks)
    ? Math.max(0, totalMarks)
    : safeTotalQuestions * MARKS_PER_CORRECT;
  const safeBaseMarks = Number.isFinite(baseMarks)
    ? baseMarks
    : (safeCorrect * MARKS_PER_CORRECT) + (safeIncorrect * MARKS_PER_INCORRECT);
  const safeObtainedMarks = Number.isFinite(obtainedMarks)
    ? obtainedMarks
    : safeBaseMarks - (safeHintsUsed * HINT_DEDUCTION);

  const computedAccuracy = safeTotalMarks > 0 ? (safeObtainedMarks / safeTotalMarks) * 100 : 0;
  const safeAccuracy = Number.isFinite(accuracy) ? accuracy : clampPercentage(computedAccuracy);
  const safeScore = Number.isFinite(score) ? score : safeAccuracy;
  const safeBaseScore = Number.isFinite(baseScore)
    ? baseScore
    : clampPercentage(safeTotalMarks > 0 ? (safeBaseMarks / safeTotalMarks) * 100 : 0);

  return {
    attemptedAnswers: safeAttempted,
    incorrectAnswers: safeIncorrect,
    totalMarks: safeTotalMarks,
    baseMarks: safeBaseMarks,
    obtainedMarks: safeObtainedMarks,
    accuracy: safeAccuracy,
    score: safeScore,
    baseScore: safeBaseScore,
    pointsDeductedForHints: safeHintsUsed * HINT_DEDUCTION
  };
};

const serializeReviewQuestions = (quiz) => (
  (quiz?.questions || []).map((question) => ({
    questionText: question.questionText || '',
    options: question.options || [],
    correctAnswer: Number.isInteger(question.correctAnswer) ? question.correctAnswer : null,
    explanation: question.explanation || '',
    imageUrl: question.imageUrl || '',
    hint: question.hint || '',
    concept: question.concept || '',
    points: question.points || 1
  }))
);

const serializeResult = (result, quiz = null, student = null, { includeReviewQuestions = false } = {}) => {
  const marksSummary = deriveMarksSummary({
    answers: result.answers || [],
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    hintsUsed: result.hintsUsed || 0,
    attemptedAnswers: result.attemptedAnswers,
    incorrectAnswers: result.incorrectAnswers,
    totalMarks: result.totalMarks,
    baseMarks: result.baseMarks,
    obtainedMarks: result.obtainedMarks,
    score: result.score,
    baseScore: result.baseScore,
    accuracy: result.accuracy
  });

  return {
    resultId: result.resultId,
    quizId: result.quizId,
    quizTitle: quiz?.title || 'Untitled Quiz',
    studentId: result.studentId,
    studentName: student?.name || undefined,
    studentEmail: student?.email || undefined,
    score: marksSummary.score,
    accuracy: marksSummary.accuracy,
    baseScore: marksSummary.baseScore,
    hintsUsed: result.hintsUsed || 0,
    pointsDeductedForHints: marksSummary.pointsDeductedForHints,
    correctAnswers: result.correctAnswers,
    attemptedAnswers: marksSummary.attemptedAnswers,
    incorrectAnswers: marksSummary.incorrectAnswers,
    totalQuestions: result.totalQuestions,
    totalMarks: marksSummary.totalMarks,
    baseMarks: marksSummary.baseMarks,
    obtainedMarks: marksSummary.obtainedMarks,
    markingScheme: {
      correct: MARKS_PER_CORRECT,
      incorrect: MARKS_PER_INCORRECT,
      hintDeduction: HINT_DEDUCTION
    },
    answers: result.answers || [],
    timestamp: result.timestamp,
    autoSubmitted: !!result.autoSubmitted,
    autoSubmitReason: result.autoSubmitReason || null,
    tabSwitchCount: result.tabSwitchCount || 0,
    timeTaken: result.timeTaken ?? null,
    ...(includeReviewQuestions ? { reviewQuestions: serializeReviewQuestions(quiz) } : {})
  };
};

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
    let attemptedAnswers = 0;

    quiz.questions.forEach((question, index) => {
      const submittedAnswer = answers[index];
      if (isAnswered(submittedAnswer)) {
        attemptedAnswers += 1;
      }

      if (submittedAnswer === question.correctAnswer) {
        correctAnswers += 1;
      }
    });

    const totalQuestions = quiz.questions.length;
    const safeHintsUsed = Number.isFinite(hintsUsed) ? Math.max(0, hintsUsed) : 0;
    const incorrectAnswers = Math.max(0, attemptedAnswers - correctAnswers);
    const totalMarks = totalQuestions * MARKS_PER_CORRECT;
    const baseMarks = (correctAnswers * MARKS_PER_CORRECT) + (incorrectAnswers * MARKS_PER_INCORRECT);
    const pointsDeductedForHints = safeHintsUsed * HINT_DEDUCTION;
    const obtainedMarks = baseMarks - pointsDeductedForHints;
    const baseScore = clampPercentage(totalMarks > 0 ? (baseMarks / totalMarks) * 100 : 0);
    const accuracy = clampPercentage(totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0);
    const score = accuracy;

    const result = new Result({
      resultId: uuidv4(),
      quizId,
      studentId: req.user.uid,
      score,
      baseScore,
      hintsUsed: safeHintsUsed,
      pointsDeductedForHints,
      correctAnswers,
      attemptedAnswers,
      incorrectAnswers,
      totalQuestions,
      totalMarks,
      baseMarks,
      obtainedMarks,
      accuracy,
      answers: answers.slice(0, totalQuestions),
      autoSubmitted: !!autoSubmitReason && autoSubmitReason !== 'Quiz submitted',
      autoSubmitReason: autoSubmitReason || 'Quiz submitted',
      tabSwitchCount: Number.isFinite(tabSwitchCount) ? tabSwitchCount : 0,
      timeTaken: Number.isFinite(timeTaken) ? timeTaken : null
    });

    await result.save();

    res.status(201).json({
      ...serializeResult(result, quiz, null, { includeReviewQuestions: true }),
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

    res.json(serializeResult(result, quiz, null, { includeReviewQuestions: true }));
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
