import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';

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
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-white">Generating certificate...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="card card-glass p-4 text-center">
            <h2 className="gradient-text mb-3">Error</h2>
            <p className="text-muted mb-4">{error}</p>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-gradient"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="card card-glass p-4 text-center">
            <h2 className="gradient-text mb-3">Certificate Data Not Found</h2>
            <p className="text-muted mb-4">Unable to generate certificate.</p>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-gradient"
            >
              ← Back
            </button>
          </div>
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
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div 
              className="card card-glass border-0 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="fs-1 mb-3">🏆</div>
                  <h1 className="gradient-text mb-2">Certificate of Achievement</h1>
                  <p className="text-muted mb-4">Presented to</p>
                </div>
                
                <div className="text-center mb-4" style={{ color: certificateColor }}>
                  <h2 className="display-5 fw-bold">{student.name || student.email}</h2>
                </div>
                
                <div className="text-center mb-4">
                  <p className="lead">This certifies that the above named individual has successfully completed</p>
                  
                  <div className="mb-4">
                    <h3 className="h2 mb-2">{quiz.title}</h3>
                    <p className="text-muted">{quiz.category} • {quiz.difficulty} Level</p>
                  </div>
                  
                  <div className="row justify-content-center mb-4">
                    <div className="col-md-4 mb-3">
                      <div className="card border-0 bg-transparent">
                        <div className="card-body text-center">
                          <div className="display-4 fw-bold" style={{ color: certificateColor }}>{percentage}%</div>
                          <div className="text-muted">Score</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-8">
                      <div className="row">
                        <div className="col-6">
                          <div className="card border-0 bg-transparent">
                            <div className="card-body text-center">
                              <div className="h4 fw-bold">{result.correctAnswers}/{result.totalQuestions}</div>
                              <div className="text-muted">Questions</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card border-0 bg-transparent">
                            <div className="card-body text-center">
                              <div className="h4 fw-bold">{result.tabSwitches || 0}</div>
                              <div className="text-muted">Tab Switches</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-3 mb-4" style={{ borderColor: certificateColor, color: certificateColor }}>
                    <h4 className="mb-0">{certificateType}</h4>
                  </div>
                </div>
                
                <div className="row justify-content-between align-items-center mt-5 pt-4 border-top border-secondary">
                  <div className="col-md-6">
                    <div className="text-muted">
                      <p className="mb-1">Issued on: {certificateData.issuedDate}</p>
                      <p className="mb-0">ID: {certificateData.certificateId}</p>
                    </div>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <div>
                      <div className="border-bottom border-secondary mb-2" style={{ width: '200px', marginLeft: 'auto' }}></div>
                      <p className="mb-0 text-muted">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button onClick={downloadCertificate} className="btn btn-gradient">
                <i className="bi bi-download me-2"></i>Download Certificate
              </button>
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-outline-light"
              >
                <i className="bi bi-arrow-left me-2"></i>Back to Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;