import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import '../../bootstrap-theme.css';

const TeacherQuizzes = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchQuizzes();
  }, [currentUser]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const quizzesData = await apiService.getMyQuizzes();
      const sorted = [...quizzesData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(sorted);
    } catch (err) {
      if (err.message.includes('Session expired')) {
        navigate('/login');
        return;
      }
      setError(`Failed to load quizzes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredQuizzes = useMemo(() => {
    if (filter === 'published') return quizzes.filter((q) => q.published);
    if (filter === 'unpublished') return quizzes.filter((q) => !q.published);
    return quizzes;
  }, [quizzes, filter]);

  const getTimerLabel = (quiz) => {
    const questionCount = quiz.questions?.length || 0;
    if (quiz.timerPerQuestion) return `${quiz.timer} min/question (${quiz.timer * questionCount} min total)`;
    return `${quiz.timer} min total`;
  };

  const togglePublish = async (quizId, currentStatus) => {
    try {
      await apiService.publishQuiz(quizId, !currentStatus);
      setQuizzes((prev) => prev.map((q) => (q.quizId === quizId ? { ...q, published: !currentStatus } : q)));
    } catch (err) {
      if (err.message.includes('Session expired')) {
        navigate('/login');
        return;
      }
      alert(`Failed to update quiz status: ${err.message}`);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    try {
      await apiService.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));
    } catch (err) {
      if (err.message.includes('Session expired')) {
        navigate('/login');
        return;
      }
      alert(`Failed to delete quiz: ${err.message}`);
    }
  };

  return (
    <DashboardLayout
      role="teacher"
      currentPath={location.pathname}
      onLogout={handleLogout}
      title="My Quizzes"
      subtitle="Manage all your created quizzes"
      iconClass="bi-journal-text"
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
          <div className="d-flex flex-wrap gap-2">
            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter('all')}>
              All ({quizzes.length})
            </button>
            <button className={`btn ${filter === 'published' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter('published')}>
              Published ({quizzes.filter((q) => q.published).length})
            </button>
            <button className={`btn ${filter === 'unpublished' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter('unpublished')}>
              Drafts ({quizzes.filter((q) => !q.published).length})
            </button>
          </div>
        </div>
      </motion.div>

      {filteredQuizzes.length === 0 ? (
        <motion.div className="card card-glass p-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="mb-3">No quizzes found</h3>
          <p className="text-muted">{filter === 'all' ? 'Create your first quiz to get started.' : `No ${filter} quizzes yet.`}</p>
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
              transition={{ delay: index * 0.07 }}
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
                    {quiz.description?.substring(0, 96) || 'No description'}
                    {quiz.description?.length > 96 && '...'}
                  </p>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-info">{quiz.category}</span>
                    <span className="badge bg-info">{quiz.difficulty}</span>
                    <span className="badge bg-info">{quiz.questions?.length || 0} Questions</span>
                    <span className="badge bg-info">{getTimerLabel(quiz)}</span>
                  </div>

                  <div className="row text-center mb-3">
                    <div className="col-6">
                      <div className="fw-bold text-primary">{quiz.attemptCount || 0}</div>
                      <div className="text-muted small">Attempts</div>
                    </div>
                    <div className="col-6">
                      <div className="fw-bold text-primary">
                        {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-muted small">Created</div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <Link to={`/teacher/edit-quiz/${quiz.quizId}`} className="btn btn-outline-secondary">
                      <i className="bi bi-pencil me-1"></i>Edit
                    </Link>
                    <button onClick={() => togglePublish(quiz.quizId, quiz.published)} className={`btn ${quiz.published ? 'btn-warning' : 'btn-success'}`}>
                      {quiz.published ? <><i className="bi bi-lock me-1"></i>Unpublish</> : <><i className="bi bi-send me-1"></i>Publish</>}
                    </button>
                    <button onClick={() => deleteQuiz(quiz.quizId)} className="btn btn-danger">
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                    <Link to={`/teacher/results/${quiz.quizId}`} className="btn btn-info">
                      <i className="bi bi-bar-chart me-1"></i>Results
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeacherQuizzes;
