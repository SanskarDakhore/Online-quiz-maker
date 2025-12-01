import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import './Certificate.css';

const Certificate = () => {
  const { resultId } = useParams();
  const { currentUser } = useAuth();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificateData();
  }, [resultId]);

  const fetchCertificateData = async () => {
    try {
      // Fetch result data
      const resultResponse = await apiService.getResult(resultId);
      if (!resultResponse) {
        throw new Error('Result not found');
      }
      
      const resultData = resultResponse.result;
      
      // Get current user data
      const currentUserResponse = await apiService.getCurrentUser();
      const userData = currentUserResponse.user;
      
      // Prepare certificate data
      setCertificateData({
        result: resultData,
        quiz: {
          title: resultData.quizTitle,
          category: 'General', // Default category since we don't have full quiz data
          difficulty: 'Medium' // Default difficulty since we don't have full quiz data
        },
        student: userData,
        issuedDate: new Date().toLocaleDateString(),
        certificateId: `CERT-${resultId.substring(0, 8).toUpperCase()}`
      });
    } catch (err) {
      console.error('Error fetching certificate data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="certificate-container flex-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificate-container flex-center">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="certificate-container flex-center">
        <div className="error-message">
          <h2>Certificate Data Not Found</h2>
          <p>Unable to generate certificate.</p>
        </div>
      </div>
    );
  }

  const { result, quiz, student } = certificateData;
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);

  // Determine certificate type based on score
  let certificateType = 'Participation';
  let certificateColor = '#6b7280'; // gray
  
  if (percentage >= 90) {
    certificateType = 'Outstanding Achievement';
    certificateColor = '#f59e0b'; // amber
  } else if (percentage >= 75) {
    certificateType = 'Excellent Performance';
    certificateColor = '#10b981'; // emerald
  } else if (percentage >= 60) {
    certificateType = 'Good Performance';
    certificateColor = '#3b82f6'; // blue
  }

  return (
    <div className="certificate-container">
      <motion.div 
        className="certificate"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Decorative header */}
        <div className="certificate-header">
          <div className="certificate-logo">🏆</div>
          <div className="certificate-title">
            <h1>Certificate of Achievement</h1>
            <p>Presented to</p>
          </div>
        </div>

        {/* Recipient name */}
        <div className="recipient-name" style={{ color: certificateColor }}>
          {student.name || student.email}
        </div>

        {/* Certificate content */}
        <div className="certificate-content">
          <p>This certifies that the above named individual has successfully completed</p>
          
          <div className="quiz-info">
            <h2>{quiz.title}</h2>
            <p className="quiz-category">{quiz.category} • {quiz.difficulty} Level</p>
          </div>
          
          <div className="performance-details">
            <div className="score-card">
              <div className="score-value">{percentage}%</div>
              <div className="score-label">Score</div>
            </div>
            
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Questions</span>
                <span className="detail-value">{result.correctAnswers}/{result.totalQuestions}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tab Switches</span>
                <span className="detail-value">{result.tabSwitches || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="certificate-type" style={{ borderColor: certificateColor, color: certificateColor }}>
            {certificateType}
          </div>
        </div>

        {/* Footer */}
        <div className="certificate-footer">
          <div className="issue-details">
            <p>Issued on: {certificateData.issuedDate}</p>
            <p>ID: {certificateData.certificateId}</p>
          </div>
          
          <div className="signature">
            <div className="signature-line"></div>
            <p>Authorized Signature</p>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="certificate-actions">
        <button onClick={downloadCertificate} className="btn btn-primary">
          🖨️ Download Certificate
        </button>
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-secondary"
        >
          ← Back to Results
        </button>
      </div>
    </div>
  );
};

export default Certificate;