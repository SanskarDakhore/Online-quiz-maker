import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import './StudentQuizzes.css';

const StudentQuizzes = () => {
  const { currentUser, logout } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quizzes, filterCategory, filterDifficulty, searchTerm]);

  const fetchQuizzes = async () => {
    try {
      const q = query(collection(db, 'quizzes'), where('published', '==', true));
      const querySnapshot = await getDocs(q);
      
      const quizzesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setQuizzes(quizzesData);
      setFilteredQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quizzes];

    if (filterCategory !== 'All') {
      filtered = filtered.filter(q => q.category === filterCategory);
    }

    if (filterDifficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuizzes(filtered);
  };

  const categories = ['All', ...new Set(quizzes.map(q => q.category))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="student-quizzes-container">
      <div className="student-header glass-card">
        <div>
          <h1>Available Quizzes 📚</h1>
          <p>Choose a quiz and test your knowledge</p>
        </div>
        <div className="header-actions">
          <Link to="/student/profile" className="btn btn-secondary">
            👤 Profile
          </Link>
          <button onClick={logout} className="btn btn-danger">
            🚪 Logout
          </button>
        </div>
      </div>

      <motion.div 
        className="filters-section glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          type="text"
          placeholder="🔍 Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty:</label>
            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.length === 0 ? (
            <div className="empty-state glass-card">
              <h3>No quizzes found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                className="quiz-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="quiz-card-header">
                  <h3>{quiz.title}</h3>
                  <span className={`difficulty-badge ${quiz.difficulty.toLowerCase()}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <p className="quiz-card-description">
                  {quiz.description?.substring(0, 100) || 'No description available'}
                  {quiz.description?.length > 100 && '...'}
                </p>

                <div className="quiz-card-meta">
                  <span>📂 {quiz.category}</span>
                  <span>❓ {quiz.questions?.length || 0} Questions</span>
                  <span>⏱️ {quiz.timer} min</span>
                </div>

                <Link to={`/student/quiz/${quiz.id}`} className="btn btn-primary btn-full">
                  Start Quiz →
                </Link>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
