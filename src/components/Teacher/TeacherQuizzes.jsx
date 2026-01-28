import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

const TeacherQuizzes = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, unpublished

  useEffect(() => {
    fetchQuizzes();
  }, [currentUser]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const quizzesData = await apiService.getMyQuizzes();
      
      // Sort quizzes by creation date (newest first)
      quizzesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(quizzesData);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      if (error.message.includes('Session expired')) {
        navigate('/login');
      } else {
        setError('Failed to load quizzes: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (quizId, currentStatus) => {
    try {
      console.log('Toggling publish status for quiz:', quizId, 'Current status:', currentStatus);
      await apiService.publishQuiz(quizId, !currentStatus);
      
      setQuizzes(quizzes.map(q => 
        q.quizId === quizId ? { ...q, published: !currentStatus } : q
      ));
      console.log('Quiz publish status updated successfully');
    } catch (error) {
      console.error('Error toggling publish status:', error);
      if (error.message.includes('Session expired')) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to update quiz status: ' + error.message);
      }
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.quizId !== quizId));
      alert('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      if (error.message.includes('Session expired')) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to delete quiz: ' + error.message);
      }
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'published') return q.published;
    if (filter === 'unpublished') return !q.published;
    return true;
  });

  if (error) {
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
                    <h1 className="gradient-text mb-1">My Quizzes <i className="bi bi-journal-text"></i></h1>
                    <p className="mb-0">Manage all your created quizzes</p>
                  </div>
                  <button onClick={logout} className="btn btn-danger">
                    <i className="bi bi-door-open me-1"></i> Logout
                  </button>
                </div>
              </div>
              
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <div className="card card-glass p-4">
                    <h3 className="text-center mb-3">Error Loading Quizzes</h3>
                    <p className="text-center text-muted">{error}</p>
                    <div className="text-center">
                      <button onClick={() => {
                        setError(null);
                        fetchQuizzes();
                      }} className="btn btn-gradient">
                        <i className="bi bi-arrow-repeat me-2"></i>Retry
                      </button>
                    </div>
                  </div>
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
                  <h1 className="gradient-text mb-1">My Quizzes <i className="bi bi-journal-text"></i></h1>
                  <p className="mb-0">Manage all your created quizzes</p>
                </div>
                <button onClick={logout} className="btn btn-danger">
                  <i className="bi bi-door-open me-1"></i> Logout
                </button>
              </div>
            </div>

            {/* Filters */}
            <motion.div 
              className="card card-glass mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  <button 
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilter('all')}
                  >
                    All ({quizzes.length})
                  </button>
                  <button 
                    className={`btn ${filter === 'published' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilter('published')}
                  >
                    Published ({quizzes.filter(q => q.published).length})
                  </button>
                  <button 
                    className={`btn ${filter === 'unpublished' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilter('unpublished')}
                  >
                    Unpublished ({quizzes.filter(q => !q.published).length})
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quizzes List */}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-white">Loading quizzes...</p>
                </div>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <motion.div 
                className="card card-glass p-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="mb-3">No quizzes found</h3>
                <p className="text-muted">{filter === 'all' ? 'Create your first quiz to get started!' : `No ${filter} quizzes yet.`}</p>
                <Link to="/teacher/create-quiz" className="btn btn-gradient">
                  <i className="bi bi-plus-circle me-2"></i>Create Quiz
                </Link>
              </motion.div>
            ) : (
              <div className="row">
                {filteredQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.quizId}
                    className="col-md-6 col-lg-4 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="card card-glass h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title">{quiz.title}</h5>
                          <span className={`badge ${quiz.published ? 'bg-success' : 'bg-warning'} text-dark`}>
                            {quiz.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        
                        <p className="card-text text-muted">
                          {quiz.description?.substring(0, 100) || 'No description'}
                          {quiz.description?.length > 100 && '...'}
                        </p>
                        
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-info">{quiz.category}</span>
                          <span className="badge bg-info">{quiz.difficulty}</span>
                          <span className="badge bg-info">{quiz.questions?.length || 0} Questions</span>
                          <span className="badge bg-info">{quiz.timer} min</span>
                        </div>
                        
                        <div className="row text-center mb-3">
                          <div className="col-6">
                            <div className="fw-bold text-primary">{quiz.attemptCount || 0}</div>
                            <div className="text-muted small">Attempts</div>
                          </div>
                          <div className="col-6">
                            <div className="fw-bold text-primary">
                              {new Date(quiz.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-muted small">Created</div>
                          </div>
                        </div>
                        
                        <div className="d-grid gap-2">
                          <Link to={`/teacher/edit-quiz/${quiz.quizId}`} className="btn btn-outline-secondary">
                            <i className="bi bi-pencil me-1"></i> Edit
                          </Link>
                          <button 
                            onClick={() => togglePublish(quiz.quizId, quiz.published)}
                            className={`btn ${quiz.published ? 'btn-warning' : 'btn-success'}`}
                          >
                            {quiz.published ? <><i className="bi bi-lock me-1"></i> Unpublish</> : <><i className="bi bi-send me-1"></i> Publish</>}
                          </button>
                          <button 
                            onClick={() => deleteQuiz(quiz.quizId)}
                            className="btn btn-danger"
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </button>
                          <Link to={`/teacher/results/${quiz.quizId}`} className="btn btn-info">
                            <i className="bi bi-bar-chart me-1"></i> Results
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherQuizzes;