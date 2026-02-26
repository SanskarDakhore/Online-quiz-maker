import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import '../../bootstrap-theme.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const TeacherDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showLogoPulse, setShowLogoPulse] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logoClickCount < 5) return;
    setShowLogoPulse(true);
    const timer = setTimeout(() => {
      setShowLogoPulse(false);
      setLogoClickCount(0);
    }, 2500);
    return () => clearTimeout(timer);
  }, [logoClickCount]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const userResponse = await apiService.getCurrentUser();
      setUserData(userResponse.user);

      const quizzesData = await apiService.getMyQuizzes();
      const quizzesWithStats = await Promise.all(
        quizzesData.map(async (quiz) => {
          try {
            const results = await apiService.getQuizResults(quiz.quizId);
            const attempts = Array.isArray(results) ? results.length : 0;
            const averageScore = attempts > 0 ? Number((results.reduce((sum, item) => sum + item.score, 0) / attempts).toFixed(2)) : 0;
            return { ...quiz, attemptCount: attempts, averageScore };
          } catch {
            return { ...quiz, attemptCount: 0, averageScore: 0 };
          }
        })
      );
      setQuizzes(quizzesWithStats);
    } catch (err) {
      setError(`Failed to load dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const stats = useMemo(() => {
    const totalQuizzes = quizzes.length;
    const publishedQuizzes = quizzes.filter((q) => q.published).length;
    const totalAttempts = quizzes.reduce((sum, q) => sum + (q.attemptCount || 0), 0);
    const scoreEntries = quizzes.filter((q) => Number.isFinite(q.averageScore) && q.attemptCount > 0);
    const averageScore = scoreEntries.length > 0
      ? Number((scoreEntries.reduce((sum, q) => sum + q.averageScore, 0) / scoreEntries.length).toFixed(2))
      : 0;

    return { totalQuizzes, publishedQuizzes, totalAttempts, averageScore };
  }, [quizzes]);

  const formattedLocalTime = useMemo(() => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(currentTime), [currentTime]);

  const formattedUtcTime = useMemo(() => new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(currentTime), [currentTime]);

  const quizStatsData = {
    labels: ['Total Quizzes', 'Published', 'Attempts'],
    datasets: [{
      label: 'Quiz Statistics',
      data: [stats.totalQuizzes, stats.publishedQuizzes, stats.totalAttempts],
      backgroundColor: ['rgba(45, 188, 164, 0.8)', 'rgba(56, 189, 248, 0.8)', 'rgba(245, 158, 11, 0.8)'],
      borderWidth: 1,
    }],
  };

  const performanceData = {
    labels: ['Average Score'],
    datasets: [{
      label: 'Performance',
      data: [stats.averageScore],
      backgroundColor: ['rgba(245, 158, 11, 0.85)'],
      borderWidth: 1,
    }],
  };

  const recentQuizzesData = {
    labels: quizzes.slice(0, 5).map((q) => (q.title.length > 15 ? `${q.title.slice(0, 15)}...` : q.title)),
    datasets: [
      {
        label: 'Attempts',
        data: quizzes.slice(0, 5).map((q) => q.attemptCount || 0),
        backgroundColor: 'rgba(56, 189, 248, 0.8)',
      },
      {
        label: 'Average Score',
        data: quizzes.slice(0, 5).map((q) => q.averageScore || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  return (
    <DashboardLayout
      role="teacher"
      currentPath={location.pathname}
      onLogout={handleLogout}
      title="Teacher Dashboard"
      subtitle={`Welcome back, ${userData?.name || 'Teacher'}!`}
      iconClass="bi-mortarboard"
      onBrandClick={() => setLogoClickCount((prev) => prev + 1)}
      showBrandPulse={showLogoPulse}
      headerRight={
        <div className="d-flex align-items-center gap-3">
          <div className="text-end dashboard-header-meta">
            <div className="small text-muted">
              <i className="bi bi-globe2 me-1"></i>UTC
            </div>
            <div className="fw-semibold">{formattedUtcTime}</div>
            <div className="small text-muted">
              <i className="bi bi-clock me-1"></i>Local: {formattedLocalTime}
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">
            <i className="bi bi-door-open me-1"></i> Logout
          </button>
        </div>
      }
      loading={loading}
      loadingText="Loading dashboard..."
      error={error}
      onRetry={fetchDashboardData}
    >
      <div className="row mb-4">
        <motion.div className="col-md-3 mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-journals"></i></div>
              <h3 className="gradient-text mb-1">{stats.totalQuizzes}</h3>
              <p className="text-muted mb-0">Total Quizzes</p>
            </div>
          </div>
        </motion.div>
        <motion.div className="col-md-3 mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-cloud-check"></i></div>
              <h3 className="gradient-text mb-1">{stats.publishedQuizzes}</h3>
              <p className="text-muted mb-0">Published</p>
            </div>
          </div>
        </motion.div>
        <motion.div className="col-md-3 mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-people"></i></div>
              <h3 className="gradient-text mb-1">{stats.totalAttempts}</h3>
              <p className="text-muted mb-0">Total Attempts</p>
            </div>
          </div>
        </motion.div>
        <motion.div className="col-md-3 mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-graph-up-arrow"></i></div>
              <h3 className="gradient-text mb-1">{stats.averageScore}%</h3>
              <p className="text-muted mb-0">Average Score</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8 mb-4 mb-md-0">
          <motion.div className="card card-glass h-100" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <div className="card-body">
              <h3 className="mb-4">Quiz Statistics</h3>
              <div style={{ height: '300px' }}>
                <Bar data={quizStatsData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="col-md-4">
          <motion.div className="card card-glass h-100" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div className="card-body">
              <h3 className="mb-4">Performance</h3>
              <div style={{ height: '300px' }}>
                <Doughnut data={performanceData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div className="card card-glass mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Recent Quizzes</h3>
          <Link to="/teacher/quizzes" className="btn btn-outline-primary btn-sm">
            View All <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="card-body">
          {quizzes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No quizzes created yet</p>
              <Link to="/teacher/create-quiz" className="btn btn-gradient">
                <i className="bi bi-plus-circle me-2"></i>Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div style={{ height: '300px' }}>
              <Bar data={recentQuizzesData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          )}
        </div>
      </motion.div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <motion.div className="card card-glass h-100" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="card-body text-center">
              <Link to="/teacher/create-quiz" className="text-decoration-none">
                <div className="display-5 mb-2"><i className="bi bi-plus-square"></i></div>
                <h4 className="gradient-text">Create Quiz</h4>
                <p className="text-muted mb-0">Design a new quiz</p>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="col-md-6 mb-3">
          <motion.div className="card card-glass h-100" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="card-body text-center">
              <Link to="/teacher/quizzes" className="text-decoration-none">
                <div className="display-5 mb-2"><i className="bi bi-kanban"></i></div>
                <h4 className="gradient-text">Manage Quizzes</h4>
                <p className="text-muted mb-0">Edit and review existing quizzes</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div className="card card-glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <div className="card-header">
          <h3 className="mb-0">Recent Activity</h3>
        </div>
        <div className="card-body">
          {quizzes.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-transparent">
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Attempts</th>
                    <th>Created Date</th>
                    <th>Avg. Score</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.slice(0, 5).map((quiz) => (
                    <tr key={quiz.quizId}>
                      <td>{quiz.title}</td>
                      <td><span className="badge bg-info">{quiz.attemptCount || 0} attempts</span></td>
                      <td>{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td><span className="badge bg-primary">{quiz.averageScore}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No recent activity</p>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
