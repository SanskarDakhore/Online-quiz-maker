import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import '../../bootstrap-theme.css';

const StudentQuizzes = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const quizzesData = await apiService.getQuizzes();
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (err) {
      setError(`Failed to load quizzes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const categories = useMemo(() => ['All', ...new Set(quizzes.map((q) => q.category))], [quizzes]);
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuizzes = useMemo(() => {
    let filtered = [...quizzes];
    if (filterCategory !== 'All') filtered = filtered.filter((q) => q.category === filterCategory);
    if (filterDifficulty !== 'All') filtered = filtered.filter((q) => q.difficulty === filterDifficulty);
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((q) => q.title.toLowerCase().includes(query) || q.description?.toLowerCase().includes(query));
    }
    return filtered;
  }, [quizzes, filterCategory, filterDifficulty, searchTerm]);

  const getTimerLabel = (quiz) => {
    const questionCount = quiz.questions?.length || 0;
    if (quiz.timerPerQuestion) return `${quiz.timer} min/question (${quiz.timer * questionCount} min total)`;
    return `${quiz.timer} min total`;
  };

  return (
    <DashboardLayout
      role="student"
      currentPath={location.pathname}
      onLogout={handleLogout}
      title="Available Quizzes"
      subtitle="Choose a quiz and test your knowledge"
      iconClass="bi-book"
      headerRight={
        <button onClick={handleLogout} className="btn btn-danger">
          <i className="bi bi-door-open me-1"></i> Logout
        </button>
      }
      loading={loading}
      loadingText="Loading quizzes..."
      error={error}
      onRetry={fetchQuizzes}
    >
      <motion.div className="card card-glass mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-body">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control input-glass"
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="form-select input-glass">
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Difficulty</label>
              <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="form-select input-glass">
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {filteredQuizzes.length === 0 ? (
        <div className="card card-glass p-4 text-center">
          <h3 className="mb-3">No quizzes found</h3>
          <p className="text-muted mb-0">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="row">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.quizId}
              className="col-md-6 col-lg-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              <div className="card card-glass h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{quiz.title}</h5>
                    <span className={`badge bg-${quiz.difficulty?.toLowerCase() === 'easy' ? 'success' : quiz.difficulty?.toLowerCase() === 'medium' ? 'warning' : 'danger'}`}>
                      {quiz.difficulty}
                    </span>
                  </div>

                  <p className="card-text text-muted flex-grow-1">
                    {quiz.description?.substring(0, 100) || 'No description available'}
                    {quiz.description?.length > 100 && '...'}
                  </p>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-info">{quiz.category}</span>
                    <span className="badge bg-info">{quiz.questions?.length || 0} Questions</span>
                    <span className="badge bg-info">{getTimerLabel(quiz)}</span>
                  </div>

                  <Link to={`/student/quiz/${quiz.quizId}`} className="btn btn-gradient mt-auto">
                    Start Quiz <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentQuizzes;
