import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
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
      const resultDoc = await getDoc(doc(db, 'results', resultId));
      if (!resultDoc.exists()) {
        alert('Result not found');
        navigate('/student/quizzes');
        return;
      }

      const resultData = { id: resultDoc.id, ...resultDoc.data() };
      setResult(resultData);

      // Fetch quiz
      const quizDoc = await getDoc(doc(db, 'quizzes', resultData.quizId));
      if (quizDoc.exists()) {
        setQuiz({ id: quizDoc.id, ...quizDoc.data() });
      }

      // Check for badge achievements
      await checkBadges(resultData);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBadges = async (resultData) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const currentBadges = userData.badges || [];
      let newBadge = null;

      // Fast Solver - completed quiz in less than half the time
      const timeUsed = resultData.timeUsed || 0;
      if (timeUsed < (quiz?.timer || 0) * 30 && !currentBadges.includes('Fast Solver')) {
        newBadge = 'Fast Solver';
      }

      // Perfect Score
      if (resultData.score === 100 && !currentBadges.includes('Perfect Score')) {
        newBadge = 'Perfect Score';
      }

      // Top Ranker - score above 90%
      if (resultData.score >= 90 && !currentBadges.includes('Top Ranker')) {
        newBadge = 'Top Ranker';
      }

      if (newBadge) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          badges: arrayUnion(newBadge)
        });
        setEarnedBadge(newBadge);
      }
    } catch (error) {
      console.error('Error checking badges:', error);
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

          {result.autoSubmitted && (
            <div className="warning-box">
              <p>⚠️ Quiz was auto-submitted: {result.autoSubmitReason}</p>
              <p>Tab switches detected: {result.tabSwitchCount}</p>
            </div>
          )}

          {earnedBadge && (
            <motion.div 
              className="badge-earned"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              🏆 New Badge Earned: {earnedBadge}!
            </motion.div>
          )}
        </motion.div>

        {/* Answer Review */}
        <motion.div 
          className="answers-review glass-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Answer Review</h2>
          <p className="quiz-title">{quiz.title}</p>

          <div className="answers-list">
            {quiz.questions.map((question, index) => {
              const userAnswer = result.answers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <motion.div 
                  key={index}
                  className="answer-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="question-header">
                    <h4>
                      {index + 1}. {question.questionText}
                    </h4>
                    {isCorrect ? (
                      <span className="result-badge correct">✓ Correct</span>
                    ) : (
                      <span className="result-badge wrong">✗ Wrong</span>
                    )}
                  </div>

                  {question.imageUrl && (
                    <img src={question.imageUrl} alt="Question" className="question-img" />
                  )}

                  <div className="options-review">
                    {question.options.map((option, optIndex) => {
                      let className = 'option-review';
                      
                      if (optIndex === question.correctAnswer) {
                        className += ' correct-answer';
                      }
                      
                      if (optIndex === userAnswer && !isCorrect) {
                        className += ' wrong-answer';
                      }

                      return (
                        <div key={optIndex} className={className}>
                          <span className="option-label">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="option-text">{option}</span>
                          {optIndex === question.correctAnswer && (
                            <span className="indicator">✓</span>
                          )}
                          {optIndex === userAnswer && !isCorrect && (
                            <span className="indicator wrong-indicator">✗</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="explanation">
                      <strong>💡 Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          className="result-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/student/quizzes" className="btn btn-primary">
            📚 Back to Quizzes
          </Link>
          <Link to="/student/profile" className="btn btn-secondary">
            👤 View Profile
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizResult;
