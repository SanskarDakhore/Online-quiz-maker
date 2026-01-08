import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import './StudentQuizzes.css';

const StudentQuizzes = () => {
  const { currentUser, logout, userRole } = useAuth();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debug logging
  console.log('StudentQuizzes component - currentUser:', currentUser);
  console.log('StudentQuizzes component - userRole:', userRole);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quizzes, filterCategory, filterDifficulty, searchTerm]);

  const fetchQuizzes = async () => {
    try {
      console.log('Fetching published quizzes...');
      const quizzesData = await apiService.getQuizzes();
      
      console.log('Found quizzes:', quizzesData.length);
      setQuizzes(quizzesData);
      setFilteredQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quizzes];

    if (filterCategory !== 'All') {
      filtered = filtered.filter(q => q.category === filterCategory);
    }

    if (filterDifficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.description && q.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredQuizzes(filtered);
  };

  const categories = ['All', ...new Set(quizzes.map(q => q.category))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="sidebar glass-card">
          <div className="sidebar-header">
            <h2>QuizMaster</h2>
            <div className="user-role">Student</div>
          </div>
          <nav className="sidebar-nav">
            <Link to="/student/quizzes" className={`nav-item ${location.pathname === '/student/quizzes' ? 'active' : ''}`}>
              <span className="nav-icon">📚</span>
              Available Quizzes
            </Link>
            <Link to="/student/profile" className={`nav-item ${location.pathname === '/student/profile' ? 'active' : ''}`}>
              <span className="nav-icon">👤</span>
              Profile
            </Link>
          </nav>
          <button onClick={logout} className="btn btn-danger logout-btn">
            🚪 Logout
          </button>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-header glass-card">
            <div>
              <h1>Available Quizzes 📚</h1>
              <p>Choose a quiz and test your knowledge</p>
            </div>
            <div className="header-actions">
              <button onClick={logout} className="btn btn-danger">
                🚪 Logout
              </button>
            </div>
          </div>
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="teacher-dashboard">
        <div className="sidebar glass-card">
          <div className="sidebar-header">
            <h2>QuizMaster</h2>
            <div className="user-role">Student</div>
          </div>
          <nav className="sidebar-nav">
            <Link to="/student/quizzes" className={`nav-item ${location.pathname === '/student/quizzes' ? 'active' : ''}`}>
              <span className="nav-icon">📚</span>
              Available Quizzes
            </Link>
            <Link to="/student/profile" className={`nav-item ${location.pathname === '/student/profile' ? 'active' : ''}`}>
              <span className="nav-icon">👤</span>
              Profile
            </Link>
          </nav>
          <button onClick={logout} className="btn btn-danger logout-btn">
            🚪 Logout
          </button>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-header glass-card">
            <div>
              <h1>Available Quizzes 📚</h1>
              <p>Choose a quiz and test your knowledge</p>
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
          <div className="user-role">Student</div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/student/quizzes" className={`nav-item ${location.pathname === '/student/quizzes' ? 'active' : ''}`}>
            <span className="nav-icon">📚</span>
            Available Quizzes
          </Link>
          <Link to="/student/profile" className={`nav-item ${location.pathname === '/student/profile' ? 'active' : ''}`}>
            <span className="nav-icon">👤</span>
            Profile
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
            <h1>Available Quizzes 📚</h1>
            <p>Choose a quiz and test your knowledge</p>
          </div>
          <div className="header-actions">
            <button onClick={logout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

      <motion.div 
        className="filters-section glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          type="text"
          placeholder="🔍 Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty:</label>
            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.length === 0 ? (
            <div className="empty-state glass-card">
              <h3>No quizzes found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.quizId}
                className="quiz-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="quiz-card-header">
                  <h3>{quiz.title}</h3>
                  <span className={`difficulty-badge ${quiz.difficulty.toLowerCase()}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <p className="quiz-card-description">
                  {quiz.description?.substring(0, 100) || 'No description available'}
                  {quiz.description?.length > 100 && '...'}
                </p>

                <div className="quiz-card-meta">
                  <span>📂 {quiz.category}</span>
                  <span>❓ {quiz.questions?.length || 0} Questions</span>
                  <span>⏱️ {quiz.timer} min</span>
                </div>

                <Link to={`/student/quiz/${quiz.quizId}`} className="btn btn-primary btn-full">
                  Start Quiz →
                </Link>
              </motion.div>
            ))
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentQuizzes;