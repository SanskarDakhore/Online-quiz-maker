import { v4 as uuidv4 } from 'uuid';
import Quiz from '../../server/models/Quiz.js';
import Result from '../../server/models/Result.js';
import { serializeResult } from './serializers.js';

const clampHintDeductions = (count) => Math.max(0, Number.isFinite(count) ? count : 0);

export const createScoredResult = async ({
  quizId,
  studentId,
  answers,
  tabSwitchCount,
  autoSubmitReason,
  timeTaken,
  hintsUsed
}) => {
  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) {
    return { error: 'Quiz not found', status: 404 };
  }

  if (!quiz.published) {
    return { error: 'Quiz is not published', status: 403 };
  }

  const safeAnswers = Array.isArray(answers) ? answers : [];
  const totalQuestions = quiz.questions.length;

  let correctAnswers = 0;
  let totalPossiblePoints = 0;
  let earnedPoints = 0;

  quiz.questions.forEach((question, index) => {
    const points = question.points || 1;
    totalPossiblePoints += points;
    if (safeAnswers[index] === question.correctAnswer) {
      correctAnswers += 1;
      earnedPoints += points;
    }
  });

  const baseScore = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
  const safeHintsUsed = clampHintDeductions(hintsUsed);
  const pointsDeductedForHints = safeHintsUsed * 2;
  const score = Math.max(0, baseScore - pointsDeductedForHints);

  const result = new Result({
    resultId: uuidv4(),
    quizId: quiz.quizId,
    studentId,
    score,
    baseScore,
    hintsUsed: safeHintsUsed,
    pointsDeductedForHints,
    correctAnswers,
    totalQuestions,
    answers: safeAnswers.slice(0, totalQuestions),
    autoSubmitted: !!autoSubmitReason && autoSubmitReason !== 'Quiz submitted',
    autoSubmitReason: autoSubmitReason || 'Quiz submitted',
    tabSwitchCount: Number.isFinite(tabSwitchCount) ? tabSwitchCount : 0,
    timeTaken: Number.isFinite(timeTaken) ? timeTaken : null
  });

  await result.save();

  return {
    result: serializeResult(result, quiz),
    quizMeta: {
      resultReleaseMode: quiz.resultReleaseMode || 'immediate',
      resultReleaseDate: quiz.resultReleaseDate || null
    }
  };
};
