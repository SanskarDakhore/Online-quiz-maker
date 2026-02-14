import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import backupService from '../../services/backupService';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

const MAX_TAB_SWITCHES = 3;

const QuizPlayer = () => {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [usedHints, setUsedHints] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [examMode, setExamMode] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  const getTotalSeconds = (quizData) => {
    if (!quizData) return 0;
    const minutes = quizData.timerPerQuestion
      ? quizData.timer * quizData.questions.length
      : quizData.timer;
    return minutes * 60;
  };

  const saveBackupState = (state) => {
    if (!quiz || !currentUser?.uid) return;
    backupService.saveBackup(quizId, currentUser.uid, state);
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await apiService.getQuiz(quizId);
        if (!quizData) {
          navigate('/student/quizzes');
          return;
        }

        setQuiz(quizData);
        const totalSeconds = getTotalSeconds(quizData);
        const initialAnswers = new Array(quizData.questions.length).fill(null);

        const backupData = backupService.loadBackup(quizId, currentUser?.uid);
        if (backupData) {
          const restore = window.confirm('We found a recent backup. Continue where you left off?');
          if (restore) {
            setUserAnswers(backupData.userAnswers || initialAnswers);
            setCurrentQuestionIndex(backupData.currentQuestionIndex || 0);
            setUsedHints(backupData.usedHints || []);
            setTimeRemaining(backupData.timeRemaining || totalSeconds);
          } else {
            backupService.clearBackup(quizId, currentUser?.uid);
            setUserAnswers(initialAnswers);
            setTimeRemaining(totalSeconds);
          }
        } else {
          setUserAnswers(initialAnswers);
          setTimeRemaining(totalSeconds);
        }
      } catch (error) {
        alert(`Error fetching quiz: ${error.message}`);
        navigate('/student/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
    return () => backupService.stopBackup();
  }, [quizId, currentUser?.uid, navigate]);

  useEffect(() => {
    if (!quizStarted || quizCompleted) return;

    const handleSuspicious = (reason) => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
        if (next >= MAX_TAB_SWITCHES) autoSubmitQuiz(reason);
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleSuspicious('Tab switching limit exceeded');
    };
    const handleBlur = () => handleSuspicious('Window switching detected');

    const handleKeyDown = (e) => {
      if (!examMode) return;
      if (e.ctrlKey || e.metaKey || e.altKey || [116, 122, 123].includes(e.keyCode)) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
      }
    };

    const preventIfExamMode = (e) => {
      if (examMode) e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', preventIfExamMode);
    document.addEventListener('dragstart', preventIfExamMode);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', preventIfExamMode);
      document.removeEventListener('dragstart', preventIfExamMode);
    };
  }, [quizStarted, quizCompleted, examMode]);

  useEffect(() => {
    if (!quizStarted || quizCompleted || timeRemaining <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          autoSubmitQuiz('Time expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quizStarted, quizCompleted, timeRemaining]);

  useEffect(() => {
    if (!quizStarted || quizCompleted) return;
    saveBackupState({ userAnswers, currentQuestionIndex, usedHints, timeRemaining });
  }, [userAnswers, currentQuestionIndex, usedHints, timeRemaining, quizStarted, quizCompleted]);

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    setFullscreenActive(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    setFullscreenActive(false);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setExamMode(!!quiz.examMode);
    setTimeRemaining(getTotalSeconds(quiz));
    if (quiz.examMode) enterFullscreen();
  };

  const handleUseHint = () => {
    if (usedHints.includes(currentQuestionIndex)) return;
    setUsedHints((prev) => [...prev, currentQuestionIndex]);
  };

  const autoSubmitQuiz = async (reason = 'Quiz submitted') => {
    if (!quiz || quizCompleted) return;
    setQuizCompleted(true);
    backupService.stopBackup();

    try {
      const totalSeconds = getTotalSeconds(quiz);
      const savedResult = await apiService.submitResult({
        quizId: quiz.quizId,
        answers: userAnswers,
        hintsUsed: usedHints.length,
        tabSwitchCount,
        autoSubmitReason: reason,
        timeTaken: Math.max(0, totalSeconds - timeRemaining)
      });

      if (fullscreenActive) exitFullscreen();

      if (savedResult.resultReleaseMode && savedResult.resultReleaseMode !== 'immediate') {
        navigate(`/student/result-pending/${savedResult.resultId}`, {
          state: {
            resultReleaseMode: savedResult.resultReleaseMode,
            resultReleaseDate: savedResult.resultReleaseDate
          }
        });
        return;
      }

      navigate(`/student/result/${savedResult.resultId}`, {
        state: {
          resultData: savedResult,
          quizTitle: quiz.title,
          quizQuestions: quiz.questions
        }
      });
    } catch (error) {
      alert(`Error submitting quiz: ${error.message}`);
      setQuizCompleted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="container py-5 text-center">Loading quiz...</div>;
  if (!quiz) return <div className="container py-5 text-center">Quiz not found.</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh' }}>
      <AnimatePresence>
        {showWarning && (
          <motion.div className="position-fixed top-0 start-50 translate-middle-x mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 2000 }}>
            <div className="alert alert-warning mb-0">Warning: suspicious activity detected.</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container py-4">
        {!quizStarted && (
          <div className="card card-glass p-4 text-center">
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>
            <p>{quiz.questions.length} questions • {quiz.timerPerQuestion ? `${quiz.timer} min/question` : `${quiz.timer} min total`}</p>
            <button onClick={startQuiz} className="btn btn-gradient">Start Quiz</button>
          </div>
        )}

        {quizStarted && !quizCompleted && (
          <div className="card card-glass p-4">
            <div className="d-flex justify-content-between mb-3">
              <div>Question {currentQuestionIndex + 1}/{quiz.questions.length}</div>
              <div>{formatTime(timeRemaining)} | Tab switches: {tabSwitchCount}/{MAX_TAB_SWITCHES}</div>
            </div>
            <div className="progress mb-3" style={{ height: '8px' }}>
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <h4>{currentQuestion.questionText}</h4>

            <div className="mt-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`btn w-100 text-start mb-2 ${userAnswers[currentQuestionIndex] === index ? 'btn-primary' : 'btn-outline-light'}`}
                  onClick={() => {
                    const next = [...userAnswers];
                    next[currentQuestionIndex] = index;
                    setUserAnswers(next);
                  }}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>

            {currentQuestion.hint && (
              <div className="mt-3">
                {!usedHints.includes(currentQuestionIndex) && (
                  <button onClick={handleUseHint} className="btn btn-outline-info">Use Hint (-2)</button>
                )}
                {usedHints.includes(currentQuestionIndex) && (
                  <div className="alert alert-info mt-2 mb-0"><strong>Hint:</strong> {currentQuestion.hint}</div>
                )}
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex((p) => p - 1)}>
                Previous
              </button>
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button className="btn btn-gradient" disabled={userAnswers[currentQuestionIndex] === null} onClick={() => setCurrentQuestionIndex((p) => p + 1)}>
                  Next
                </button>
              ) : (
                <button className="btn btn-success" disabled={userAnswers.some((a) => a === null)} onClick={() => autoSubmitQuiz('Quiz submitted')}>
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
