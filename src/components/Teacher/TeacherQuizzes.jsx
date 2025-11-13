import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import './TeacherQuizzes.css';

const TeacherQuizzes = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, unpublished

  useEffect(() => {
    fetchQuizzes();
  }, [currentUser]);

  const fetchQuizzes = async () => {
    try {
      const q = query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const quizzesData = [];
      for (const docSnapshot of querySnapshot.docs) {
        const quizData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Get attempt count
        const resultsQuery = query(collection(db, 'results'), where('quizId', '==', docSnapshot.id));
        const resultsSnapshot = await getDocs(resultsQuery);
        quizData.attemptCount = resultsSnapshot.size;
        
        quizzesData.push(quizData);
      }

      quizzesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (quizId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        published: !currentStatus
      });
      
      setQuizzes(quizzes.map(q => 
        q.id === quizId ? { ...q, published: !currentStatus } : q
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update quiz status');
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      alert('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'published') return q.published;
    if (filter === 'unpublished') return !q.published;
    return true;
  });

  return (
    <div className="teacher-quizzes-container">
      <div className="quizzes-header glass-card">
        <div>
          <h1>My Quizzes 📝</h1>
          <p>Manage all your created quizzes</p>
        </div>
        <div className="header-actions">
          <Link to="/teacher/dashboard" className="btn btn-secondary">
            📊 Dashboard
          </Link>
          <Link to="/teacher/create-quiz" className="btn btn-primary">
            ➕ Create New Quiz
          </Link>
          <button onClick={logout} className="btn btn-danger">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <motion.div 
        className="filters-bar glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({quizzes.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Published ({quizzes.filter(q => q.published).length})
          </button>
          <button 
            className={`filter-tab ${filter === 'unpublished' ? 'active' : ''}`}
            onClick={() => setFilter('unpublished')}
          >
            Unpublished ({quizzes.filter(q => !q.published).length})
          </button>
        </div>
      </motion.div>

      {/* Quizzes List */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <motion.div 
          className="empty-state glass-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3>No quizzes found</h3>
          <p>{filter === 'all' ? 'Create your first quiz to get started!' : `No ${filter} quizzes yet.`}</p>
          <Link to="/teacher/create-quiz" className="btn btn-primary mt-2">
            ➕ Create Quiz
          </Link>
        </motion.div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              className="quiz-management-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="quiz-card-header">
                <div className="quiz-card-title">
                  <h3>{quiz.title}</h3>
                  <span className={`status-badge ${quiz.published ? 'published' : 'unpublished'}`}>
                    {quiz.published ? '✅ Published' : '❌ Unpublished'}
                  </span>
                </div>
              </div>

              <p className="quiz-description">
                {quiz.description?.substring(0, 100) || 'No description'}
                {quiz.description?.length > 100 && '...'}
              </p>

              <div className="quiz-meta-info">
                <div className="meta-item">
                  <span className="meta-icon">📂</span>
                  <span>{quiz.category}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📊</span>
                  <span>{quiz.difficulty}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">❓</span>
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span>{quiz.timer} min</span>
                </div>
              </div>

              <div className="quiz-stats">
                <div className="stat-item">
                  <span className="stat-value">{quiz.attemptCount || 0}</span>
                  <span className="stat-label">Attempts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(quiz.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="stat-label">Created</span>
                </div>
              </div>

              <div className="quiz-actions">
                <Link 
                  to={`/teacher/edit-quiz/${quiz.id}`} 
                  className="btn btn-secondary btn-sm"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => togglePublish(quiz.id, quiz.published)}
                  className={`btn btn-sm ${quiz.published ? 'btn-warning' : 'btn-success'}`}
                >
                  {quiz.published ? '📤 Unpublish' : '📥 Publish'}
                </button>
                <button
                  onClick={() => deleteQuiz(quiz.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
