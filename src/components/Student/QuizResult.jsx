import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import apiService from '../../services/api';
import './QuizResult.css';

const QuizResult = () => {
  const { resultId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earnedBadge, setEarnedBadge] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      // Fetch result
      const resultResponse = await apiService.getResult(resultId);
      if (!resultResponse) {
        alert('Result not found');
        navigate('/student/quizzes');
        return;
      }

      const resultData = resultResponse.result;
      setResult(resultData);

      // Set quiz data (it's included in the result)
      setQuiz({
        quizId: resultData.quizId,
        title: resultData.quizTitle,
        questions: [] // We don't need the full questions array for display
      });
    } catch (error) {
      console.error('Error fetching result:', error);
      alert('Error fetching result: ' + error.message);
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreMessage = (score) => {
    if (score === 100) return '🎉 Perfect Score! Outstanding!';
    if (score >= 90) return '🌟 Excellent Work!';
    if (score >= 80) return '👍 Great Job!';
    if (score >= 70) return '😊 Good Effort!';
    if (score >= 60) return '📚 Keep Practicing!';
    return '💪 Don\'t Give Up!';
  };

  if (loading) {
    return (
      <div className="quiz-result-container flex-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="quiz-result-container flex-center">
        <p>Result not found</p>
      </div>
    );
  }

  return (
    <div className="quiz-result-container">
      <motion.div 
        className="result-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Score Card */}
        <motion.div 
          className="score-card glass-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>{getScoreMessage(result.score)}</h1>
          
          <div className="score-circle" style={{ borderColor: getScoreColor(result.score) }}>
            <motion.div 
              className="score-number"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              style={{ color: getScoreColor(result.score) }}
            >
              {Math.round(result.score)}%
            </motion.div>
          </div>

          <div className="score-details">
            <div className="detail">
              <span className="detail-label">Correct Answers</span>
              <span className="detail-value" style={{ color: 'var(--success)' }}>
                {result.correctAnswers} / {result.totalQuestions}
              </span>
            </div>
            <div className="detail">
              <span className="detail-label">Wrong Answers</span>
              <span className="detail-value" style={{ color: 'var(--danger)' }}>
                {result.totalQuestions - result.correctAnswers}
              </span>
            </div>
          </div>

          {result.completionReason && result.completionReason !== 'Quiz submitted' && (
            <div className="warning-box">
              <p>⚠️ Quiz was auto-submitted: {result.completionReason}</p>
              <p>Tab switches detected: {result.tabSwitches}</p>
            </div>
          )}

          <div className="result-actions">
            <Link to="/student/quizzes" className="btn btn-primary">
              📚 Browse More Quizzes
            </Link>
            <Link to="/student/profile" className="btn btn-secondary">
              👤 View Profile
            </Link>
          </div>
        </motion.div>

        {/* Performance Summary */}
        <motion.div 
          className="performance-summary glass-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>📊 Performance Summary</h2>
          
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{Math.round(result.timeTaken / 60)} min</div>
                <div className="stat-label">Time Taken</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <div className="stat-value">{result.tabSwitches}</div>
                <div className="stat-label">Tab Switches</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question Review */}
        <motion.div 
          className="question-review glass-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>📝 Question Review</h2>
          <p className="review-note">Review your answers and learn from explanations</p>
          
          <div className="review-questions">
            {result.userAnswers.map((userAnswer, index) => {
              // Since we don't have the full quiz data, we'll show a simplified review
              return (
                <div key={index} className="review-question">
                  <div className="question-header">
                    <h3>Question {index + 1}</h3>
                    <span className={`status-badge ${userAnswer !== null ? 'answered' : 'skipped'}`}>
                      {userAnswer !== null ? 'Answered' : 'Skipped'}
                    </span>
                  </div>
                  
                  {userAnswer !== null && (
                    <div className="answer-review">
                      <p><strong>Your Answer:</strong> Option {String.fromCharCode(65 + userAnswer)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizResult;