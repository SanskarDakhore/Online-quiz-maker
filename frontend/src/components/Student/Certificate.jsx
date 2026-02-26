import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import '../../bootstrap-theme.css';
import './Certificate.css';

const Certificate = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const MARKS_PER_CORRECT = 4;
  const MARKS_PER_INCORRECT = -3;
  const HINT_DEDUCTION = 2;
  const clampPercentage = (value) => Math.min(100, Math.max(0, Math.round(value)));

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        setError('');

        const [resultResponse, currentUserResponse] = await Promise.all([
          apiService.getResult(resultId),
          apiService.getCurrentUser()
        ]);

        if (!resultResponse) {
          throw new Error('Result not found');
        }

        const userData = currentUserResponse?.user || currentUserResponse;

        let quizData = null;
        try {
          quizData = await apiService.getQuiz(resultResponse.quizId);
        } catch (quizError) {
          console.warn('Quiz details not available for certificate:', quizError?.message || quizError);
        }

        setResult(resultResponse);
        setStudent(userData || null);
        setQuiz(quizData || null);
      } catch (err) {
        console.error('Error generating certificate:', err);
        setError(err.message || 'Unable to generate certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [resultId]);

  const formatDate = (dateValue) => {
    const date = dateValue ? new Date(dateValue) : new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const certificateDetails = useMemo(() => {
    if (!result) return null;

    const totalQuestions = Number.isFinite(result.totalQuestions) ? result.totalQuestions : 0;
    const correctAnswers = Number.isFinite(result.correctAnswers) ? result.correctAnswers : 0;
    const attemptedAnswers = Array.isArray(result.answers)
      ? result.answers.filter((answer) => Number.isInteger(answer)).length
      : 0;

    const skippedAnswers = Math.max(0, totalQuestions - attemptedAnswers);
    const incorrectAnswers = Math.max(0, attemptedAnswers - correctAnswers);
    const hintsUsed = Number.isFinite(result.hintsUsed) ? result.hintsUsed : 0;
    const totalMarks = Number.isFinite(result.totalMarks) ? result.totalMarks : totalQuestions * MARKS_PER_CORRECT;
    const baseMarks = Number.isFinite(result.baseMarks)
      ? result.baseMarks
      : (correctAnswers * MARKS_PER_CORRECT) + (incorrectAnswers * MARKS_PER_INCORRECT);
    const pointsDeductedForHints = Number.isFinite(result.pointsDeductedForHints) ? result.pointsDeductedForHints : hintsUsed * HINT_DEDUCTION;
    const obtainedMarks = Number.isFinite(result.obtainedMarks) ? result.obtainedMarks : baseMarks - pointsDeductedForHints;
    const accuracy = Number.isFinite(result.accuracy)
      ? Math.round(result.accuracy)
      : clampPercentage(totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0);
    const finalScore = Number.isFinite(result.score) ? Math.round(result.score) : accuracy;
    const baseScore = Number.isFinite(result.baseScore)
      ? Math.round(result.baseScore)
      : clampPercentage(totalMarks > 0 ? (baseMarks / totalMarks) * 100 : 0);

    let distinction = 'Certificate of Completion';
    let distinctionTone = 'completion';

    if (finalScore >= 95) {
      distinction = 'Distinction with Honors';
      distinctionTone = 'honors';
    } else if (finalScore >= 85) {
      distinction = 'Excellence Award';
      distinctionTone = 'excellence';
    } else if (finalScore >= 70) {
      distinction = 'Merit Performance';
      distinctionTone = 'merit';
    }

    return {
      totalQuestions,
      correctAnswers,
      attemptedAnswers,
      skippedAnswers,
      incorrectAnswers,
      accuracy,
      finalScore,
      baseScore,
      totalMarks,
      baseMarks,
      obtainedMarks,
      distinction,
      distinctionTone,
      hintsUsed,
      tabSwitchCount: Number.isFinite(result.tabSwitchCount) ? result.tabSwitchCount : 0,
      timeTaken: formatDuration(result.timeTaken),
      autoSubmitted: !!result.autoSubmitted,
      autoSubmitReason: result.autoSubmitReason || '',
      pointsDeductedForHints
    };
  }, [result]);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-white">Preparing certificate...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result || !certificateDetails) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="card card-glass p-4 text-center">
            <h2 className="gradient-text mb-3">Certificate Unavailable</h2>
            <p className="text-muted mb-4">{error || 'Unable to generate certificate.'}</p>
            <button onClick={() => navigate(-1)} className="btn btn-gradient">
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quizTitle = result.quizTitle || quiz?.title || 'Untitled Quiz';
  const studentName = student?.name || student?.email || 'Student';
  const quizCategory = quiz?.category || 'General';
  const quizDifficulty = quiz?.difficulty || 'Standard';
  const certificateId = `CERT-${String(resultId || '').replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const issuedDate = formatDate();
  const completedDate = formatDate(result.timestamp);

  return (
    <div className="certificate-page">
      <div className="container py-4 certificate-screen-controls">
        <div className="d-flex justify-content-center gap-3">
          <button type="button" onClick={() => window.print()} className="btn btn-gradient">
            <i className="bi bi-printer me-2"></i>Print / Save PDF
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-light">
            <i className="bi bi-arrow-left me-2"></i>Back to Results
          </button>
        </div>
      </div>

      <div className="container pb-5">
        <motion.section
          className="certificate-sheet"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="certificate-accent-top"></div>
          <div className="certificate-watermark">QUIZMASTER</div>

          <header className="certificate-head">
            <div className="certificate-brand">QuizMaster Learning Platform</div>
            <h1 className="certificate-title">Certificate of Achievement</h1>
            <p className="certificate-subtitle">This certifies successful completion of the assessed quiz.</p>
          </header>

          <section className="certificate-recipient">
            <p className="recipient-label">Awarded to</p>
            <h2 className="recipient-name">{studentName}</h2>
            <p className="recipient-description">
              for successfully completing <strong>{quizTitle}</strong> with a final score of
              <strong> {certificateDetails.finalScore}%</strong>.
            </p>
          </section>

          <section className="certificate-distinction-wrap">
            <span className={`certificate-distinction tone-${certificateDetails.distinctionTone}`}>
              {certificateDetails.distinction}
            </span>
          </section>

          <section className="certificate-metrics">
            <article className="metric-card">
              <span className="metric-label">Obtained Marks</span>
              <strong className="metric-value">{certificateDetails.obtainedMarks}/{certificateDetails.totalMarks}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Accuracy</span>
              <strong className="metric-value">{certificateDetails.accuracy}%</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Correct Answers</span>
              <strong className="metric-value">{certificateDetails.correctAnswers}/{certificateDetails.totalQuestions}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Attempted</span>
              <strong className="metric-value">{certificateDetails.attemptedAnswers}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Time Taken</span>
              <strong className="metric-value">{certificateDetails.timeTaken}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Hints Used</span>
              <strong className="metric-value">{certificateDetails.hintsUsed}</strong>
            </article>
          </section>

          <section className="certificate-details-grid">
            <div>
              <div className="detail-row"><span>Quiz Category</span><strong>{quizCategory}</strong></div>
              <div className="detail-row"><span>Difficulty</span><strong>{quizDifficulty}</strong></div>
              <div className="detail-row"><span>Completion Date</span><strong>{completedDate}</strong></div>
              <div className="detail-row"><span>Issue Date</span><strong>{issuedDate}</strong></div>
            </div>
            <div>
              <div className="detail-row"><span>Base Marks</span><strong>{certificateDetails.baseMarks}</strong></div>
              <div className="detail-row"><span>Incorrect</span><strong>{certificateDetails.incorrectAnswers}</strong></div>
              <div className="detail-row"><span>Skipped</span><strong>{certificateDetails.skippedAnswers}</strong></div>
              <div className="detail-row"><span>Tab Switches</span><strong>{certificateDetails.tabSwitchCount}</strong></div>
            </div>
          </section>

          <section className="certificate-integrity">
            <p className="mb-1"><strong>Integrity Notes:</strong></p>
            <p className="mb-0">
              {certificateDetails.autoSubmitted
                ? `Attempt was auto-submitted (${certificateDetails.autoSubmitReason || 'system policy'}).`
                : 'Attempt was submitted normally by the student.'}
              {certificateDetails.pointsDeductedForHints > 0
                ? ` Score adjusted by ${certificateDetails.pointsDeductedForHints} marks due to hint usage.`
                : ''}
            </p>
          </section>

          <footer className="certificate-footer">
            <div>
              <p className="mb-1"><strong>Certificate ID:</strong> {certificateId}</p>
              <p className="mb-0 text-muted">Keep this ID for verification and records.</p>
            </div>
            <div className="signature-block">
              <div className="signature-line"></div>
              <p className="mb-0">Authorized Signature</p>
            </div>
          </footer>
        </motion.section>
      </div>
    </div>
  );
};

export default Certificate;
