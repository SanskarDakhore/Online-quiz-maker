import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  resultId: {
    type: String,
    required: true,
    unique: true
  },
  quizId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answers: {
    type: [Number],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  autoSubmitted: {
    type: Boolean,
    default: false
  },
  autoSubmitReason: {
    type: String
  },
  tabSwitchCount: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: null
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  pointsDeductedForHints: {
    type: Number,
    default: 0
  }
});

const Result = mongoose.model('Result', resultSchema);

export default Result;