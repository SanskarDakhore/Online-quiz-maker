import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Home redirect component
const Home = () => {
  const { userRole, currentUser, loading } = useAuth();
  
  // Debug logging
  console.log('Home component - currentUser:', currentUser);
  console.log('Home component - userRole:', userRole);
  console.log('Home component - loading:', loading);
  
  // Additional debug info
  console.log('Home component - localStorage token:', localStorage.getItem('token'));
  console.log('Home component - localStorage current_user:', localStorage.getItem('current_user'));
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }
  
  // If no user, redirect to login
  if (!currentUser) {
    console.log('Home: No user, redirecting to /login');
    return <Navigate to="/login" />;
  }
  
  // If user exists but role not loaded yet, show loading
  // Give it a bit more time to load the role
  if (currentUser && userRole === null) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading your profile...</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
          Please wait while we verify your account
        </p>
      </div>
    );
  }
  
  // Redirect based on user role
  if (userRole === 'teacher') {
    console.log('Home: Redirecting teacher to /teacher/dashboard');
    return <Navigate to="/teacher/dashboard" />;
  } else if (userRole === 'student') {
    console.log('Home: Redirecting student to /student/quizzes');
    return <Navigate to="/student/quizzes" />;
  }
  
  // Default redirect to login
  console.log('Home: Default redirect to /login');
  return <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="app">
            <ThemeSwitcher />
            <DatabaseActivation />
            <Routes>
            {/* Public Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />

            {/* Teacher Routes */}
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

            {/* Student Routes */}
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

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
