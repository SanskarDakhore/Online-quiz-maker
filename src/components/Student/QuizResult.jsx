import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

const QuizResult = () => {
  const { resultId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earnedBadge, setEarnedBadge] = useState(null);

  useEffect(() => {
    // Check if result data is passed via state
    if (location.state?.resultData) {
      // Use the result data passed from QuizPlayer
      const resultData = location.state.resultData;
      const quizTitle = location.state.quizTitle;
      
      setResult(resultData);
      setQuiz({
        quizId: resultData.quizId,
        title: quizTitle,
        questions: location.state?.quizQuestions || [] // Include questions for detailed review
      });
      setLoading(false);
    } else {
      fetchResult();
    }
  }, [resultId, location.state]);

  const fetchResult = async () => {
    try {
      // Fetch result
      const resultResponse = await apiService.getResult(resultId);
      if (!resultResponse) {
        console.error('Result not found in database, but may have been submitted recently');
        // If we have result data in state, we can use that as fallback
        if (location.state?.resultData) {
          const resultData = location.state.resultData;
          const quizTitle = location.state.quizTitle;
          
          setResult(resultData);
          setQuiz({
            quizId: resultData.quizId,
            title: quizTitle,
            questions: [] // We don't need the full questions array for display
          });
          return;
        }
        
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
        questions: location.state?.quizQuestions || [] // Include questions for detailed review
      });
    } catch (error) {
      console.error('Error fetching result:', error);
      // If we have result data in state, we can use that as fallback
      if (location.state?.resultData) {
        const resultData = location.state.resultData;
        const quizTitle = location.state.quizTitle;
        
        setResult(resultData);
        setQuiz({
          quizId: resultData.quizId,
          title: quizTitle,
          questions: location.state?.quizQuestions || [] // Include questions for detailed review
        });
        setLoading(false);
        return;
      }
      
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
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-white">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="card card-glass p-4 text-center">
            <h2 className="gradient-text mb-3">Result Not Found</h2>
            <p className="text-muted mb-4">The requested quiz result could not be found.</p>
            <Link to="/student/quizzes" className="btn btn-gradient">
              Browse Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      <div className="container py-4">
        <motion.div 
          className="row justify-content-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="col-lg-10">
            {/* Score Card */}
            <motion.div 
              className="card card-glass mb-4 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-body p-5">
                <h2 className="gradient-text mb-4">{getScoreMessage(result.score)}</h2>
                
                <div className="d-flex justify-content-center mb-4">
                  <div 
                    className="position-relative" 
                    style={{ width: '200px', height: '200px' }}
                  >
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path 
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="2"
                      />
                      <path 
                        className="circle"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getScoreColor(result.score)}
                        strokeWidth="2"
                        strokeDasharray={`${Math.round(result.score)}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div 
                      className="position-absolute top-50 start-50 translate-middle fs-1 fw-bold"
                      style={{ color: getScoreColor(result.score) }}
                    >
                      {Math.round(result.score)}%
                    </div>
                  </div>
                </div>

                <div className="row justify-content-center mb-4">
                  <div className="col-md-6">
                    <div className="row">
                      <div className="col-6 text-center">
                        <div className="fs-4 text-success">{result.correctAnswers}</div>
                        <div className="text-muted">Correct</div>
                      </div>
                      <div className="col-6 text-center">
                        <div className="fs-4 text-danger">{result.totalQuestions - result.correctAnswers}</div>
                        <div className="text-muted">Incorrect</div>
                      </div>
                    </div>
                  </div>
                </div>

                {result.autoSubmitReason && result.autoSubmitReason !== 'Quiz submitted' && (
                  <div className="alert alert-warning mb-3">
                    <p className="mb-1">⚠️ Quiz was auto-submitted: {result.autoSubmitReason}</p>
                    <p className="mb-0">Tab switches detected: {result.tabSwitches}</p>
                  </div>
                )}

                <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
                  <Link to="/student/quizzes" className="btn btn-gradient">
                    <i className="bi bi-book me-2"></i>Browse More Quizzes
                  </Link>
                  <Link to="/student/profile" className="btn btn-outline-light">
                    <i className="bi bi-person me-2"></i>View Profile
                  </Link>
                  <Link to="/student/certificate/{resultId}" className="btn btn-outline-success">
                    <i className="bi bi-award me-2"></i>Download Certificate
                  </Link>
                </div>
                
                {/* Hint Usage Information */}
                {result.hintsUsed !== undefined && result.hintsUsed > 0 && (
                  <div className="alert alert-info">
                    <p className="mb-1">💡 Hints Used: {result.hintsUsed} (Points deducted: {result.pointsDeductedForHints || result.hintsUsed * 2})</p>
                    <p className="mb-0">Final Score: {result.score}% (Base Score: {result.baseScore || Math.round(result.score + (result.pointsDeductedForHints || result.hintsUsed * 2))}%)</p>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="row">
              {/* Performance Summary */}
              <div className="col-lg-4 mb-4">
                <motion.div 
                  className="card card-glass h-100"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="card-header">
                    <h3 className="mb-0">📊 Performance Summary</h3>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center">
                        <div className="fs-4 me-3">⏱️</div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">Time Taken</div>
                          <div className="text-muted">{Math.round(result.timeTaken / 60)} min</div>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <div className="fs-4 me-3">🔄</div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">Tab Switches</div>
                          <div className="text-muted">{result.tabSwitches}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Question Review */}
              <div className="col-lg-8 mb-4">
                <motion.div 
                  className="card card-glass h-100"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="card-header">
                    <h3 className="mb-0">📝 Question Review</h3>
                    <p className="text-muted mb-0">Review your answers and learn from explanations</p>
                  </div>
                  <div className="card-body">
                    <div className="accordion" id="questionReviewAccordion">
                      {result.answers.map((userAnswer, index) => {
                        const question = quiz.questions[index];
                        const isCorrect = userAnswer !== null && userAnswer === question?.correctAnswer;
                        
                        return (
                          <div key={index} className="accordion-item">
                            <h2 className="accordion-header">
                              <button 
                                className={`accordion-button ${index !== 0 ? 'collapsed' : ''} ${isCorrect ? 'text-success' : userAnswer !== null ? 'text-danger' : 'text-warning'}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#question-${index}`}
                                aria-expanded={index === 0 ? 'true' : 'false'}
                                aria-controls={`question-${index}`}
                              >
                                <div className="d-flex justify-content-between align-items-center w-100">
                                  <span>Question {index + 1}: {question?.questionText.substring(0, 50)}{question?.questionText.length > 50 ? '...' : ''}</span>
                                  <span className={`badge ${isCorrect ? 'bg-success' : userAnswer !== null ? 'bg-danger' : 'bg-warning'} text-dark`}>
                                    {userAnswer !== null ? (isCorrect ? 'Correct' : 'Incorrect') : 'Skipped'}
                                  </span>
                                </div>
                              </button>
                            </h2>
                            <div 
                              id={`question-${index}`}
                              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                              data-bs-parent="#questionReviewAccordion"
                            >
                              <div className="accordion-body">
                                {question && (
                                  <div className="mb-3">
                                    <p className="mb-2"><strong>Question:</strong> {question.questionText}</p>
                                    {userAnswer !== null && (
                                      <div className="mb-2">
                                        <p className="mb-1">
                                          <strong>Your Answer:</strong> 
                                          Option {String.fromCharCode(65 + userAnswer)} - {question?.options[userAnswer]}
                                        </p>
                                        {!isCorrect && (
                                          <p className="mb-1 text-success">
                                            <strong>Correct Answer:</strong> 
                                            Option {String.fromCharCode(65 + question.correctAnswer)} - {question?.options[question.correctAnswer]}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    {question?.explanation && (
                                      <div className="alert alert-info">
                                        <p className="mb-0"><strong>Explanation:</strong> {question.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResult;