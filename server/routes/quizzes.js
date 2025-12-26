import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all published quizzes (for students)
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching published quizzes for user:', req.user.email, req.user.role);
    const quizzes = await Quiz.find({ published: true }).sort({ createdAt: -1 });
    console.log('Found', quizzes.length, 'published quizzes');
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all quizzes for teacher (their own quizzes)
router.get('/my-quizzes', authenticateToken, authorizeRole('teacher'), async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.uid }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching teacher quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz by ID
router.get('/:quizId', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.quizId });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // If quiz is not published, only creator can access it
    if (!quiz.published && quiz.createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new quiz (teachers only)
router.post('/', authenticateToken, authorizeRole('teacher'), async (req, res) => {
  try {
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
      questions
    } = req.body;
    
    const quizId = uuidv4();
    const quiz = new Quiz({
      quizId,
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
      createdBy: req.user.uid,
      published: false
    });
    
    await quiz.save();
    
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update quiz (teachers only)
router.put('/:quizId', authenticateToken, authorizeRole('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      quizId: req.params.quizId,
      createdBy: req.user.uid
    });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
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
    } = req.body;
    
    quiz.title = title;
    quiz.description = description;
    quiz.category = category;
    quiz.difficulty = difficulty;
    quiz.timer = timer;
    quiz.timerPerQuestion = timerPerQuestion;
    quiz.examMode = examMode;
    quiz.resultReleaseMode = resultReleaseMode;
    quiz.resultReleaseDate = resultReleaseDate;
    quiz.questions = questions;
    quiz.published = published;
    
    await quiz.save();
    
    res.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete quiz (teachers only)
router.delete('/:quizId', authenticateToken, authorizeRole('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      quizId: req.params.quizId,
      createdBy: req.user.uid
    });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }
    
    await Quiz.deleteOne({ _id: quiz._id });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish/unpublish quiz (teachers only)
router.patch('/:quizId/publish', authenticateToken, authorizeRole('teacher'), async (req, res) => {
  try {
    console.log('Publish quiz request received');
    console.log('User:', req.user);
    console.log('Quiz ID:', req.params.quizId);
    console.log('Body:', req.body);
    
    const quiz = await Quiz.findOne({
      quizId: req.params.quizId,
      createdBy: req.user.uid
    });
    
    if (!quiz) {
      console.log('Quiz not found or access denied');
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }
    
    const { published } = req.body;
    quiz.published = published;
    await quiz.save();
    
    console.log('Quiz published/unpublished successfully');
    res.json({ message: `Quiz ${published ? 'published' : 'unpublished'} successfully` });
  } catch (error) {
    console.error('Error publishing quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;