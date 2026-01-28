import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import '../../bootstrap-theme.css';

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
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar-custom p-3 min-vh-100">
            <div className="mb-4 text-center">
              <h3 className="gradient-text mb-1">QuizMaster</h3>
              <small className="text-muted">Student</small>
            </div>
            <nav className="nav flex-column mb-4">
              <Link to="/student/quizzes" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/student/quizzes' ? 'active bg-primary' : ''}`}>
                <i className="bi bi-book me-2"></i> Available Quizzes
              </Link>
              <Link to="/student/profile" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/student/profile' ? 'active bg-primary' : ''}`}>
                <i className="bi bi-person me-2"></i> Profile
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
                    <h1 className="gradient-text mb-1">Available Quizzes <i className="bi bi-book"></i></h1>
                    <p className="mb-0">Choose a quiz and test your knowledge</p>
                  </div>
                  <button onClick={logout} className="btn btn-danger">
                    <i className="bi bi-door-open me-1"></i> Logout
                  </button>
                </div>
              </div>
              
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-white">Loading quizzes...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar-custom p-3 min-vh-100">
            <div className="mb-4 text-center">
              <h3 className="gradient-text mb-1">QuizMaster</h3>
              <small className="text-muted">Student</small>
            </div>
            <nav className="nav flex-column mb-4">
              <Link to="/student/quizzes" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/student/quizzes' ? 'active bg-primary' : ''}`}>
                <i className="bi bi-book me-2"></i> Available Quizzes
              </Link>
              <Link to="/student/profile" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/student/profile' ? 'active bg-primary' : ''}`}>
                <i className="bi bi-person me-2"></i> Profile
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
                    <h1 className="gradient-text mb-1">Available Quizzes <i className="bi bi-book"></i></h1>
                    <p className="mb-0">Choose a quiz and test your knowledge</p>
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
            <small className="text-muted">Student</small>
          </div>
          
          <nav className="nav flex-column mb-4">
            <Link to="/student/quizzes" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/student/quizzes' ? 'active bg-primary' : ''}`}>
              <i className="bi bi-book me-2"></i> Available Quizzes
            </Link>
            <Link to="/student/profile" className={`nav-link text-white rounded py-2 px-3 mb-1 ${location.pathname === '/student/profile' ? 'active bg-primary' : ''}`}>
              <i className="bi bi-person me-2"></i> Profile
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
                  <h1 className="gradient-text mb-1">Available Quizzes <i className="bi bi-book"></i></h1>
                  <p className="mb-0">Choose a quiz and test your knowledge</p>
                </div>
                <button onClick={logout} className="btn btn-danger">
                  <i className="bi bi-door-open me-1"></i> Logout
                </button>
              </div>
            </div>

            <motion.div 
              className="card card-glass mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-body">
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="🔍 Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control input-glass"
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label className="form-label">Category</label>
                    <select 
                      value={filterCategory} 
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="form-select input-glass"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-2">
                    <label className="form-label">Difficulty</label>
                    <select 
                      value={filterDifficulty} 
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="form-select input-glass"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-white">Loading quizzes...</p>
                </div>
              </div>
            ) : (
              <div className="row">
                {filteredQuizzes.length === 0 ? (
                  <div className="col-12">
                    <div className="card card-glass p-4 text-center">
                      <h3 className="mb-3">No quizzes found</h3>
                      <p className="text-muted">Try adjusting your filters</p>
                    </div>
                  </div>
                ) : (
                  filteredQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.quizId}
                      className="col-md-6 col-lg-4 mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="card card-glass h-100">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title">{quiz.title}</h5>
                            <span className={`badge bg-${quiz.difficulty.toLowerCase() === 'easy' ? 'success' : quiz.difficulty.toLowerCase() === 'medium' ? 'warning' : 'danger'}`}>
                              {quiz.difficulty}
                            </span>
                          </div>
                          
                          <p className="card-text text-muted flex-grow-1">
                            {quiz.description?.substring(0, 100) || 'No description available'}
                            {quiz.description?.length > 100 && '...'}
                          </p>
                          
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="badge bg-info">📂 {quiz.category}</span>
                            <span className="badge bg-info">❓ {quiz.questions?.length || 0} Questions</span>
                            <span className="badge bg-info">⏱️ {quiz.timer} min</span>
                          </div>
                          
                          <Link to={`/student/quiz/${quiz.quizId}`} className="btn btn-gradient mt-auto">
                            Start Quiz <i className="bi bi-arrow-right ms-1"></i>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizzes;