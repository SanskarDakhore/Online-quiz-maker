import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../../bootstrap-theme.css';

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
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar-custom p-3">
            <div className="mb-4 text-center">
              <h3 className="gradient-text mb-1">QuizMaster</h3>
              <small className="text-muted">Teacher</small>
            </div>
            <nav className="nav flex-column">
              <div className="nav-link disabled text-white bg-primary rounded py-2 px-3 mb-1">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </div>
              <div className="nav-link disabled text-white rounded py-2 px-3 mb-1">
                <i className="bi bi-journal-text me-2"></i> My Quizzes
              </div>
              <div className="nav-link disabled text-white rounded py-2 px-3 mb-1">
                <i className="bi bi-plus-circle me-2"></i> Create Quiz
              </div>
            </nav>
            <button className="btn btn-danger w-100 mt-3" disabled>
              <i className="bi bi-door-open me-2"></i> Logout
            </button>
          </div>
          
          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-white">Loading dashboard...</p>
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
          <div className="col-md-3 col-lg-2 sidebar-custom p-3">
            <div className="mb-4 text-center">
              <h3 className="gradient-text mb-1">QuizMaster</h3>
              <small className="text-muted">Teacher</small>
            </div>
            <nav className="nav flex-column">
              <Link to="/teacher/dashboard" className="nav-link text-white active">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </Link>
              <Link to="/teacher/quizzes" className="nav-link text-white">
                <i className="bi bi-journal-text me-2"></i> My Quizzes
              </Link>
              <Link to="/teacher/create-quiz" className="nav-link text-white">
                <i className="bi bi-plus-circle me-2"></i> Create Quiz
              </Link>
            </nav>
            <button onClick={handleLogout} className="btn btn-danger w-100 mt-3">
              <i className="bi bi-door-open me-2"></i> Logout
            </button>
          </div>
          
          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            <div className="p-4">
              <div className="card card-glass mb-4">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="gradient-text mb-1">Teacher Dashboard <i className="bi bi-mortarboard"></i></h1>
                    <p className="mb-0">Welcome back, {userData?.name || 'Teacher'}!</p>
                  </div>
                  <button onClick={handleLogout} className="btn btn-danger">
                    <i className="bi bi-door-open me-1"></i> Logout
                  </button>
                </div>
              </div>
              
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <div className="card card-glass p-4">
                    <h3 className="text-center mb-3">Error Loading Dashboard</h3>
                    <p className="text-center text-muted">{error}</p>
                    <div className="text-center">
                      <button onClick={() => {
                        setError(null);
                        fetchUserData();
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
          <div className="mb-4 text-center" onClick={() => setLogoClickCount(prev => prev + 1)}>
            <h3 className="gradient-text mb-1">QuizMaster</h3>
            <small className="text-muted">Teacher</small>
            {showDancingIcon && (
              <div className="fs-1 mt-2">🎉</div>
            )}
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
          
          <button onClick={handleLogout} className="btn btn-danger w-100">
            <i className="bi bi-door-open me-2"></i> Logout
          </button>
        </div>
        
        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <div className="p-4">
            <div className="card card-glass mb-4">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="gradient-text mb-1">Teacher Dashboard <i className="bi bi-mortarboard"></i></h1>
                  <p className="mb-0">Welcome back, {userData?.name || 'Teacher'}!</p>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">
                  <i className="bi bi-door-open me-1"></i> Logout
                </button>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="row mb-4">
              <motion.div 
                className="col-md-3 mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">📝</div>
                    <h3 className="gradient-text mb-1">{stats.totalQuizzes}</h3>
                    <p className="text-muted mb-0">Total Quizzes</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="col-md-3 mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">✅</div>
                    <h3 className="gradient-text mb-1">{stats.publishedQuizzes}</h3>
                    <p className="text-muted mb-0">Published</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="col-md-3 mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">👥</div>
                    <h3 className="gradient-text mb-1">{stats.totalAttempts}</h3>
                    <p className="text-muted mb-0">Total Attempts</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="col-md-3 mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">⭐</div>
                    <h3 className="gradient-text mb-1">{stats.averageScore}%</h3>
                    <p className="text-muted mb-0">Average Score</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="row mb-4">
              <div className="col-md-8 mb-4 mb-md-0">
                <motion.div 
                  className="card card-glass h-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="card-body">
                    <h3 className="mb-4">Quiz Statistics</h3>
                    <div style={{ height: '300px' }}>
                      <Bar data={quizStatsData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="col-md-4">
                <motion.div 
                  className="card card-glass h-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="card-body">
                    <h3 className="mb-4">Performance</h3>
                    <div style={{ height: '300px' }}>
                      <Doughnut data={performanceData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Recent Quizzes */}
            <motion.div 
              className="card card-glass mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
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

            {/* Quick Actions */}
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <motion.div 
                  className="card card-glass h-100"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="card-body text-center">
                    <Link to="/teacher/create-quiz" className="text-decoration-none">
                      <div className="display-4 mb-2">➕</div>
                      <h4 className="gradient-text">Create Quiz</h4>
                      <p className="text-muted mb-0">Design a new quiz</p>
                    </Link>
                  </div>
                </motion.div>
              </div>

              <div className="col-md-6 mb-3">
                <motion.div 
                  className="card card-glass h-100"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="card-body text-center">
                    <Link to="/teacher/quizzes" className="text-decoration-none">
                      <div className="display-4 mb-2">📋</div>
                      <h4 className="gradient-text">Manage Quizzes</h4>
                      <p className="text-muted mb-0">Edit existing quizzes</p>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <motion.div 
              className="card card-glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
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
                        {quizzes.slice(0, 5).map((quiz, index) => (
                          <tr key={quiz.quizId}>
                            <td>{quiz.title}</td>
                            <td><span className="badge bg-info">{quiz.attemptCount || 0} attempts</span></td>
                            <td>{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td><span className="badge bg-primary">{quiz.averageScore !== undefined ? `${quiz.averageScore}%` : 'N/A'}</span></td>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;