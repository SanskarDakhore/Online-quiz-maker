import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
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
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      // Fetch quiz results
      const q = query(collection(db, 'results'), where('studentId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const resultsData = [];
      let totalScore = 0;
      let perfectCount = 0;

      for (const doc of querySnapshot.docs) {
        const result = { id: doc.id, ...doc.data() };
        
        // Fetch quiz title
        const quizDoc = await getDoc(doc.ref.parent.parent.collection('quizzes').doc(result.quizId));
        if (quizDoc.exists()) {
          result.quizTitle = quizDoc.data().title;
        }
        
        resultsData.push(result);
        totalScore += result.score;
        if (result.score === 100) perfectCount++;
      }

      resultsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setResults(resultsData);

      setStats({
        totalAttempts: resultsData.length,
        averageScore: resultsData.length > 0 ? Math.round(totalScore / resultsData.length) : 0,
        perfectScores: perfectCount,
        badges: userDoc.data()?.badges || []
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
        <h2>📊 Recent Attempts</h2>
        
        {results.length === 0 ? (
          <div className="empty-state">
            <p>No quiz attempts yet. Start taking quizzes to see your progress!</p>
            <Link to="/student/quizzes" className="btn btn-primary mt-2">
              Browse Quizzes
            </Link>
          </div>
        ) : (
          <div className="attempts-list">
            {results.map((result, index) => (
              <motion.div 
                key={result.id}
                className="attempt-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="attempt-info">
                  <h4>{result.quizTitle || 'Unknown Quiz'}</h4>
                  <p className="attempt-date">
                    {new Date(result.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="attempt-score">
                  <div 
                    className="score-badge"
                    style={{
                      background: result.score >= 80 
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : result.score >= 60
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)'
                    }}
                  >
                    {Math.round(result.score)}%
                  </div>
                  <span className="score-text">
                    {result.correctAnswers} / {result.totalQuestions} correct
                  </span>
                </div>
                <Link to={`/student/result/${result.id}`} className="btn btn-secondary btn-sm">
                  View Details →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentProfile;
