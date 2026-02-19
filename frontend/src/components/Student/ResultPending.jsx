import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../bootstrap-theme.css';

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
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <motion.div 
          className="card card-glass text-center p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '600px', width: '100%' }}
        >
          <div className="fs-1 mb-4">⏳</div>
          <h1 className="gradient-text mb-4">Results Pending</h1>
          
          <div className="mb-4">
            <p className="lead">Your quiz has been submitted successfully!</p>
            <p className="text-muted mb-4">{releaseMessage}</p>
            
            {resultReleaseMode === 'specificDate' && timeUntilRelease && (
              <div className="card bg-transparent border-0 mb-4">
                <h3 className="mb-3">Time Until Release:</h3>
                <div className="display-4 gradient-text">{timeUntilRelease}</div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/student/quizzes')} 
            className="btn btn-gradient"
          >
            <i className="bi bi-arrow-left me-2"></i>Back to Quizzes
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultPending;