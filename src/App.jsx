import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';
import Login from './components/Login';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import QuizCreator from './components/Teacher/QuizCreator';
import TeacherQuizzes from './components/Teacher/TeacherQuizzes';
import StudentQuizzes from './components/Student/StudentQuizzes';
import QuizPlayer from './components/Student/QuizPlayer';
import QuizResult from './components/Student/QuizResult';
import StudentProfile from './components/Student/StudentProfile';
import EasterEggs from './components/EasterEggs';
import './index.css';

// Home redirect component
const Home = () => {
  const { userRole } = useAuth();
  
  if (userRole === 'teacher') {
    return <Navigate to="/teacher/dashboard" />;
  } else if (userRole === 'student') {
    return <Navigate to="/student/quizzes" />;
  }
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <EasterEggs />
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
  );
}

export default App;
