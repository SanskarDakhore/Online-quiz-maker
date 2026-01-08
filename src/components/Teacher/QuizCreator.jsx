import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import './QuizCreator.css';

const QuizCreator = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'Medium',
    timer: 30, // minutes
    timerPerQuestion: false,
    examMode: false,
    resultReleaseMode: 'immediate',
    resultReleaseDate: '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    hint: '',
    concept: '',
    imageUrl: ''
  });

  // Fetch quiz data if editing
  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const quizResponse = await apiService.getQuiz(quizId);
      
      if (quizResponse) {
        setQuizData({
          title: quizResponse.title || '',
          description: quizResponse.description || '',
          category: quizResponse.category || 'General',
          difficulty: quizResponse.difficulty || 'Medium',
          timer: quizResponse.timer || 30,
          timerPerQuestion: quizResponse.timerPerQuestion || false,
          examMode: quizResponse.examMode || false,
          resultReleaseMode: quizResponse.resultReleaseMode || 'immediate',
          resultReleaseDate: quizResponse.resultReleaseDate || '',
          questions: quizResponse.questions ? quizResponse.questions.map(q => ({
            ...q,
            hint: q.hint || '',
            concept: q.concept || ''
          })) : []
        });
        setIsEditMode(true);
      } else {
        alert('Quiz not found');
        navigate('/teacher/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      if (error.message.includes('Session expired')) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to load quiz: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz info change
  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle question change
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Add question to quiz
  const addQuestion = () => {
    // Validation
    if (!currentQuestion.questionText.trim()) {
      alert('Please enter a question');
      return;
    }
    
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill in all option fields');
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      hint: '',
      concept: '',
      imageUrl: ''
    });
  };

  // Remove question
  const removeQuestion = (index) => {
    if (window.confirm('Are you sure you want to remove this question?')) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  // Save quiz
  const saveQuiz = async (publish = false) => {
    console.log('Saving quiz with publish status:', publish);
    if (!quizData.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }
    
    if (quizData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      setLoading(true);

      // Prepare quiz data for submission
      const quizPayload = {
        ...quizData,
        published: publish
      };

      let result;
      if (isEditMode) {
        // Update existing quiz
        result = await apiService.updateQuiz(quizId, quizPayload);
        alert(`Quiz ${publish ? 'published' : 'updated'} successfully!`);
      } else {
        // Create new quiz
        result = await apiService.createQuiz(quizPayload);
        alert(`Quiz ${publish ? 'published' : 'saved as draft'} successfully!`);
      }
      
      console.log('Quiz saved successfully:', result);
      
      // Navigate to teacher quizzes page
      navigate('/teacher/quizzes');
    } catch (error) {
      console.error('Error saving quiz:', error);
      if (error.message.includes('Session expired')) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (error.message.includes('Database is not connected')) {
        // Handle database disconnection gracefully
        console.log('Database not connected - using mock data');
        
        // Still navigate to quizzes page since mock data was created
        if (isEditMode) {
          alert(`Quiz ${publish ? 'published' : 'updated'} successfully (demo mode)!`);
        } else {
          alert(`Quiz ${publish ? 'published' : 'saved as draft'} successfully (demo mode)!`);
        }
        navigate('/teacher/quizzes');
      } else {
        alert('Failed to save quiz: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Preview quiz
  const previewQuiz = () => {
    if (quizData.questions.length === 0) {
      alert('Please add at least one question to preview');
      return;
    }
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="quiz-creator-container flex-center">
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      {/* Sidebar */}
      <div className="sidebar glass-card">
        <div className="sidebar-header">
          <h2>QuizMaster</h2>
          <div className="user-role">Teacher</div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/teacher/dashboard" className={`nav-item ${location.pathname === '/teacher/dashboard' ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/teacher/quizzes" className={`nav-item ${location.pathname === '/teacher/quizzes' ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            My Quizzes
          </Link>
          <Link to="/teacher/create-quiz" className={`nav-item ${location.pathname === '/teacher/create-quiz' ? 'active' : ''}`}>
            <span className="nav-icon">➕</span>
            Create Quiz
          </Link>
        </nav>
        
        <button onClick={logout} className="btn btn-danger logout-btn">
          🚪 Logout
        </button>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header glass-card">
          <div>
            <h1>{isEditMode ? '✏️ Edit Quiz' : '➕ Create New Quiz'}</h1>
            <p>Create and customize your quiz</p>
          </div>
          <div className="header-actions">
            <button onClick={logout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

      {/* Quiz Info Form */}
      <motion.div 
        className="quiz-info-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>📋 Quiz Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={quizData.title}
              onChange={handleQuizChange}
              placeholder="Enter quiz title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={quizData.description}
              onChange={handleQuizChange}
              placeholder="Enter quiz description"
              className="form-input"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={quizData.category}
              onChange={handleQuizChange}
              className="form-input"
            >
              <option value="General">General</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Literature">Literature</option>
              <option value="Technology">Technology</option>
              <option value="Art">Art</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={quizData.difficulty}
              onChange={handleQuizChange}
              className="form-input"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="timer">Timer (minutes)</label>
            <input
              type="number"
              id="timer"
              name="timer"
              value={quizData.timer}
              onChange={handleQuizChange}
              min="1"
              max="180"
              className="form-input"
            />
            <div className="input-hint">Set the total time for the quiz</div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="timerPerQuestion"
                checked={quizData.timerPerQuestion}
                onChange={handleQuizChange}
              />
              Timer per question
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="examMode"
                checked={quizData.examMode}
                onChange={handleQuizChange}
              />
              Exam Mode (Restricts navigation and copy/paste)
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="resultReleaseMode">Result Release Mode</label>
            <select
              id="resultReleaseMode"
              name="resultReleaseMode"
              value={quizData.resultReleaseMode}
              onChange={handleQuizChange}
              className="form-input"
            >
              <option value="immediate">Immediate</option>
              <option value="afterAll">After all attempts</option>
              <option value="specificDate">Specific date</option>
            </select>
          </div>

          {quizData.resultReleaseMode === 'specificDate' && (
            <div className="form-group">
              <label htmlFor="resultReleaseDate">Result Release Date</label>
              <input
                type="datetime-local"
                id="resultReleaseDate"
                name="resultReleaseDate"
                value={quizData.resultReleaseDate}
                onChange={handleQuizChange}
                className="form-input"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Question Creator */}
      <motion.div 
        className="question-creator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2>❓ Add Question</h2>
        <div className="question-form">
          <div className="form-group">
            <label htmlFor="questionText">Question *</label>
            <textarea
              id="questionText"
              name="questionText"
              value={currentQuestion.questionText}
              onChange={handleQuestionChange}
              placeholder="Enter your question"
              className="form-input"
              rows="2"
            />
          </div>

          <div className="options-grid">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="option-group">
                <label>Option {String.fromCharCode(65 + index)} *</label>
                <input
                  type="text"
                  value={currentQuestion.options[index]}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="form-input"
                />
                <label className="radio-label">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={currentQuestion.correctAnswer === index}
                    onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                  />
                  Mark as Correct Answer
                </label>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="explanation">Explanation</label>
            <textarea
              id="explanation"
              name="explanation"
              value={currentQuestion.explanation}
              onChange={handleQuestionChange}
              placeholder="Explanation for the correct answer"
              className="form-input"
              rows="2"
            />
            <div className="input-hint">Help students understand why this is the correct answer</div>
          </div>

          <div className="form-group">
            <label htmlFor="hint">Hint</label>
            <input
              type="text"
              id="hint"
              name="hint"
              value={currentQuestion.hint}
              onChange={handleQuestionChange}
              placeholder="Hint for this question (optional)"
              className="form-input"
            />
            <div className="input-hint">Provide a clue to help students answer correctly</div>
          </div>

          <div className="form-group">
            <label htmlFor="concept">Concept</label>
            <input
              type="text"
              id="concept"
              name="concept"
              value={currentQuestion.concept}
              onChange={handleQuestionChange}
              placeholder="Learning concept (optional)"
              className="form-input"
            />
            <div className="input-hint">Identify the learning objective or concept</div>
          </div>

          <button onClick={addQuestion} className="add-question-btn">
            ➕ Add Question
          </button>
        </div>
      </motion.div>

      {/* Questions List */}
      {quizData.questions.length > 0 && (
        <motion.div 
          className="questions-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>📝 Questions <span className="question-counter">({quizData.questions.length})</span></h2>
          <div className="questions-container">
            {quizData.questions.map((question, index) => (
              <motion.div 
                key={index} 
                className="question-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="question-header">
                  <h3>Question {index + 1}: {question.questionText.substring(0, 100)}{question.questionText.length > 100 ? '...' : ''}</h3>
                  <button 
                    onClick={() => removeQuestion(index)}
                    className="btn btn-danger btn-small"
                  >
                    🗑️ Remove
                  </button>
                </div>
                <div className="question-options">
                  {question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`option-preview ${question.correctAnswer === optIndex ? 'correct' : ''}`}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                      <span className="option-text">{option.substring(0, 50)}{option.length > 50 ? '...' : ''}</span>
                      {question.correctAnswer === optIndex && <span className="correct-badge">✓</span>}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="question-explanation">
                    <strong>Explanation:</strong> {question.explanation.substring(0, 150)}{question.explanation.length > 150 ? '...' : ''}
                  </div>
                )}
                {question.hint && (
                  <div className="question-hint">
                    <strong>Hint:</strong> {question.hint}
                  </div>
                )}
                {question.concept && (
                  <div className="question-concept">
                    <strong>Concept:</strong> {question.concept}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          onClick={() => saveQuiz(false)} 
          className="btn btn-secondary"
          disabled={loading}
        >
          💾 Save as Draft
        </button>
        <button 
          onClick={previewQuiz} 
          className="btn btn-info"
          disabled={quizData.questions.length === 0}
        >
          👁️ Preview Quiz
        </button>
        <button 
          onClick={() => saveQuiz(true)} 
          className="btn btn-success"
          disabled={loading || !quizData.title.trim() || quizData.questions.length === 0}
        >
          🚀 Publish Quiz
        </button>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            className="preview-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="preview-content">
              <div className="preview-header">
                <h2>{quizData.title || 'Untitled Quiz'} Preview</h2>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="btn btn-danger btn-small"
                >
                  ✕ Close
                </button>
              </div>
              <div className="preview-body">
                <p>{quizData.description || 'No description provided'}</p>
                <div className="preview-meta">
                  <span>⏱️ {quizData.timer} min</span>
                  <span>❓ {quizData.questions.length} questions</span>
                  <span>📊 {quizData.difficulty}</span>
                  {quizData.examMode && <span className="exam-mode-badge">🔒 Exam Mode</span>}
                </div>
                <div className="preview-questions">
                  {quizData.questions.slice(0, 3).map((question, index) => (
                    <div key={index} className="preview-question">
                      <h4>{index + 1}. {question.questionText}</h4>
                      <div className="preview-options">
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className="preview-option"
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quizData.questions.length > 3 && (
                    <p>+ {quizData.questions.length - 3} more questions</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizCreator;