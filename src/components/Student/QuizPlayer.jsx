import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import backupService from '../../services/backupService';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

const QuizPlayer = () => {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [usedHints, setUsedHints] = useState([]); // Track which hints have been used
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [examMode, setExamMode] = useState(false); // New exam mode state
  const [fullscreenActive, setFullscreenActive] = useState(false); // Track fullscreen state
  
  const timerRef = useRef(null);
  const MAX_TAB_SWITCHES = 3;

  useEffect(() => {
    fetchQuiz();
    
    // Cleanup function to stop backup when component unmounts
    return () => {
      backupService.stopBackup();
    };
  }, [quizId]);

  // Tab switch detection
  useEffect(() => {
    if (!quizStarted || quizCompleted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setShowWarning(true);
        
        setTimeout(() => setShowWarning(false), 3000);

        if (newCount >= MAX_TAB_SWITCHES) {
          autoSubmitQuiz('Tab switching limit exceeded');
        }
      }
    };

    const handleBlur = () => {
      if (quizStarted && !quizCompleted) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setShowWarning(true);
        
        setTimeout(() => setShowWarning(false), 3000);

        if (newCount >= MAX_TAB_SWITCHES) {
          autoSubmitQuiz('Window switching detected');
        }
      }
    };

    // Exam mode restrictions
    const handleKeyDown = (e) => {
      if (examMode) {
        // Prevent common shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) {
          e.preventDefault();
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
          return false;
        }
        
        // Prevent F5, F11, F12, etc.
        if ([116, 122, 123].includes(e.keyCode)) {
          e.preventDefault();
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
          return false;
        }
      }
    };

    // Prevent context menu in exam mode
    const handleContextMenu = (e) => {
      if (examMode) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag and drop in exam mode
    const handleDragStart = (e) => {
      if (examMode) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [quizStarted, quizCompleted, tabSwitchCount, examMode]);

  // Timer
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            autoSubmitQuiz('Time expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  const fetchQuiz = async () => {
    try {
      const quizData = await apiService.getQuiz(quizId);
      if (quizData) {
        setQuiz(quizData);
        
        // Check for backup data
        const backupData = backupService.loadBackup(quizId, currentUser.uid);
        if (backupData) {
          // Restore quiz progress from backup
          setUserAnswers(backupData.userAnswers || new Array(quizData.questions.length).fill(null));
          setCurrentQuestionIndex(backupData.currentQuestionIndex || 0);
          setUsedHints(backupData.usedHints || []);
          setTimeRemaining(backupData.timeRemaining || (quizData.timer * 60));
          
          // Ask user if they want to continue from backup
          const confirmRestore = window.confirm(
            'We found a recent backup of your quiz progress. Would you like to continue from where you left off?'
          );
          
          if (!confirmRestore) {
            // User chose not to restore, clear backup
            backupService.clearBackup(quizId, currentUser.uid);
            setUserAnswers(new Array(quizData.questions.length).fill(null));
            setCurrentQuestionIndex(0);
            setUsedHints([]);
            setTimeRemaining(quizData.timer * 60);
          }
        } else {
          // No backup, initialize fresh
          setUserAnswers(new Array(quizData.questions.length).fill(null));
        }
      } else {
        alert('Quiz not found');
        navigate('/student/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Error fetching quiz: ' + error.message);
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    const totalSeconds = quiz.timerPerQuestion 
      ? quiz.timer * 60 
      : quiz.timer * 60;
    setTimeRemaining(totalSeconds);
    
    // Check if exam mode is enabled
    setExamMode(quiz.examMode || false);
    
    // Enter fullscreen if exam mode
    if (quiz.examMode) {
      enterFullscreen();
    }
    
    // Start automatic backup
    backupService.startBackup(quizId, currentUser.uid, {
      userAnswers,
      currentQuestionIndex,
      usedHints,
      timeRemaining: totalSeconds
    });
  };

  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    setFullscreenActive(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setFullscreenActive(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
    
    // Update backup
    backupService.saveBackup(quizId, currentUser.uid, {
      userAnswers: newAnswers,
      currentQuestionIndex,
      usedHints,
      timeRemaining
    });
  };

  const handleUseHint = () => {
    const newUsedHints = [...usedHints, currentQuestionIndex];
    setUsedHints(newUsedHints);
    
    // Update backup
    backupService.saveBackup(quizId, currentUser.uid, {
      userAnswers,
      currentQuestionIndex,
      usedHints: newUsedHints,
      timeRemaining
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Update backup
      backupService.saveBackup(quizId, currentUser.uid, {
        userAnswers,
        currentQuestionIndex: currentQuestionIndex + 1,
        usedHints,
        timeRemaining
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      
      // Update backup
      backupService.saveBackup(quizId, currentUser.uid, {
        userAnswers,
        currentQuestionIndex: currentQuestionIndex - 1,
        usedHints,
        timeRemaining
      });
    }
  };

  const handleSubmitQuiz = () => {
    const confirmSubmit = window.confirm('Are you sure you want to submit this quiz?');
    if (confirmSubmit) {
      autoSubmitQuiz('Quiz submitted');
    }
  };

  const autoSubmitQuiz = async (reason = 'Auto-submitted') => {
    try {
      setQuizCompleted(true);
      backupService.stopBackup();
      
      // Calculate score with hint deductions
      let correctAnswers = 0;
      const totalQuestions = quiz.questions.length;
      
      quiz.questions.forEach((question, index) => {
        if (userAnswers[index] !== null && 
            userAnswers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      // Calculate score based on question points if available, otherwise use equal distribution
      let totalPossiblePoints = 0;
      let earnedPoints = 0;
      
      quiz.questions.forEach((question, index) => {
        // Use question-specific points if available, otherwise default to 1 point per question
        const questionPoints = question.points || 1;
        totalPossiblePoints += questionPoints;
        
        if (userAnswers[index] !== null && userAnswers[index] === question.correctAnswer) {
          earnedPoints += questionPoints;
        }
      });
      
      // Calculate base score
      let baseScore = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
      
      // Calculate hint deductions
      const hintsUsedCount = usedHints.length;
      const pointsDeductedForHints = hintsUsedCount * 2; // 2 points deducted per hint used
      
      // Apply hint deductions to score (but don't let it go below 0)
      let finalScore = Math.max(0, baseScore - pointsDeductedForHints);
      
      // Submit result
      const resultData = {
        quizId: quiz.quizId,
        score: finalScore, // Use final score after hint deductions
        baseScore,
        hintsUsed: hintsUsedCount,
        pointsDeductedForHints,
        correctAnswers,
        totalQuestions,
        answers: userAnswers,
        tabSwitchCount,
        autoSubmitReason: reason,
        timeTaken: quiz.timer * 60 - timeRemaining
      };
      
      const savedResult = await apiService.submitResult(resultData);
      
      // Exit fullscreen if active
      if (fullscreenActive) {
        exitFullscreen();
      }
      
      // Navigate to results page using the result ID from the saved result
      const resultId = savedResult.resultId || quiz.quizId; // fallback to quizId if resultId not available
      navigate(`/student/result/${resultId}`, { 
        state: { 
          resultData,
          quizTitle: quiz.title,
          quizQuestions: quiz.questions // Include questions for detailed review
        } 
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz: ' + error.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-white">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="card card-glass p-4 text-center">
            <h2 className="gradient-text mb-3">Quiz Not Found</h2>
            <p className="text-muted mb-4">The requested quiz could not be found.</p>
            <button onClick={() => navigate('/student/quizzes')} className="btn btn-gradient">
              Browse Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      {/* Exam Mode Overlay */}
      {examMode && (
        <div className="position-fixed top-0 start-0 w-100 p-3" style={{ zIndex: 1050, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <h5 className="text-white mb-0">{quiz.title}</h5>
              <div className="text-white fs-5">⏱️ {formatTime(timeRemaining)}</div>
            </div>
            <div className="text-white">
              Tab Switches: {tabSwitchCount}/{MAX_TAB_SWITCHES}
            </div>
          </div>
        </div>
      )}

      {/* Warning Message */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            className="position-fixed top-50 start-50 translate-middle p-3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ zIndex: 1060 }}
          >
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              ⚠️ Warning: Suspicious activity detected!
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container py-4">
        {/* Quiz Header */}
        {!examMode && (
          <div className="card card-glass mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h1 className="gradient-text">{quiz.title}</h1>
                  <p className="text-muted">{quiz.description}</p>
                </div>
                <div className="col-md-4">
                  <div className="d-flex flex-wrap gap-3 justify-content-end">
                    <span className="badge bg-info">⏱️ {quiz.timer} min</span>
                    <span className="badge bg-info">❓ {quiz.questions.length} questions</span>
                    <span className="badge bg-info">📊 {quiz.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="card card-glass mb-4">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Progress</span>
              <span className="text-muted">{currentQuestionIndex + 1} of {quiz.questions.length}</span>
            </div>
            <div className="progress" style={{ height: '10px' }}>
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Start Screen */}
        {!quizStarted && (
          <div className="card card-glass mb-4">
            <div className="card-body text-center">
              <h2 className="gradient-text mb-4">Ready to Start?</h2>
              <div className="row justify-content-center mb-4">
                <div className="col-md-8">
                  <div className="d-flex flex-wrap justify-content-center gap-4">
                    <div className="text-center">
                      <div className="fs-4 mb-1">⏱️</div>
                      <div>{quiz.timer} minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="fs-4 mb-1">❓</div>
                      <div>{quiz.questions.length} questions</div>
                    </div>
                    <div className="text-center">
                      <div className="fs-4 mb-1">📊</div>
                      <div>{quiz.difficulty} difficulty</div>
                    </div>
                    {quiz.examMode && (
                      <div className="text-center">
                        <div className="fs-4 mb-1">🔒</div>
                        <div>Exam Mode Active</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center gap-3">
                <button onClick={startQuiz} className="btn btn-gradient btn-lg">
                  Start Quiz
                </button>
                <button onClick={() => navigate('/student/quizzes')} className="btn btn-outline-secondary btn-lg">
                  Back to Quizzes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Content */}
        {quizStarted && !quizCompleted && (
          <div className="card card-glass">
            <div className="card-body">
              {/* Question Header */}
              <div className="mb-4">
                {!examMode && (
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-3">
                      <span className="text-white fs-5">⏱️ {formatTime(timeRemaining)}</span>
                      <span className="text-white">Tab Switches: {tabSwitchCount}/{MAX_TAB_SWITCHES}</span>
                    </div>
                  </div>
                )}
                <h3 className="mb-3">
                  {currentQuestionIndex + 1}. {currentQuestion.questionText}
                </h3>
                {currentQuestion.points && (
                  <span className="badge bg-warning text-dark ms-2">{currentQuestion.points} points</span>
                )}
              </div>

              {/* Question Image */}
              {currentQuestion.imageUrl && (
                <div className="mb-4 text-center">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Options */}
              <div className="row">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="col-12 mb-2">
                    <motion.button
                      className={`btn w-100 text-start ${userAnswers[currentQuestionIndex] === index ? 'btn-primary' : 'btn-outline-light'}`}
                      onClick={() => handleAnswerSelect(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="me-3 fw-bold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{option}</span>
                    </motion.button>
                  </div>
                ))}
              </div>

              {/* Hint */}
              {currentQuestion.hint && !usedHints.includes(currentQuestionIndex) && (
                <div className="mt-4">
                  <button 
                    onClick={handleUseHint}
                    className="btn btn-outline-info"
                  >
                    💡 Use Hint (-2 points)
                  </button>
                  {usedHints.includes(currentQuestionIndex) && (
                    <div className="alert alert-info mt-2">
                      <strong>Hint:</strong> {currentQuestion.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="d-flex justify-content-between mt-4 pt-3 border-top border-secondary">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-outline-secondary"
                >
                  ← Previous
                </button>
                
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={userAnswers[currentQuestionIndex] === null}
                    className="btn btn-gradient"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={userAnswers.some(answer => answer === null)}
                    className="btn btn-success"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;