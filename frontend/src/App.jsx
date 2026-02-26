import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';
import Login from './components/Login';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import QuizCreator from './components/Teacher/QuizCreator';
import TeacherQuizzes from './components/Teacher/TeacherQuizzes';
import TeacherQuizResults from './components/Teacher/TeacherQuizResults';
import StudentQuizzes from './components/Student/StudentQuizzes';
import QuizPlayer from './components/Student/QuizPlayer';
import QuizResult from './components/Student/QuizResult';
import ResultPending from './components/Student/ResultPending';
import Certificate from './components/Student/Certificate';
import StudentProfile from './components/Student/StudentProfile';
import DatabaseActivation from './components/DatabaseActivation';
import ThemeSwitcher from './components/ThemeSwitcher';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

const Home = () => {
  const { userRole, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser && userRole === null) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading your profile...</p>
      </div>
    );
  }

  if (userRole === 'teacher') {
    return <Navigate to="/teacher/dashboard" />;
  }

  if (userRole === 'student') {
    return <Navigate to="/student/quizzes" />;
  }

  return <Navigate to="/login" />;
};

const AppShell = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isSidebarRoute =
    location.pathname.startsWith('/teacher/dashboard') ||
    location.pathname.startsWith('/teacher/quizzes') ||
    location.pathname.startsWith('/teacher/create-quiz') ||
    location.pathname.startsWith('/teacher/edit-quiz') ||
    location.pathname.startsWith('/teacher/results') ||
    location.pathname.startsWith('/student/quizzes') ||
    location.pathname.startsWith('/student/profile');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const onSidebarToggle = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarMobileOpen((prev) => !prev);
      } else {
        setIsSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('quizmaster:sidebar-toggle', onSidebarToggle);
    return () => {
      window.removeEventListener('quizmaster:sidebar-toggle', onSidebarToggle);
    };
  }, []);

  useEffect(() => {
    setIsSidebarMobileOpen(false);
  }, [location.pathname]);

  const appClasses = [
    'app',
    isSidebarRoute && isSidebarCollapsed ? 'sidebar-collapsed' : '',
    isSidebarRoute && isSidebarMobileOpen ? 'sidebar-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const isSidebarOpenState = isSidebarMobileOpen || !isSidebarCollapsed;

  return (
    <div className={appClasses}>
      {!isAuthRoute && !isSidebarRoute && (
        <div className="app-toolbar">
          <div className="app-toolbar-inner card-glass">
            <div className="toolbar-left">
              <div className="toolbar-brand">
                <span className="toolbar-brand-mark">
                  <i className="bi bi-mortarboard-fill toolbar-brand-icon"></i>
                  <span className="toolbar-dot"></span>
                </span>
                <strong>QuizMaster</strong>
              </div>
            </div>
            <ThemeSwitcher single />
          </div>
        </div>
      )}
      <DatabaseActivation />
      <div className="app-view">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/quizzes"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/create-quiz"
            element={
              <ProtectedRoute requiredRole="teacher">
                <QuizCreator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/edit-quiz/:quizId"
            element={
              <ProtectedRoute requiredRole="teacher">
                <QuizCreator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/results/:quizId"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherQuizResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/quizzes"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz/:quizId"
            element={
              <ProtectedRoute requiredRole="student">
                <QuizPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/result/:resultId"
            element={
              <ProtectedRoute requiredRole="student">
                <QuizResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/result-pending/:resultId"
            element={
              <ProtectedRoute requiredRole="student">
                <ResultPending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificate/:resultId"
            element={
              <ProtectedRoute requiredRole="student">
                <Certificate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {isSidebarRoute && (
        <div className="sidebar-inside-controls">
          <button
            type="button"
            className="sidebar-corner-toggle"
            aria-label="Toggle sidebar"
            onClick={() => window.dispatchEvent(new Event('quizmaster:sidebar-toggle'))}
          >
            <i className={`bi ${isSidebarOpenState ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
          <ThemeSwitcher single />
        </div>
      )}

      {isSidebarRoute && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarMobileOpen(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

