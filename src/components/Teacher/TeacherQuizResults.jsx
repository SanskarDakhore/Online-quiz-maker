import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

const TeacherQuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getQuizResults(quizId);
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  if (loading) return <div className="container py-5 text-center">Loading results...</div>;
  if (error) return <div className="container py-5 text-center text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Quiz Results</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/teacher/quizzes')}>Back</button>
      </div>

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
    </div>
  );
};

export default TeacherQuizResults;
