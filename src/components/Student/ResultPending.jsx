import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ResultPending.css';

const ResultPending = () => {
  const { resultId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { resultReleaseMode, resultReleaseDate } = location.state || {};
  const [timeUntilRelease, setTimeUntilRelease] = useState('');
  const [releaseMessage, setReleaseMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(updateTimeUntilRelease, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateTimeUntilRelease = () => {
    if (resultReleaseMode === 'specificDate' && resultReleaseDate) {
      const releaseDate = new Date(resultReleaseDate);
      const now = new Date();
      const diff = releaseDate - now;

      if (diff <= 0) {
        // Release date has passed, redirect to actual results
        navigate(`/student/result/${resultId}`);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0) timeString += `${hours}h `;
      if (minutes > 0) timeString += `${minutes}m `;
      timeString += `${seconds}s`;

      setTimeUntilRelease(timeString);
      
      switch (resultReleaseMode) {
        case 'afterAll':
          setReleaseMessage('Results will be released after all students complete this quiz.');
          break;
        case 'specificDate':
          setReleaseMessage(`Results will be released on ${releaseDate.toLocaleDateString()} at ${releaseDate.toLocaleTimeString()}.`);
          break;
        default:
          setReleaseMessage('Results will be released soon.');
      }
    } else if (resultReleaseMode === 'afterAll') {
      setReleaseMessage('Results will be released after all students complete this quiz.');
    } else {
      // Should not happen, but redirect to results if somehow here
      navigate(`/student/result/${resultId}`);
    }
  };

  return (
    <div className="result-pending-container">
      <motion.div 
        className="pending-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pending-icon">⏳</div>
        <h1>Results Pending</h1>
        
        <div className="pending-message">
          <p>Your quiz has been submitted successfully!</p>
          <p className="release-message">{releaseMessage}</p>
          
          {resultReleaseMode === 'specificDate' && timeUntilRelease && (
            <div className="countdown">
              <h3>Time Until Release:</h3>
              <div className="countdown-display">{timeUntilRelease}</div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => navigate('/student/quizzes')} 
          className="btn btn-secondary"
        >
          ← Back to Quizzes
        </button>
      </motion.div>
    </div>
  );
};

export default ResultPending;