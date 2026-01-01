import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './TeacherDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const TeacherDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showDancingIcon, setShowDancingIcon] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchQuizzes();
  }, [currentUser]);
  
  useEffect(() => {
    if (logoClickCount >= 5) {
      setShowDancingIcon(true);
      const timer = setTimeout(() => {
        setShowDancingIcon(false);
        setLogoClickCount(0);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  const fetchUserData = async () => {
    try {
      const data = await apiService.getCurrentUser();
      setUserData(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const quizzesData = await apiService.getMyQuizzes();
      
      const quizzesWithAttempts = [];
      let totalAttempts = 0;
      let totalScores = 0;
      let scoreCount = 0;

      for (const quiz of quizzesData) {
        const quizData = { ...quiz };
        
        // Get results for this quiz
        try {
          const results = await apiService.getQuizResults(quiz.quizId);
          quizData.attemptCount = results.length;
          totalAttempts += results.length;
          
          // Calculate average score for this quiz
          let quizTotalScore = 0;
          results.forEach(result => {
            totalScores += result.score;
            quizTotalScore += result.score;
            scoreCount++;
          });
          
          // Calculate average score for this specific quiz
          quizData.averageScore = results.length > 0 ? Math.round((quizTotalScore / results.length) * 100) / 100 : 0;
          
        } catch (error) {
          console.error('Error fetching results for quiz:', quiz.quizId, error);
          quizData.attemptCount = 0;
          quizData.averageScore = 0;
        }
        
        quizzesWithAttempts.push(quizData);
      }

      setQuizzes(quizzesWithAttempts);
      
      const publishedCount = quizzesWithAttempts.filter(q => q.published).length;
      
      setStats({
        totalQuizzes: quizzesWithAttempts.length,
        publishedQuizzes: publishedCount,
        totalAttempts: totalAttempts,
        averageScore: scoreCount > 0 ? Math.round((totalScores / scoreCount) * 100) / 100 : 0
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Chart data
  const quizStatsData = {
    labels: ['Total Quizzes', 'Published', 'Attempts'],
    datasets: [{
      label: 'Quiz Statistics',
      data: [stats.totalQuizzes, stats.publishedQuizzes, stats.totalAttempts],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)'
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(16, 185, 129, 1)'
      ],
      borderWidth: 1
    }]
  };

  const performanceData = {
    labels: ['Average Score'],
    datasets: [{
      label: 'Performance',
      data: [stats.averageScore],
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 1
    }]
  };

  const recentQuizzesData = {
    labels: quizzes.slice(0, 5).map(q => q.title.length > 15 ? q.title.substring(0, 15) + '...' : q.title),
    datasets: [
      {
        label: 'Attempts',
        data: quizzes.slice(0, 5).map(q => q.attemptCount || 0),
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1
      },
      {
        label: 'Average Score',
        data: quizzes.slice(0, 5).map(q => q.averageScore || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="sidebar glass-card">
          <div className="sidebar-header">
            <h2>QuizMaster</h2>
            <div className="user-role">Teacher</div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-item active">
              <span className="nav-icon">📊</span>
              Dashboard
            </div>
            <div className="nav-item">
              <span className="nav-icon">📋</span>
              My Quizzes
            </div>
            <div className="nav-item">
              <span className="nav-icon">➕</span>
              Create Quiz
            </div>
          </nav>
          <button className="btn btn-danger logout-btn" disabled>
            🚪 Logout
          </button>
        </div>
        <div className="dashboard-main">
          <div className="flex-center" style={{ minHeight: '100vh' }}>
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
            <div className="user-role">Teacher</div>
          </div>
          <nav className="sidebar-nav">
            <Link to="/teacher/dashboard" className="nav-item active">
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
            <Link to="/teacher/quizzes" className="nav-item">
              <span className="nav-icon">📋</span>
              My Quizzes
            </Link>
            <Link to="/teacher/create-quiz" className="nav-item">
              <span className="nav-icon">➕</span>
              Create Quiz
            </Link>
          </nav>
          <button onClick={handleLogout} className="btn btn-danger logout-btn">
            🚪 Logout
          </button>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-header glass-card">
            <div>
              <h1>Teacher Dashboard 🎓</h1>
              <p>Welcome back, {userData?.name || 'Teacher'}!</p>
            </div>
            <div className="header-actions">
              <button onClick={handleLogout} className="btn btn-danger">
                🚪 Logout
              </button>
            </div>
          </div>
          <div className="error-container">
            <div className="error-message">
              <h3>Error Loading Dashboard</h3>
              <p>{error}</p>
              <button onClick={() => {
                setError(null);
                fetchUserData();
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
        <div className="sidebar-header" onClick={() => setLogoClickCount(prev => prev + 1)}>
          <h2>QuizMaster</h2>
          <div className="user-role">Teacher</div>
          {showDancingIcon && (
            <div className="dancing-icon">🎉</div>
          )}
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
        
        <button onClick={handleLogout} className="btn btn-danger logout-btn">
          🚪 Logout
        </button>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header glass-card">
          <div>
            <h1>Teacher Dashboard 🎓</h1>
            <p>Welcome back, {userData?.name || 'Teacher'}!</p>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <motion.div 
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-content">
            <h3>{stats.totalQuizzes}</h3>
            <p>Total Quizzes</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-content">
            <h3>{stats.publishedQuizzes}</h3>
            <p>Published</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-content">
            <h3>{stats.totalAttempts}</h3>
            <p>Total Attempts</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-card-icon">⭐</div>
          <div className="stat-card-content">
            <h3>{stats.averageScore}%</h3>
            <p>Average Score</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Quiz Statistics</h3>
          <div className="chart-wrapper">
            <Bar data={quizStatsData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </motion.div>

        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Performance</h3>
          <div className="chart-wrapper">
            <Doughnut data={performanceData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
          </div>
        </motion.div>
      </div>

      {/* Recent Quizzes */}
      <motion.div 
        className="recent-quizzes glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="section-header">
          <h3>Recent Quizzes</h3>
          <Link to="/teacher/quizzes" className="btn btn-secondary">
            View All →
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <p>No quizzes created yet</p>
            <Link to="/teacher/create-quiz" className="btn btn-primary">
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="recent-quizzes-chart">
            <Bar data={recentQuizzesData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <motion.div 
          className="action-card glass-card"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to="/teacher/create-quiz" className="action-link">
            <div className="action-icon">➕</div>
            <h4>Create Quiz</h4>
            <p>Design a new quiz</p>
          </Link>
        </motion.div>

        <motion.div 
          className="action-card glass-card"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to="/teacher/quizzes" className="action-link">
            <div className="action-icon">📋</div>
            <h4>Manage Quizzes</h4>
            <p>Edit existing quizzes</p>
          </Link>
        </motion.div>
      </div>
      
      {/* Recent Activity */}
      <motion.div 
        className="recent-activity glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="section-header">
          <h3>Recent Activity</h3>
        </div>
        
        {quizzes.length > 0 ? (
          <div className="activity-list">
            {quizzes.slice(0, 5).map((quiz, index) => (
              <div key={quiz.quizId} className="activity-item">
                <div className="activity-content">
                  <h4>{quiz.title}</h4>
                  <p className="activity-meta">
                    <span className="activity-attempts">👥 {quiz.attemptCount || 0} attempts</span>
                    <span className="activity-date">{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </p>
                </div>
                <div className="activity-score">
                  <span className="score-badge">
                    {quiz.averageScore !== undefined ? `${quiz.averageScore}%` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent activity</p>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;