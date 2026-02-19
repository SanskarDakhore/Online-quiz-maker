import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

const StudentProfile = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    perfectScores: 0,
    badges: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [currentUser]);

  const fetchProfileData = async () => {
    try {
      // Fetch user data and results in parallel
      const [userDataResponse, resultsResponse] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getMyResults()
      ]);

      setUserData(userDataResponse.user);

      // Process results data
      const resultsData = Array.isArray(resultsResponse) ? resultsResponse : [];
      let totalScore = 0;
      let perfectCount = 0;

      resultsData.forEach(result => {
        totalScore += result.score;
        if (result.score === 100) perfectCount++;
      });

      // Sort results by timestamp (newest first)
      resultsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setResults(resultsData);

      setStats({
        totalAttempts: resultsData.length,
        averageScore: resultsData.length > 0 ? Math.round(totalScore / resultsData.length) : 0,
        perfectScores: perfectCount,
        badges: userDataResponse.user?.badges || []
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge) => {
    const badges = {
      'Quiz Rookie': '🎯',
      'Fast Solver': '⚡',
      'Perfect Score': '💯',
      'Top Ranker': '🏆',
      'Quiz Master': '👑',
      'Night Owl': '🦉',
      'Early Bird': '🐦',
      'Streak Master': '🔥'
    };
    return badges[badge] || '🏅';
  };

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
                    <h1 className="gradient-text mb-1">Student Profile <i className="bi bi-person"></i></h1>
                    <p className="mb-0">Loading your profile data</p>
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
                  <p className="mt-2 text-white">Loading profile...</p>
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
                    <h1 className="gradient-text mb-1">Student Profile <i className="bi bi-person"></i></h1>
                    <p className="mb-0">Your profile information</p>
                  </div>
                  <button onClick={logout} className="btn btn-danger">
                    <i className="bi bi-door-open me-1"></i> Logout
                  </button>
                </div>
              </div>
              
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <div className="card card-glass p-4">
                    <h3 className="text-center mb-3">Error Loading Profile</h3>
                    <p className="text-center text-muted">{error}</p>
                    <div className="text-center">
                      <button onClick={() => {
                        setError(null);
                        fetchProfileData();
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
                  <h1 className="gradient-text mb-1">Student Profile <i className="bi bi-person"></i></h1>
                  <p className="mb-0">Your profile information</p>
                </div>
                <button onClick={logout} className="btn btn-danger">
                  <i className="bi bi-door-open me-1"></i> Logout
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
              <motion.div 
                className="col-md-3 mb-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">📝</div>
                    <h3 className="gradient-text mb-1">{stats.totalAttempts}</h3>
                    <p className="text-muted mb-0">Quizzes Attempted</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="col-md-3 mb-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">⭐</div>
                    <h3 className="gradient-text mb-1">{stats.averageScore}%</h3>
                    <p className="text-muted mb-0">Average Score</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="col-md-3 mb-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">💯</div>
                    <h3 className="gradient-text mb-1">{stats.perfectScores}</h3>
                    <p className="text-muted mb-0">Perfect Scores</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="col-md-3 mb-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="card card-glass h-100">
                  <div className="card-body text-center">
                    <div className="display-4 mb-2">🏅</div>
                    <h3 className="gradient-text mb-1">{stats.badges.length}</h3>
                    <p className="text-muted mb-0">Badges Earned</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Badges Section */}
            {stats.badges.length > 0 && (
              <motion.div 
                className="card card-glass mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="card-header">
                  <h3 className="mb-0">🏆 Your Badges</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    {stats.badges.map((badge, index) => (
                      <motion.div 
                        key={index}
                        className="col-md-2 col-sm-3 col-4 text-center mb-3"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <div className="fs-2">{getBadgeIcon(badge)}</div>
                        <div className="small text-truncate" title={badge}>{badge}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent Attempts */}
            <motion.div 
              className="card card-glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-header">
                <h3 className="mb-0">Recent Attempts</h3>
              </div>
              <div className="card-body">
                {results.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-transparent">
                      <thead>
                        <tr>
                          <th>Quiz Title</th>
                          <th>Score</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Certificate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.slice(0, 5).map((result) => (
                          <tr key={result.resultId}>
                            <td>{result.quizTitle || 'Untitled Quiz'}</td>
                            <td>
                              <span className={`badge ${result.score >= 80 ? 'bg-success' : result.score >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                {result.score}%
                              </span>
                            </td>
                            <td>{new Date(result.timestamp).toLocaleDateString()}</td>
                            <td>{new Date(result.timestamp).toLocaleTimeString()}</td>
                            <td>
                              <Link
                                to={`/student/certificate/${result.resultId}`}
                                className="btn btn-sm btn-outline-success"
                              >
                                <i className="bi bi-award me-1"></i>Download
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted py-3 mb-0">No quiz attempts yet. Start taking quizzes to see your progress!</p>
                )}
                {results.length > 5 && <div className="text-center mt-3 text-muted">Showing latest 5 results</div>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
