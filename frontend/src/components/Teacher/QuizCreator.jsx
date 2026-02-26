import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import '../../bootstrap-theme.css';

const emptyQuestion = {
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  hint: '',
  concept: '',
  imageUrl: '',
};

const QuizCreator = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'Medium',
    timer: 10,
    timerPerQuestion: false,
    examMode: false,
    resultReleaseMode: 'immediate',
    resultReleaseDate: '',
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState(emptyQuestion);

  useEffect(() => {
    if (quizId) fetchQuizData();
  }, [quizId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getTimerLabel = (timer, timerPerQuestion, questionCount) => {
    if (timerPerQuestion) return `${timer} min/question (${timer * questionCount} min total)`;
    return `${timer} min total`;
  };

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError('');
      const quizResponse = await apiService.getQuiz(quizId);
      if (!quizResponse) {
        navigate('/teacher/quizzes');
        return;
      }

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
        questions: Array.isArray(quizResponse.questions)
          ? quizResponse.questions.map((q) => ({ ...q, hint: q.hint || '', concept: q.concept || '' }))
          : [],
      });
      setIsEditMode(true);
    } catch (err) {
      if (err.message.includes('Session expired')) {
        navigate('/login');
        return;
      }
      setError(`Failed to load quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    const normalizedValue = name === 'timer' ? (value === '' ? '' : Math.max(1, Number(value))) : value;
    setQuizData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : normalizedValue,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const options = [...currentQuestion.options];
    options[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options }));
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert('Please enter a question');
      return;
    }
    if (currentQuestion.options.some((opt) => !opt.trim())) {
      alert('Please fill all options');
      return;
    }
    setQuizData((prev) => ({ ...prev, questions: [...prev.questions, { ...currentQuestion }] }));
    setCurrentQuestion(emptyQuestion);
  };

  const removeQuestion = (index) => {
    if (!window.confirm('Are you sure you want to remove this question?')) return;
    setQuizData((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  };

  const saveQuiz = async (publish = false) => {
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
      const payload = {
        ...quizData,
        timer: Number.isFinite(Number(quizData.timer)) && Number(quizData.timer) > 0 ? Number(quizData.timer) : 10,
        published: publish,
      };

      if (isEditMode) {
        await apiService.updateQuiz(quizId, payload);
        alert(`Quiz ${publish ? 'published' : 'updated'} successfully`);
      } else {
        await apiService.createQuiz(payload);
        alert(`Quiz ${publish ? 'published' : 'saved as draft'} successfully`);
      }
      navigate('/teacher/quizzes');
    } catch (err) {
      if (err.message.includes('Session expired')) {
        navigate('/login');
        return;
      }
      alert(`Failed to save quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const previewQuiz = () => {
    if (quizData.questions.length === 0) {
      alert('Please add at least one question to preview');
      return;
    }
    setShowPreview(true);
  };

  return (
    <DashboardLayout
      role="teacher"
      currentPath={location.pathname}
      onLogout={handleLogout}
      title={isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
      subtitle="Create and customize your quiz"
      iconClass={isEditMode ? 'bi-pencil-square' : 'bi-plus-square'}
      headerRight={
        <button onClick={handleLogout} className="btn btn-danger">
          <i className="bi bi-door-open me-1"></i> Logout
        </button>
      }
      loading={loading && quizData.questions.length === 0 && Boolean(quizId)}
      loadingText="Loading quiz..."
      error={error}
      onRetry={fetchQuizData}
      disableLogout={loading}
    >
      <motion.div className="card card-glass mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-header">
          <h3 className="mb-0"><i className="bi bi-card-checklist me-2"></i>Quiz Information</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="title" className="form-label">Title *</label>
              <input type="text" className="form-control input-glass" id="title" name="title" value={quizData.title} onChange={handleQuizChange} placeholder="Enter quiz title" />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select className="form-select input-glass" id="category" name="category" value={quizData.category} onChange={handleQuizChange}>
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
              <select className="form-select input-glass" id="difficulty" name="difficulty" value={quizData.difficulty} onChange={handleQuizChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="timer" className="form-label">Timer (minutes)</label>
              <input type="number" className="form-control input-glass" id="timer" name="timer" value={quizData.timer} onChange={handleQuizChange} min="1" max="180" />
              <div className="form-text">Set the total time for the quiz</div>
            </div>
            <div className="col-md-12 mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea className="form-control input-glass" id="description" name="description" value={quizData.description} onChange={handleQuizChange} placeholder="Enter quiz description" rows="3"></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="timerPerQuestion" name="timerPerQuestion" checked={quizData.timerPerQuestion} onChange={handleQuizChange} />
                <label className="form-check-label" htmlFor="timerPerQuestion">Timer per question</label>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="examMode" name="examMode" checked={quizData.examMode} onChange={handleQuizChange} />
                <label className="form-check-label" htmlFor="examMode">Exam Mode (restricts navigation and copy/paste)</label>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="resultReleaseMode" className="form-label">Result Release Mode</label>
              <select className="form-select input-glass" id="resultReleaseMode" name="resultReleaseMode" value={quizData.resultReleaseMode} onChange={handleQuizChange}>
                <option value="immediate">Immediate</option>
                <option value="afterAll">After all attempts</option>
                <option value="specificDate">Specific date</option>
              </select>
            </div>
            {quizData.resultReleaseMode === 'specificDate' && (
              <div className="col-md-6 mb-3">
                <label htmlFor="resultReleaseDate" className="form-label">Result Release Date</label>
                <input type="datetime-local" className="form-control input-glass" id="resultReleaseDate" name="resultReleaseDate" value={quizData.resultReleaseDate} onChange={handleQuizChange} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div className="card card-glass mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="card-header">
          <h3 className="mb-0"><i className="bi bi-patch-question me-2"></i>Add Question</h3>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="questionText" className="form-label">Question *</label>
            <textarea className="form-control input-glass" id="questionText" name="questionText" value={currentQuestion.questionText} onChange={handleQuestionChange} placeholder="Enter your question" rows="2"></textarea>
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
                  <input className="form-check-input" type="radio" name="correctAnswer" id={`correctAnswer${index}`} checked={currentQuestion.correctAnswer === index} onChange={() => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: index }))} />
                  <label className="form-check-label" htmlFor={`correctAnswer${index}`}>Mark as Correct Answer</label>
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-md-12 mb-3">
              <label htmlFor="explanation" className="form-label">Explanation</label>
              <textarea className="form-control input-glass" id="explanation" name="explanation" value={currentQuestion.explanation} onChange={handleQuestionChange} placeholder="Explanation for the correct answer" rows="2"></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="hint" className="form-label">Hint</label>
              <input type="text" className="form-control input-glass" id="hint" name="hint" value={currentQuestion.hint} onChange={handleQuestionChange} placeholder="Hint for this question (optional)" />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="concept" className="form-label">Concept</label>
              <input type="text" className="form-control input-glass" id="concept" name="concept" value={currentQuestion.concept} onChange={handleQuestionChange} placeholder="Learning concept (optional)" />
            </div>
          </div>

          <button onClick={addQuestion} className="btn btn-gradient">
            <i className="bi bi-plus-circle me-2"></i>Add Question
          </button>
        </div>
      </motion.div>

      {quizData.questions.length > 0 && (
        <motion.div className="card card-glass mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="card-header">
            <h3 className="mb-0">Questions <span className="badge bg-primary ms-2">{quizData.questions.length}</span></h3>
          </div>
          <div className="card-body">
            <div className="list-group">
              {quizData.questions.map((question, index) => (
                <motion.div key={index} className="list-group-item list-group-item-action p-3 mb-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1">Question {index + 1}: {question.questionText.substring(0, 100)}{question.questionText.length > 100 ? '...' : ''}</h5>
                      <div className="mt-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="d-flex align-items-center mb-1">
                            <span className={`badge ${question.correctAnswer === optionIndex ? 'bg-success' : 'bg-secondary'} me-2`}>
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span>{option.substring(0, 50)}{option.length > 50 ? '...' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeQuestion(index)} className="btn btn-sm btn-danger ms-2">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="card card-glass p-4 mb-4">
        <div className="d-flex flex-wrap gap-3">
          <button onClick={() => saveQuiz(false)} className="btn btn-outline-secondary flex-fill" disabled={loading}>
            <i className="bi bi-save me-2"></i>Save as Draft
          </button>
          <button onClick={previewQuiz} className="btn btn-outline-info flex-fill" disabled={quizData.questions.length === 0}>
            <i className="bi bi-eye me-2"></i>Preview Quiz
          </button>
          <button onClick={() => saveQuiz(true)} className="btn btn-gradient flex-fill" disabled={loading || !quizData.title.trim() || quizData.questions.length === 0}>
            <i className="bi bi-send-check me-2"></i>Publish Quiz
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div className="modal-backdrop fade show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3" style={{ zIndex: 1050 }}>
              <motion.div className="modal-content card card-glass" initial={{ scale: 0.86 }} animate={{ scale: 1 }} exit={{ scale: 0.86 }}>
                <div className="modal-header">
                  <h5 className="modal-title">{quizData.title || 'Untitled Quiz'} Preview</h5>
                  <button onClick={() => setShowPreview(false)} className="btn-close btn-close-white" type="button"></button>
                </div>
                <div className="modal-body">
                  <p>{quizData.description || 'No description provided'}</p>
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <span className="badge bg-info">{getTimerLabel(quizData.timer, quizData.timerPerQuestion, quizData.questions.length)}</span>
                    <span className="badge bg-info">{quizData.questions.length} questions</span>
                    <span className="badge bg-info">{quizData.difficulty}</span>
                    {quizData.examMode && <span className="badge bg-warning">Exam Mode</span>}
                  </div>
                  {quizData.questions.slice(0, 3).map((question, index) => (
                    <div key={index} className="mb-3">
                      <h6>{index + 1}. {question.questionText}</h6>
                      <div className="ps-3">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="form-check">
                            <input className="form-check-input" type="radio" disabled checked={question.correctAnswer === optionIndex} readOnly />
                            <label className="form-check-label">{String.fromCharCode(65 + optionIndex)}. {option}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quizData.questions.length > 3 && <p className="text-muted mb-0">+ {quizData.questions.length - 3} more questions</p>}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default QuizCreator;
