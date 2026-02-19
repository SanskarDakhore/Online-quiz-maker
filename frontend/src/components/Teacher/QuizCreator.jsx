import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

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
    timer: 10, // minutes
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

  const getTimerLabel = (timer, timerPerQuestion, questionCount) => {
    if (timerPerQuestion) {
      return `${timer} min/question (${timer * questionCount} min total)`;
    }
    return `${timer} min total`;
  };

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
          timer: quizResponse.timer ?? 10,
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
    const normalizedValue =
      name === 'timer'
        ? (value === '' ? '' : Math.max(1, Number(value)))
        : value;

    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : normalizedValue
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
        timer: Number.isFinite(Number(quizData.timer)) && Number(quizData.timer) > 0 ? Number(quizData.timer) : 10,
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
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar-custom p-3 min-vh-100">
            <div className="mb-4 text-center">
              <h3 className="gradient-text mb-1">QuizMaster</h3>
              <small className="text-muted">Teacher</small>
            </div>
            <nav className="nav flex-column mb-4">
              <Link to="/teacher/dashboard" className="nav-link text-white rounded py-2 px-3 mb-1">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </Link>
              <Link to="/teacher/quizzes" className="nav-link text-white rounded py-2 px-3 mb-1">
                <i className="bi bi-journal-text me-2"></i> My Quizzes
              </Link>
              <Link to="/teacher/create-quiz" className="nav-link text-white active bg-primary rounded py-2 px-3 mb-1">
                <i className="bi bi-plus-circle me-2"></i> Create Quiz
              </Link>
            </nav>
            <button className="btn btn-danger w-100" disabled>
              <i className="bi bi-door-open me-2"></i> Logout
            </button>
          </div>
          
          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            <div className="p-4">
              <div className="card card-glass mb-4">
                <div className="card-body text-center">
                  <h1 className="gradient-text mb-1">{isEditMode ? '✏️ Edit Quiz' : '➕ Create New Quiz'}</h1>
                  <p className="mb-0">Create and customize your quiz</p>
                </div>
              </div>
              
              <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-white">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 sidebar-custom p-3 min-vh-100">
          <div className="mb-4 text-center">
            <h3 className="gradient-text mb-1">QuizMaster</h3>
            <small className="text-muted">Teacher</small>
          </div>
          
          <nav className="nav flex-column mb-4">
            <Link to="/teacher/dashboard" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/teacher/dashboard' ? 'active bg-primary' : ''}`}>
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>
            <Link to="/teacher/quizzes" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/teacher/quizzes' ? 'active bg-primary' : ''}`}>
              <i className="bi bi-journal-text me-2"></i> My Quizzes
            </Link>
            <Link to="/teacher/create-quiz" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/teacher/create-quiz' ? 'active bg-primary' : ''}`}>
              <i className="bi bi-plus-circle me-2"></i> Create Quiz
            </Link>
          </nav>
          
          <button onClick={logout} className="btn btn-danger w-100">
            <i className="bi bi-door-open me-2"></i> Logout
          </button>
        </div>
        
        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <div className="p-4">
            <div className="card card-glass mb-4">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="gradient-text mb-1">{isEditMode ? '✏️ Edit Quiz' : '➕ Create New Quiz'}</h1>
                  <p className="mb-0">Create and customize your quiz</p>
                </div>
                <button onClick={logout} className="btn btn-danger">
                  <i className="bi bi-door-open me-1"></i> Logout
                </button>
              </div>
            </div>

            {/* Quiz Info Form */}
            <motion.div 
              className="card card-glass mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-header">
                <h3 className="mb-0">📋 Quiz Information</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control input-glass"
                      id="title"
                      name="title"
                      value={quizData.title}
                      onChange={handleQuizChange}
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select input-glass"
                      id="category"
                      name="category"
                      value={quizData.category}
                      onChange={handleQuizChange}
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

                  <div className="col-md-6 mb-3">
                    <label htmlFor="difficulty" className="form-label">Difficulty</label>
                    <select
                      className="form-select input-glass"
                      id="difficulty"
                      name="difficulty"
                      value={quizData.difficulty}
                      onChange={handleQuizChange}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="timer" className="form-label">Timer (minutes)</label>
                    <input
                      type="number"
                      className="form-control input-glass"
                      id="timer"
                      name="timer"
                      value={quizData.timer}
                      onChange={handleQuizChange}
                      min="1"
                      max="180"
                    />
                    <div className="form-text">Set the total time for the quiz</div>
                  </div>

                  <div className="col-md-12 mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control input-glass"
                      id="description"
                      name="description"
                      value={quizData.description}
                      onChange={handleQuizChange}
                      placeholder="Enter quiz description"
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="timerPerQuestion"
                        name="timerPerQuestion"
                        checked={quizData.timerPerQuestion}
                        onChange={handleQuizChange}
                      />
                      <label className="form-check-label" htmlFor="timerPerQuestion">
                        Timer per question
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="examMode"
                        name="examMode"
                        checked={quizData.examMode}
                        onChange={handleQuizChange}
                      />
                      <label className="form-check-label" htmlFor="examMode">
                        Exam Mode (Restricts navigation and copy/paste)
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="resultReleaseMode" className="form-label">Result Release Mode</label>
                    <select
                      className="form-select input-glass"
                      id="resultReleaseMode"
                      name="resultReleaseMode"
                      value={quizData.resultReleaseMode}
                      onChange={handleQuizChange}
                    >
                      <option value="immediate">Immediate</option>
                      <option value="afterAll">After all attempts</option>
                      <option value="specificDate">Specific date</option>
                    </select>
                  </div>

                  {quizData.resultReleaseMode === 'specificDate' && (
                    <div className="col-md-6 mb-3">
                      <label htmlFor="resultReleaseDate" className="form-label">Result Release Date</label>
                      <input
                        type="datetime-local"
                        className="form-control input-glass"
                        id="resultReleaseDate"
                        name="resultReleaseDate"
                        value={quizData.resultReleaseDate}
                        onChange={handleQuizChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Question Creator */}
            <motion.div 
              className="card card-glass mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card-header">
                <h3 className="mb-0">❓ Add Question</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="questionText" className="form-label">Question *</label>
                  <textarea
                    className="form-control input-glass"
                    id="questionText"
                    name="questionText"
                    value={currentQuestion.questionText}
                    onChange={handleQuestionChange}
                    placeholder="Enter your question"
                    rows="2"
                  ></textarea>
                </div>

                <div className="row">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <label htmlFor={`option${index}`} className="form-label">Option {String.fromCharCode(65 + index)} *</label>
                      <input
                        type="text"
                        className="form-control input-glass"
                        id={`option${index}`}
                        value={currentQuestion.options[index]}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="correctAnswer"
                          id={`correctAnswer${index}`}
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                        />
                        <label className="form-check-label" htmlFor={`correctAnswer${index}`}>
                          Mark as Correct Answer
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label htmlFor="explanation" className="form-label">Explanation</label>
                    <textarea
                      className="form-control input-glass"
                      id="explanation"
                      name="explanation"
                      value={currentQuestion.explanation}
                      onChange={handleQuestionChange}
                      placeholder="Explanation for the correct answer"
                      rows="2"
                    ></textarea>
                    <div className="form-text">Help students understand why this is the correct answer</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="hint" className="form-label">Hint</label>
                    <input
                      type="text"
                      className="form-control input-glass"
                      id="hint"
                      name="hint"
                      value={currentQuestion.hint}
                      onChange={handleQuestionChange}
                      placeholder="Hint for this question (optional)"
                    />
                    <div className="form-text">Provide a clue to help students answer correctly</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="concept" className="form-label">Concept</label>
                    <input
                      type="text"
                      className="form-control input-glass"
                      id="concept"
                      name="concept"
                      value={currentQuestion.concept}
                      onChange={handleQuestionChange}
                      placeholder="Learning concept (optional)"
                    />
                    <div className="form-text">Identify the learning objective or concept</div>
                  </div>
                </div>

                <button onClick={addQuestion} className="btn btn-gradient">
                  <i className="bi bi-plus-circle me-2"></i>Add Question
                </button>
              </div>
            </motion.div>

            {/* Questions List */}
            {quizData.questions.length > 0 && (
              <motion.div 
                className="card card-glass mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">📝 Questions <span className="badge bg-primary ms-2">{quizData.questions.length}</span></h3>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {quizData.questions.map((question, index) => (
                      <motion.div 
                        key={index} 
                        className="list-group-item list-group-item-action p-3 mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">Question {index + 1}: {question.questionText.substring(0, 100)}{question.questionText.length > 100 ? '...' : ''}</h5>
                            <div className="mt-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="d-flex align-items-center mb-1">
                                  <span className={`badge ${question.correctAnswer === optIndex ? 'bg-success' : 'bg-secondary'} me-2`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <span>{option.substring(0, 50)}{option.length > 50 ? '...' : ''}</span>
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <small className="text-muted d-block mt-2">
                                <strong>Explanation:</strong> {question.explanation.substring(0, 150)}{question.explanation.length > 150 ? '...' : ''}
                              </small>
                            )}
                            {question.hint && (
                              <small className="text-muted d-block">
                                <strong>Hint:</strong> {question.hint}
                              </small>
                            )}
                            {question.concept && (
                              <small className="text-muted d-block">
                                <strong>Concept:</strong> {question.concept}
                              </small>
                            )}
                          </div>
                          <button 
                            onClick={() => removeQuestion(index)}
                            className="btn btn-sm btn-danger ms-2"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="card card-glass p-4 mb-4">
              <div className="d-flex flex-wrap gap-3">
                <button 
                  onClick={() => saveQuiz(false)} 
                  className="btn btn-outline-secondary flex-fill"
                  disabled={loading}
                >
                  <i className="bi bi-save me-2"></i>Save as Draft
                </button>
                <button 
                  onClick={previewQuiz} 
                  className="btn btn-outline-info flex-fill"
                  disabled={quizData.questions.length === 0}
                >
                  <i className="bi bi-eye me-2"></i>Preview Quiz
                </button>
                <button 
                  onClick={() => saveQuiz(true)} 
                  className="btn btn-gradient flex-fill"
                  disabled={loading || !quizData.title.trim() || quizData.questions.length === 0}
                >
                  <i className="bi bi-send-check me-2"></i>Publish Quiz
                </button>
              </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
              {showPreview && (
                <motion.div 
                  className="modal-backdrop fade show"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3" style={{ zIndex: 1050 }}>
                    <motion.div 
                      className="modal-content card card-glass"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                    >
                      <div className="modal-header">
                        <h5 className="modal-title">{quizData.title || 'Untitled Quiz'} Preview</h5>
                        <button 
                          onClick={() => setShowPreview(false)}
                          className="btn-close btn-close-white"
                          type="button"
                        ></button>
                      </div>
                      <div className="modal-body">
                        <p>{quizData.description || 'No description provided'}</p>
                        <div className="d-flex flex-wrap gap-3 mb-3">
                          <span className="badge bg-info">⏱️ {getTimerLabel(quizData.timer, quizData.timerPerQuestion, quizData.questions.length)}</span>
                          <span className="badge bg-info">❓ {quizData.questions.length} questions</span>
                          <span className="badge bg-info">📊 {quizData.difficulty}</span>
                          {quizData.examMode && <span className="badge bg-warning">🔒 Exam Mode</span>}
                        </div>
                        <div className="preview-questions">
                          {quizData.questions.slice(0, 3).map((question, index) => (
                            <div key={index} className="mb-3">
                              <h6>{index + 1}. {question.questionText}</h6>
                              <div className="ps-3">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="radio" 
                                      disabled
                                      checked={question.correctAnswer === optIndex}
                                    />
                                    <label className="form-check-label">
                                      {String.fromCharCode(65 + optIndex)}. {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {quizData.questions.length > 3 && (
                            <p className="text-muted">+ {quizData.questions.length - 3} more questions</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
