import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import './StudentProfile.css';

const StudentProfile = () => {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    perfectScores: 0,
    badges: []
  });
  const [loading, setLoading] = useState(true);

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
      const resultsData = resultsResponse.results || [];
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
      <div className="student-profile-container flex-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <div className="profile-header glass-card">
        <div className="profile-info">
          <div className="avatar">{userData?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h1>{userData?.name}</h1>
            <p>{userData?.email}</p>
          </div>
        </div>
        <div className="header-actions">
          <Link to="/student/quizzes" className="btn btn-primary">
            📚 Browse Quizzes
          </Link>
          <button onClick={logout} className="btn btn-danger">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <motion.div 
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            📝
          </div>
          <div className="stat-info">
            <h3>{stats.totalAttempts}</h3>
            <p>Quizzes Attempted</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            ⭐
          </div>
          <div className="stat-info">
            <h3>{stats.averageScore}%</h3>
            <p>Average Score</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            💯
          </div>
          <div className="stat-info">
            <h3>{stats.perfectScores}</h3>
            <p>Perfect Scores</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
            🏅
          </div>
          <div className="stat-info">
            <h3>{stats.badges.length}</h3>
            <p>Badges Earned</p>
          </div>
        </motion.div>
      </div>

      {/* Badges Section */}
      {stats.badges.length > 0 && (
        <motion.div 
          className="badges-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>🏆 Your Badges</h2>
          <div className="badges-grid">
            {stats.badges.map((badge, index) => (
              <motion.div 
                key={index}
                className="badge-item"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="badge-icon">{getBadgeIcon(badge)}</div>
                <div className="badge-name">{badge}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Attempts */}
      <motion.div 
        className="recent-attempts glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Recent Attempts</h2>
        {results.length > 0 ? (
          <div className="attempts-list">
            {results.slice(0, 5).map((result) => (
              <motion.div 
                key={result._id}
                className="attempt-item"
                whileHover={{ x: 5 }}
              >
                <div className="attempt-info">
                  <h3>{result.quizTitle || 'Untitled Quiz'}</h3>
                  <p>Score: <strong>{result.score}%</strong></p>
                  <p className="timestamp">
                    {new Date(result.timestamp).toLocaleDateString()} at 
                    {' '}{new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className={`score-badge ${result.score >= 80 ? 'high' : result.score >= 60 ? 'medium' : 'low'}`}>
                  {result.score}%
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="no-attempts">No quiz attempts yet. Start taking quizzes to see your progress!</p>
        )}
        {results.length > 5 && (
          <Link to="/student/results" className="view-all-link">
            View All Results ({results.length})
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default StudentProfile;