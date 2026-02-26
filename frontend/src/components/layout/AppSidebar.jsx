import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = {
  teacher: [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/teacher/quizzes', label: 'My Quizzes', icon: 'bi-journal-text' },
    { to: '/teacher/create-quiz', label: 'Create Quiz', icon: 'bi-plus-circle' },
  ],
  student: [
    { to: '/student/quizzes', label: 'Available Quizzes', icon: 'bi-book' },
    { to: '/student/profile', label: 'Profile', icon: 'bi-person' },
  ],
};

const isActiveLink = (currentPath, targetPath) => currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

const AppSidebar = ({ role, currentPath, onLogout, onBrandClick, showBrandPulse = false, logoutDisabled = false }) => {
  const { currentUser } = useAuth();
  const items = NAV_ITEMS[role] || [];
  const roleLabel = role === 'teacher' ? 'Teacher' : 'Student';
  const displayName = currentUser?.name?.trim() || currentUser?.email?.split('@')?.[0] || roleLabel;

  return (
    <>
      <div className="mb-4 text-center sidebar-brand" onClick={onBrandClick}>
        <span className="sidebar-brand-icon-wrap" aria-hidden="true">
          <i className="bi bi-mortarboard-fill"></i>
        </span>
        <h3 className="gradient-text mb-1">QuizMaster</h3>
        <small className="text-muted">{roleLabel}</small>
        <div className="small text-white mt-2" title={displayName}>
          Hello, {displayName}
        </div>
        {showBrandPulse && <div className="sidebar-brand-pulse" />}
      </div>

      <nav className="nav flex-column mb-4 sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-link text-white rounded py-2 px-3 mb-1 ${isActiveLink(currentPath, item.to) ? 'active bg-primary' : ''}`}
          >
            <i className={`bi ${item.icon} nav-icon`}></i>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <button onClick={onLogout} className="btn btn-danger w-100 sidebar-logout-btn" disabled={logoutDisabled}>
        <i className="bi bi-door-open nav-icon"></i>
        <span className="nav-label">Logout</span>
      </button>
    </>
  );
};

export default AppSidebar;
