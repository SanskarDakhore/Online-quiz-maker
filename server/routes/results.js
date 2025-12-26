import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Submit quiz result
router.post('/', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { quizId, score, correctAnswers, totalQuestions, answers, autoSubmitted, autoSubmitReason, tabSwitchCount, timeTaken } = req.body;
    
    // Verify quiz exists
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Create result
    const resultId = uuidv4();
    const result = new Result({
      resultId,
      quizId,
      studentId: req.user.uid,
      score,
      correctAnswers,
      totalQuestions,
      answers,
      autoSubmitted: autoSubmitted || false,
      autoSubmitReason: autoSubmitReason || null,
      tabSwitchCount: tabSwitchCount || 0,
      timeTaken: timeTaken || null
    });
    
    await result.save();
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error submitting result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student's results
router.get('/my-results', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.uid }).sort({ timestamp: -1 });
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific result
router.get('/:resultId', authenticateToken, async (req, res) => {
  try {
    const result = await Result.findOne({ 
      resultId: req.params.resultId
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    // Check if user has access to this result
    if (req.user.role === 'student' && result.studentId !== req.user.uid) {
      // For students, check if the quiz creator is the current user (should not happen)
      const quiz = await Quiz.findOne({ quizId: result.quizId });
      if (quiz && quiz.createdBy === req.user.uid) {
        // Teacher accessing student result - this is allowed
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz results (for teachers)
router.get('/quiz/:quizId', authenticateToken, authorizeRole('teacher'), async (req, res) => {
  try {
    // Verify quiz belongs to teacher
    const quiz = await Quiz.findOne({
      quizId: req.params.quizId,
      createdBy: req.user.uid
    });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }
    
    const results = await Result.find({ quizId: req.params.quizId }).sort({ timestamp: -1 });
    res.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;