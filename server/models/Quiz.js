import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  timer: {
    type: Number,
    default: 30
  },
  timerPerQuestion: {
    type: Boolean,
    default: false
  },
  examMode: {
    type: Boolean,
    default: false
  },
  resultReleaseMode: {
    type: String,
    enum: ['immediate', 'afterAll', 'specificDate'],
    default: 'immediate'
  },
  resultReleaseDate: {
    type: Date
  },
  questions: {
    type: [{
      questionText: String,
      options: [String],
      correctAnswer: Number,
      points: {
        type: Number,
        default: 1
      },
      explanation: String,
      imageUrl: String,
      hint: String,
      concept: String
    }],
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  published: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
