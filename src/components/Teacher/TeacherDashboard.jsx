import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [userData, setUserData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showDancingIcon, setShowDancingIcon] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchQuizzes();
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const data = await apiService.getCurrentUser();
      setUserData(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
          
          results.forEach(result => {
            totalScores += result.score;
            scoreCount++;
          });
        } catch (error) {
          console.error('Error fetching results for quiz:', quiz.quizId, error);
          quizData.attemptCount = 0;
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
    datasets: [{
      label: 'Attempts',
      data: quizzes.slice(0, 5).map(q => q.attemptCount || 0),
      backgroundColor: 'rgba(14, 165, 233, 0.8)',
      borderColor: 'rgba(14, 165, 233, 1)',
      borderWidth: 1
    }]
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      {/* Header */}
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
          <h3>{stats.totalQuizzes}</h3>
          <p>Total Quizzes</p>
          <div className="stat-icon">📝</div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>{stats.publishedQuizzes}</h3>
          <p>Published</p>
          <div className="stat-icon">✅</div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>{stats.totalAttempts}</h3>
          <p>Total Attempts</p>
          <div className="stat-icon">👥</div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>{stats.averageScore}%</h3>
          <p>Average Score</p>
          <div className="stat-icon">⭐</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <motion.div 
          className="chart-container glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Quiz Statistics</h3>
          <Bar data={quizStatsData} options={{ responsive: true, maintainAspectRatio: false }} />
        </motion.div>

        <motion.div 
          className="chart-container glass-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Performance</h3>
          <Doughnut data={performanceData} options={{ responsive: true, maintainAspectRatio: false }} />
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
            <Bar data={recentQuizzesData} options={{ responsive: true, maintainAspectRatio: false }} />
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
    </div>
  );
};

export default TeacherDashboard;