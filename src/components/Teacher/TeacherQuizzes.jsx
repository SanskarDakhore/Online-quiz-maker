import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import './TeacherQuizzes.css';

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
      <div className="teacher-dashboard">
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
        <div className="dashboard-main">
          <div className="dashboard-header glass-card">
            <div>
              <h1>My Quizzes 📝</h1>
              <p>Manage all your created quizzes</p>
            </div>
            <div className="header-actions">
              <button onClick={logout} className="btn btn-danger">
                🚪 Logout
              </button>
            </div>
          </div>
          <div className="error-container">
            <div className="error-message">
              <h3>Error Loading Quizzes</h3>
              <p>{error}</p>
              <button onClick={() => {
                setError(null);
                fetchQuizzes();
              }} className="btn btn-primary">
                Retry
              </button>
            </div>
          </div>
        </div>
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
            <h1>My Quizzes 📝</h1>
            <p>Manage all your created quizzes</p>
          </div>
          <div className="header-actions">
            <button onClick={logout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

      {/* Filters */}
      <motion.div 
        className="filters-bar glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({quizzes.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Published ({quizzes.filter(q => q.published).length})
          </button>
          <button 
            className={`filter-tab ${filter === 'unpublished' ? 'active' : ''}`}
            onClick={() => setFilter('unpublished')}
          >
            Unpublished ({quizzes.filter(q => !q.published).length})
          </button>
        </div>
      </motion.div>

      {/* Quizzes List */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <motion.div 
          className="empty-state glass-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3>No quizzes found</h3>
          <p>{filter === 'all' ? 'Create your first quiz to get started!' : `No ${filter} quizzes yet.`}</p>
          <Link to="/teacher/create-quiz" className="btn btn-primary mt-2">
            ➕ Create Quiz
          </Link>
        </motion.div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.quizId}
              className="quiz-management-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="quiz-card-header">
                <div className="quiz-card-title">
                  <h3>{quiz.title}</h3>
                  <span className={`status-badge ${quiz.published ? 'published' : 'unpublished'}`}>
                    {quiz.published ? '✅ Published' : '❌ Unpublished'}
                  </span>
                </div>
              </div>

              <p className="quiz-description">
                {quiz.description?.substring(0, 100) || 'No description'}
                {quiz.description?.length > 100 && '...'}
              </p>

              <div className="quiz-meta-info">
                <div className="meta-item">
                  <span className="meta-icon">📂</span>
                  <span>{quiz.category}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📊</span>
                  <span>{quiz.difficulty}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">❓</span>
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span>{quiz.timer} min</span>
                </div>
              </div>

              <div className="quiz-stats">
                <div className="stat-item">
                  <span className="stat-value">{quiz.attemptCount || 0}</span>
                  <span className="stat-label">Attempts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(quiz.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="stat-label">Created</span>
                </div>
              </div>

              <div className="quiz-actions">
                <Link to={`/teacher/edit-quiz/${quiz.quizId}`} className="btn btn-secondary btn-small">
                  ✏️ Edit
                </Link>
                <button 
                  onClick={() => togglePublish(quiz.quizId, quiz.published)}
                  className={`btn btn-${quiz.published ? 'warning' : 'success'} btn-small`}
                >
                  {quiz.published ? '🔒 Unpublish' : '🚀 Publish'}
                </button>
                <button 
                  onClick={() => deleteQuiz(quiz.quizId)}
                  className="btn btn-danger btn-small"
                >
                  🗑️ Delete
                </button>
                <Link to={`/teacher/results/${quiz.quizId}`} className="btn btn-info btn-small">
                  📊 Results
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default TeacherQuizzes;