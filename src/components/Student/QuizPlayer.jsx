import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './QuizPlayer.css';

const QuizPlayer = () => {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef(null);
  const MAX_TAB_SWITCHES = 3;

  useEffect(() => {
    fetchQuiz();
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [quizStarted, quizCompleted, tabSwitchCount]);

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
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (quizDoc.exists()) {
        const quizData = { id: quizDoc.id, ...quizDoc.data() };
        setQuiz(quizData);
        setUserAnswers(new Array(quizData.questions.length).fill(null));
      } else {
        alert('Quiz not found');
        navigate('/student/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
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
  };

  const selectAnswer = (answerIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Reset timer for per-question timing
      if (quiz.timerPerQuestion) {
        setTimeRemaining(quiz.timer * 60);
      }
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const autoSubmitQuiz = async (reason) => {
    clearInterval(timerRef.current);
    await submitQuiz(reason);
  };

  const submitQuiz = async (autoSubmitReason = null) => {
    if (quizCompleted) return;

    try {
      clearInterval(timerRef.current);
      setQuizCompleted(true);

      // Calculate score
      let correctCount = 0;
      userAnswers.forEach((answer, index) => {
        if (answer === quiz.questions[index].correctAnswer) {
          correctCount++;
        }
      });

      const score = (correctCount / quiz.questions.length) * 100;

      // Save result to Firestore
      const resultData = {
        quizId: quiz.id,
        studentId: currentUser.uid,
        score: score,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        answers: userAnswers,
        timestamp: new Date().toISOString(),
        autoSubmitted: autoSubmitReason !== null,
        autoSubmitReason: autoSubmitReason,
        tabSwitchCount: tabSwitchCount
      };

      const resultRef = await addDoc(collection(db, 'results'), resultData);
      
      navigate(`/student/result/${resultRef.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="quiz-player-container flex-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quiz) {
    return <div className="quiz-player-container flex-center">Quiz not found</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-player-container">
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            className="warning-banner"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
          >
            ⚠️ Warning: Tab/Window switching detected! ({tabSwitchCount}/{MAX_TAB_SWITCHES})
            {tabSwitchCount >= MAX_TAB_SWITCHES - 1 && ' - Quiz will auto-submit on next switch!'}
          </motion.div>
        )}
      </AnimatePresence>

      {!quizStarted ? (
        <motion.div 
          className="quiz-intro glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>{quiz.title}</h1>
          <p className="quiz-description">{quiz.description}</p>
          
          <div className="quiz-details">
            <div className="detail-item">
              <span className="detail-icon">📂</span>
              <span>{quiz.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📊</span>
              <span>{quiz.difficulty}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">❓</span>
              <span>{quiz.questions.length} Questions</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <span>{quiz.timer} Minutes</span>
            </div>
          </div>

          <div className="quiz-rules">
            <h3>⚠️ Important Rules</h3>
            <ul>
              <li>🚫 Do not switch tabs or windows during the quiz</li>
              <li>⏰ Quiz will auto-submit when time expires</li>
              <li>🔄 You can navigate between questions before submitting</li>
              <li>⛔ Maximum {MAX_TAB_SWITCHES} tab switches allowed</li>
              <li>✅ Click "Submit Quiz" when you're done</li>
            </ul>
          </div>

          <button onClick={startQuiz} className="btn btn-primary btn-lg">
            🚀 Start Quiz
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="quiz-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Quiz Header */}
          <div className="quiz-header glass-card">
            <div className="quiz-info">
              <h2>{quiz.title}</h2>
              <p>Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
            </div>
            <div className="quiz-timer">
              <div className={`timer ${timeRemaining < 60 ? 'timer-warning' : ''}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestionIndex}
              className="question-card glass-card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="question-text">
                {currentQuestionIndex + 1}. {currentQuestion.questionText}
              </h3>

              {currentQuestion.imageUrl && (
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question" 
                  className="question-image"
                />
              )}

              <div className="options-container">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    className={`option-btn ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                    onClick={() => selectAnswer(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="option-label">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                    {userAnswers[currentQuestionIndex] === index && (
                      <span className="checkmark">✓</span>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="question-navigation">
                <button 
                  onClick={previousQuestion} 
                  className="btn btn-secondary"
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous
                </button>

                <div className="question-dots">
                  {quiz.questions.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentQuestionIndex ? 'active' : ''} ${userAnswers[index] !== null ? 'answered' : ''}`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    />
                  ))}
                </div>

                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button 
                    onClick={nextQuestion} 
                    className="btn btn-primary"
                  >
                    Next →
                  </button>
                ) : (
                  <button 
                    onClick={() => submitQuiz()} 
                    className="btn btn-success"
                  >
                    Submit Quiz ✓
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default QuizPlayer;
