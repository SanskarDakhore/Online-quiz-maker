import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import '../../bootstrap-theme.css';

const BADGE_ICON_CLASS = {
  'Quiz Rookie': 'bi-bullseye',
  'Fast Solver': 'bi-lightning-charge-fill',
  'Perfect Score': 'bi-stars',
  'Top Ranker': 'bi-trophy-fill',
  'Quiz Master': 'bi-patch-check-fill',
  'Night Owl': 'bi-moon-stars-fill',
  'Early Bird': 'bi-sunrise-fill',
  'Streak Master': 'bi-fire',
};

const StudentProfile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    perfectScores: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, [currentUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userDataResponse, resultsResponse] = await Promise.all([apiService.getCurrentUser(), apiService.getMyResults()]);
      const safeResults = Array.isArray(resultsResponse) ? resultsResponse : [];
      safeResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const totalScore = safeResults.reduce((sum, result) => sum + result.score, 0);
      const perfectScores = safeResults.filter((result) => result.score === 100).length;

      setUserData(userDataResponse.user);
      setResults(safeResults);
      setStats({
        totalAttempts: safeResults.length,
        averageScore: safeResults.length > 0 ? Math.round(totalScore / safeResults.length) : 0,
        perfectScores,
        badges: userDataResponse.user?.badges || [],
      });
    } catch (err) {
      setError(`Failed to load profile data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderBadgeIcon = (badge) => <i className={`bi ${BADGE_ICON_CLASS[badge] || 'bi-award-fill'}`}></i>;

  return (
    <DashboardLayout
      role="student"
      currentPath={location.pathname}
      onLogout={handleLogout}
      title="Student Profile"
      subtitle={userData?.name ? `Welcome, ${userData.name}` : 'Your profile information'}
      iconClass="bi-person"
      headerRight={
        <button onClick={handleLogout} className="btn btn-danger">
          <i className="bi bi-door-open me-1"></i> Logout
        </button>
      }
      loading={loading}
      loadingText="Loading profile..."
      error={error}
      onRetry={fetchProfileData}
    >
      <div className="row mb-4">
        <motion.div className="col-md-3 mb-3" whileHover={{ scale: 1.03 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-journal-check"></i></div>
              <h3 className="gradient-text mb-1">{stats.totalAttempts}</h3>
              <p className="text-muted mb-0">Quizzes Attempted</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="col-md-3 mb-3" whileHover={{ scale: 1.03 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-bar-chart-line-fill"></i></div>
              <h3 className="gradient-text mb-1">{stats.averageScore}%</h3>
              <p className="text-muted mb-0">Average Score</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="col-md-3 mb-3" whileHover={{ scale: 1.03 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-check2-all"></i></div>
              <h3 className="gradient-text mb-1">{stats.perfectScores}</h3>
              <p className="text-muted mb-0">Perfect Scores</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="col-md-3 mb-3" whileHover={{ scale: 1.03 }}>
          <div className="card card-glass h-100">
            <div className="card-body text-center">
              <div className="display-5 mb-2"><i className="bi bi-award"></i></div>
              <h3 className="gradient-text mb-1">{stats.badges.length}</h3>
              <p className="text-muted mb-0">Badges Earned</p>
            </div>
          </div>
        </motion.div>
      </div>

      {stats.badges.length > 0 && (
        <motion.div className="card card-glass mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-header">
            <h3 className="mb-0"><i className="bi bi-trophy me-2"></i>Your Badges</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {stats.badges.map((badge, index) => (
                <motion.div
                  key={badge + index}
                  className="col-md-2 col-sm-3 col-4 text-center mb-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.08 }}
                >
                  <div className="fs-2">{renderBadgeIcon(badge)}</div>
                  <div className="small text-truncate" title={badge}>{badge}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div className="card card-glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
                        <Link to={`/student/certificate/${result.resultId}`} className="btn btn-sm btn-outline-success">
                          <i className="bi bi-award me-1"></i>Download
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted py-3 mb-0">No quiz attempts yet. Start taking quizzes to see your progress.</p>
          )}
          {results.length > 5 && <div className="text-center mt-3 text-muted">Showing latest 5 results</div>}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default StudentProfile;
