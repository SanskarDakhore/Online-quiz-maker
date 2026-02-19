import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';
import './QuizResult.css';

const QuizResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeAnswerIndex = (value) => {
    if (Number.isInteger(value)) return value;
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  };

  const fallbackReviewQuestions = useMemo(() => {
    const stateQuestions = location.state?.quizQuestions;
    return Array.isArray(stateQuestions) ? stateQuestions : [];
  }, [location.state]);

  const hydrateResultState = (resultData, fallbackTitle = '') => {
    const safeResult = {
      ...resultData,
      quizTitle: resultData?.quizTitle || fallbackTitle || 'Untitled Quiz'
    };

    setResult(safeResult);
    setReviewQuestions(
      Array.isArray(resultData?.reviewQuestions) && resultData.reviewQuestions.length > 0
        ? resultData.reviewQuestions
        : fallbackReviewQuestions
    );
  };

  useEffect(() => {
    if (location.state?.resultData) {
      hydrateResultState(location.state.resultData, location.state?.quizTitle || '');
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const resultResponse = await apiService.getResult(resultId);

        if (!resultResponse) {
          alert('Result not found');
          navigate('/student/quizzes');
          return;
        }

        hydrateResultState(resultResponse, resultResponse.quizTitle || '');
      } catch (error) {
        console.error('Error fetching result:', error);

        if (location.state?.resultData) {
          hydrateResultState(location.state.resultData, location.state?.quizTitle || '');
          setLoading(false);
          return;
        }

        alert('Error fetching result: ' + error.message);
        navigate('/student/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, location.state, navigate]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreMessage = (score) => {
    if (score === 100) return 'Perfect Score! Outstanding!';
    if (score >= 90) return 'Excellent Work!';
    if (score >= 80) return 'Great Job!';
    if (score >= 70) return 'Good Effort!';
    if (score >= 60) return 'Keep Practicing!';
    return "Don't Give Up!";
  };

  const getStatus = (selectedAnswer, correctAnswer) => {
    if (selectedAnswer === null) return 'skipped';
    if (correctAnswer === null) return 'unverified';
    return selectedAnswer === correctAnswer ? 'correct' : 'incorrect';
  };

  const getStatusMeta = (status) => {
    if (status === 'correct') return { label: 'Correct', badgeClass: 'bg-success text-white' };
    if (status === 'incorrect') return { label: 'Incorrect', badgeClass: 'bg-danger text-white' };
    if (status === 'unverified') return { label: 'Submitted', badgeClass: 'bg-secondary text-white' };
    return { label: 'Skipped', badgeClass: 'bg-warning text-dark' };
  };

  const renderOptionText = (answerIndex, options) => {
    if (answerIndex === null) return 'Not answered';
    const answerLabel = `Option ${String.fromCharCode(65 + answerIndex)}`;
    const optionText = options?.[answerIndex];
    return optionText ? `${answerLabel} - ${optionText}` : answerLabel;
  };

  const formatDuration = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const questionReview = useMemo(() => {
    const answers = Array.isArray(result?.answers) ? result.answers : [];
    const questions = Array.isArray(reviewQuestions) ? reviewQuestions : [];
    const total = Math.max(answers.length, questions.length, result?.totalQuestions || 0);

    return Array.from({ length: total }, (_, index) => {
      const question = questions[index] || null;
      const selectedAnswer = normalizeAnswerIndex(answers[index]);
      const correctAnswer = normalizeAnswerIndex(question?.correctAnswer);
      const status = getStatus(selectedAnswer, correctAnswer);

      return {
        index,
        question,
        selectedAnswer,
        correctAnswer,
        status
      };
    });
  }, [result, reviewQuestions]);

  const performanceSummary = useMemo(() => {
    const answers = Array.isArray(result?.answers) ? result.answers : [];
    const totalQuestions = Number.isFinite(result?.totalQuestions) ? result.totalQuestions : questionReview.length;
    const attempted = answers.filter((answer) => normalizeAnswerIndex(answer) !== null).length;
    const skipped = Math.max(0, totalQuestions - attempted);
    const correct = Number.isFinite(result?.correctAnswers) ? result.correctAnswers : 0;
    const incorrect = Math.max(0, attempted - correct);

    return {
      totalQuestions,
      attempted,
      skipped,
      correct,
      incorrect,
      accuracy: totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0,
      timeTakenText: formatDuration(result?.timeTaken),
      tabSwitchCount: Number.isFinite(result?.tabSwitchCount) ? result.tabSwitchCount : 0,
      hintsUsed: Number.isFinite(result?.hintsUsed) ? result.hintsUsed : 0
    };
  }, [result, questionReview]);

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

  if (!result) {
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
        <motion.div className="row justify-content-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="col-lg-10">
            <motion.div className="card card-glass mb-4 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="card-body p-5">
                <h2 className="gradient-text mb-3">{result.quizTitle || 'Quiz Result'}</h2>
                <p className="text-muted mb-4">{getScoreMessage(result.score)}</p>

                <div className="d-flex justify-content-center mb-4">
                  <div className="position-relative" style={{ width: '200px', height: '200px' }}>
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
                    <div className="position-absolute top-50 start-50 translate-middle fs-1 fw-bold" style={{ color: getScoreColor(result.score) }}>
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
                        <div className="fs-4 text-danger">{Math.max(0, (result.totalQuestions || 0) - (result.correctAnswers || 0))}</div>
                        <div className="text-muted">Incorrect</div>
                      </div>
                    </div>
                  </div>
                </div>

                {result.autoSubmitReason && result.autoSubmitReason !== 'Quiz submitted' && (
                  <div className="alert alert-warning mb-3">
                    <p className="mb-1">Quiz was auto-submitted: {result.autoSubmitReason}</p>
                    <p className="mb-0">Tab switches detected: {result.tabSwitchCount}</p>
                  </div>
                )}

                <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
                  <Link to="/student/quizzes" className="btn btn-gradient">
                    <i className="bi bi-book me-2"></i>Browse More Quizzes
                  </Link>
                  <Link to="/student/profile" className="btn btn-outline-light">
                    <i className="bi bi-person me-2"></i>View Profile
                  </Link>
                  <Link to={`/student/certificate/${resultId}`} className="btn btn-outline-success">
                    <i className="bi bi-award me-2"></i>Download Certificate
                  </Link>
                </div>

                {result.hintsUsed !== undefined && result.hintsUsed > 0 && (
                  <div className="alert alert-info">
                    <p className="mb-1">Hints Used: {result.hintsUsed} (Points deducted: {result.pointsDeductedForHints || result.hintsUsed * 2})</p>
                    <p className="mb-0">Final Score: {result.score}% (Base Score: {result.baseScore || Math.round(result.score + (result.pointsDeductedForHints || result.hintsUsed * 2))}%)</p>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="row">
              <div className="col-lg-4 mb-4">
                <motion.div className="card card-glass h-100" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  <div className="card-header">
                    <h3 className="mb-0">Performance Summary</h3>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between"><span className="text-muted">Total Questions</span><strong>{performanceSummary.totalQuestions}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Attempted</span><strong>{performanceSummary.attempted}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Skipped</span><strong>{performanceSummary.skipped}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Correct</span><strong className="text-success">{performanceSummary.correct}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Incorrect</span><strong className="text-danger">{performanceSummary.incorrect}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Accuracy</span><strong>{performanceSummary.accuracy}%</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Time Taken</span><strong>{performanceSummary.timeTakenText}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Tab Switches</span><strong>{performanceSummary.tabSwitchCount}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Hints Used</span><strong>{performanceSummary.hintsUsed}</strong></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="col-lg-8 mb-4">
                <motion.div className="card card-glass h-100" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <div className="card-header">
                    <h3 className="mb-0">Question Review</h3>
                    <p className="text-muted mb-0">Review your answers and compare with configured correct options</p>
                  </div>
                  <div className="card-body">
                    <div className="accordion" id="questionReviewAccordion">
                      {questionReview.map((entry) => {
                        const { index, question, selectedAnswer, correctAnswer, status } = entry;
                        const statusMeta = getStatusMeta(status);
                        const questionText = question?.questionText || 'Question text unavailable';
                        const isFirst = index === 0;

                        return (
                          <div key={index} className={`accordion-item review-item review-${status}`}>
                            <h2 className="accordion-header">
                              <button
                                className={`accordion-button ${isFirst ? '' : 'collapsed'}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#question-${index}`}
                                aria-expanded={isFirst ? 'true' : 'false'}
                                aria-controls={`question-${index}`}
                              >
                                <div className="d-flex justify-content-between align-items-center w-100">
                                  <span>Question {index + 1}: {questionText.substring(0, 60)}{questionText.length > 60 ? '...' : ''}</span>
                                  <span className={`badge ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
                                </div>
                              </button>
                            </h2>
                            <div id={`question-${index}`} className={`accordion-collapse collapse ${isFirst ? 'show' : ''}`} data-bs-parent="#questionReviewAccordion">
                              <div className="accordion-body">
                                {!question && (
                                  <div className="alert alert-secondary mb-0">
                                    Detailed review data is not available for this attempt.
                                  </div>
                                )}

                                {question && (
                                  <div className="mb-3">
                                    <p className="mb-3"><strong>Question:</strong> {questionText}</p>

                                    <div className="review-options">
                                      {(question.options || []).map((optionText, optionIndex) => {
                                        const optionLetter = String.fromCharCode(65 + optionIndex);
                                        const isSelected = selectedAnswer === optionIndex;
                                        const isCorrectOption = correctAnswer === optionIndex;

                                        return (
                                          <div key={optionIndex} className={`review-option ${isSelected ? 'is-selected' : ''} ${isCorrectOption ? 'is-correct' : ''}`}>
                                            <button type="button" className="btn btn-sm review-option-button" disabled>
                                              {optionLetter}
                                            </button>
                                            <span className="review-option-text">{optionText}</span>
                                            {isCorrectOption && <span className="badge bg-success">Correct</span>}
                                            {isSelected && !isCorrectOption && <span className="badge bg-danger">Your choice</span>}
                                            {isSelected && isCorrectOption && <span className="badge bg-primary">Your choice</span>}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="mt-3">
                                      <p className="mb-1"><strong>Your Answer:</strong> {renderOptionText(selectedAnswer, question.options)}</p>
                                      {correctAnswer !== null && (
                                        <p className="mb-1 text-success"><strong>Correct Answer:</strong> {renderOptionText(correctAnswer, question.options)}</p>
                                      )}
                                    </div>

                                    {question.explanation && (
                                      <div className="alert alert-info mb-0 mt-3">
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
