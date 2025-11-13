import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
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
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const quizzesData = [];
      let totalAttempts = 0;
      let totalScores = 0;
      let scoreCount = 0;

      for (const doc of querySnapshot.docs) {
        const quizData = { id: doc.id, ...doc.data() };
        
        // Get results for this quiz
        const resultsQuery = query(collection(db, 'results'), where('quizId', '==', doc.id));
        const resultsSnapshot = await getDocs(resultsQuery);
        
        quizData.attemptCount = resultsSnapshot.size;
        totalAttempts += resultsSnapshot.size;
        
        resultsSnapshot.forEach(resultDoc => {
          const resultData = resultDoc.data();
          totalScores += resultData.score;
          scoreCount++;
        });
        
        quizzesData.push(quizData);
      }

      setQuizzes(quizzesData);
      
      const publishedCount = quizzesData.filter(q => q.published).length;
      
      setStats({
        totalQuizzes: quizzesData.length,
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

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    if (logoClickCount === 4) {
      setShowDancingIcon(true);
      setTimeout(() => setShowDancingIcon(false), 3000);
      setLogoClickCount(0);
    }
  };

  // Chart data
  const quizPerformanceData = {
    labels: quizzes.slice(0, 5).map(q => q.title.substring(0, 15) + '...'),
    datasets: [{
      label: 'Number of Attempts',
      data: quizzes.slice(0, 5).map(q => q.attemptCount || 0),
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      borderRadius: 10,
    }]
  };

  const quizStatusData = {
    labels: ['Published', 'Unpublished'],
    datasets: [{
      data: [stats.publishedQuizzes, stats.totalQuizzes - stats.publishedQuizzes],
      backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
      borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)'
        }
      }
    },
    scales: {
      y: {
        ticks: { color: 'var(--text-secondary)' },
        grid: { color: 'var(--glass-border)' }
      },
      x: {
        ticks: { color: 'var(--text-secondary)' },
        grid: { color: 'var(--glass-border)' }
      }
    }
  };

  return (
    <div className="teacher-dashboard">
      {/* Sidebar Navigation */}
      <motion.aside 
        className="sidebar glass-card"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sidebar-header" onClick={handleLogoClick}>
          <h2>📚 QuizMaster</h2>
          <p className="user-role">Teacher Panel</p>
        </div>

        {showDancingIcon && (
          <motion.div 
            className="dancing-icon"
            animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 5 }}
          >
            🎉🕺💃
          </motion.div>
        )}

        <nav className="sidebar-nav">
          <Link to="/teacher/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/teacher/quizzes" className="nav-item">
            <span className="nav-icon">📝</span>
            My Quizzes
          </Link>
          <Link to="/teacher/create-quiz" className="nav-item">
            <span className="nav-icon">➕</span>
            Create Quiz
          </Link>
        </nav>

        <button onClick={handleLogout} className="btn btn-danger logout-btn">
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <motion.div 
          className="dashboard-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div>
            <h1>Welcome back, {userData?.name}! 👋</h1>
            <p className="dashboard-subtitle">Here's what's happening with your quizzes</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <motion.div 
                className="stat-card glass-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  📝
                </div>
                <div className="stat-info">
                  <h3>{stats.totalQuizzes}</h3>
                  <p>Total Quizzes</p>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card glass-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  ✅
                </div>
                <div className="stat-info">
                  <h3>{stats.publishedQuizzes}</h3>
                  <p>Published</p>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card glass-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  👥
                </div>
                <div className="stat-info">
                  <h3>{stats.totalAttempts}</h3>
                  <p>Total Attempts</p>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card glass-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
                  ⭐
                </div>
                <div className="stat-info">
                  <h3>{stats.averageScore}%</h3>
                  <p>Avg Score</p>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <motion.div 
                className="chart-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Quiz Performance</h3>
                <div className="chart-container">
                  <Bar data={quizPerformanceData} options={chartOptions} />
                </div>
              </motion.div>

              <motion.div 
                className="chart-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3>Quiz Status</h3>
                <div className="chart-container">
                  <Doughnut data={quizStatusData} options={{ ...chartOptions, scales: undefined }} />
                </div>
              </motion.div>
            </div>

            {/* Recent Quizzes */}
            <motion.div 
              className="recent-quizzes glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="section-header">
                <h3>Recent Quizzes</h3>
                <Link to="/teacher/create-quiz" className="btn btn-primary">
                  ➕ Create New
                </Link>
              </div>

              {quizzes.length === 0 ? (
                <div className="empty-state">
                  <p>No quizzes created yet. Start by creating your first quiz!</p>
                </div>
              ) : (
                <div className="quiz-list">
                  {quizzes.slice(0, 5).map((quiz, index) => (
                    <motion.div 
                      key={quiz.id}
                      className="quiz-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="quiz-info">
                        <h4>{quiz.title}</h4>
                        <p>{quiz.description?.substring(0, 60)}...</p>
                        <div className="quiz-meta">
                          <span className={`badge ${quiz.published ? 'badge-success' : 'badge-danger'}`}>
                            {quiz.published ? '✅ Published' : '❌ Unpublished'}
                          </span>
                          <span className="badge badge-info">
                            👥 {quiz.attemptCount || 0} attempts
                          </span>
                          <span className="badge badge-secondary">
                            📊 {quiz.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="quiz-actions">
                        <Link to={`/teacher/edit-quiz/${quiz.id}`} className="btn btn-secondary btn-sm">
                          ✏️ Edit
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
