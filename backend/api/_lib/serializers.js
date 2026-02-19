export const serializeUser = (user) => ({
  uid: user.uid,
  email: user.email,
  name: user.name,
  role: user.role,
  badges: user.badges || []
});

export const serializeQuizForTeacher = (quiz) => ({
  quizId: quiz.quizId,
  title: quiz.title,
  description: quiz.description || '',
  category: quiz.category || 'General',
  difficulty: quiz.difficulty || 'Medium',
  timer: quiz.timer ?? 10,
  timerPerQuestion: !!quiz.timerPerQuestion,
  examMode: !!quiz.examMode,
  resultReleaseMode: quiz.resultReleaseMode || 'immediate',
  resultReleaseDate: quiz.resultReleaseDate || null,
  questions: (quiz.questions || []).map((q) => ({
    questionText: q.questionText,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || '',
    imageUrl: q.imageUrl || '',
    hint: q.hint || '',
    concept: q.concept || '',
    points: q.points || 1
  })),
  createdBy: quiz.createdBy,
  published: !!quiz.published,
  createdAt: quiz.createdAt
});

export const serializeQuizForStudentList = (quiz) => ({
  quizId: quiz.quizId,
  title: quiz.title,
  description: quiz.description || '',
  category: quiz.category || 'General',
  difficulty: quiz.difficulty || 'Medium',
  timer: quiz.timer ?? 10,
  timerPerQuestion: !!quiz.timerPerQuestion,
  questions: new Array((quiz.questions || []).length).fill(null),
  published: !!quiz.published,
  createdAt: quiz.createdAt
});

export const serializeQuizForStudentPlay = (quiz) => ({
  quizId: quiz.quizId,
  title: quiz.title,
  description: quiz.description || '',
  category: quiz.category || 'General',
  difficulty: quiz.difficulty || 'Medium',
  timer: quiz.timer ?? 10,
  timerPerQuestion: !!quiz.timerPerQuestion,
  examMode: !!quiz.examMode,
  resultReleaseMode: quiz.resultReleaseMode || 'immediate',
  resultReleaseDate: quiz.resultReleaseDate || null,
  questions: (quiz.questions || []).map((q) => ({
    questionText: q.questionText,
    options: q.options || [],
    explanation: q.explanation || '',
    imageUrl: q.imageUrl || '',
    hint: q.hint || '',
    concept: q.concept || '',
    points: q.points || 1
  })),
  published: !!quiz.published,
  createdAt: quiz.createdAt
});

const serializeReviewQuestions = (quiz) => (
  (quiz?.questions || []).map((q) => ({
    questionText: q.questionText || '',
    options: q.options || [],
    correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : null,
    explanation: q.explanation || '',
    imageUrl: q.imageUrl || '',
    hint: q.hint || '',
    concept: q.concept || '',
    points: q.points || 1
  }))
);

export const serializeResult = (result, quiz = null, { includeReviewQuestions = false } = {}) => ({
  resultId: result.resultId,
  quizId: result.quizId,
  quizTitle: quiz?.title || result.quizTitle || 'Untitled Quiz',
  studentId: result.studentId,
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
  timeTaken: result.timeTaken ?? null,
  ...(includeReviewQuestions ? { reviewQuestions: serializeReviewQuestions(quiz) } : {})
});
