import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import '../../bootstrap-theme.css';

const TeacherQuizResults = () => {
  const { quizId } = useParams();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getQuizResults(quizId);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      role="teacher"
      currentPath={location.pathname}
      onLogout={handleLogout}
      title="Quiz Results"
      subtitle="Review student performance for this quiz"
      iconClass="bi-bar-chart-line"
      headerRight={
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/teacher/quizzes')}>
            Back
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            <i className="bi bi-door-open me-1"></i> Logout
          </button>
        </div>
      }
      loading={loading}
      loadingText="Loading results..."
      error={error}
      onRetry={fetchResults}
    >
      <div className="card card-glass">
        <div className="card-body">
          {results.length === 0 ? (
            <p className="mb-0">No attempts yet for this quiz.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-transparent">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Correct</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.resultId}>
                      <td>{result.studentName || 'Unknown'}</td>
                      <td>{result.studentEmail || '-'}</td>
                      <td>{result.score}%</td>
                      <td>{result.correctAnswers}/{result.totalQuestions}</td>
                      <td>{new Date(result.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <Link to="/teacher/quizzes" className="btn btn-gradient">Back to My Quizzes</Link>
      </div>
    </DashboardLayout>
  );
};

export default TeacherQuizResults;
