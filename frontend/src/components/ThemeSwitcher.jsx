import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const OPTIONS = [
  { id: 'aurora', label: 'Aurora', icon: 'bi-stars' },
  { id: 'daybreak', label: 'Daybreak', icon: 'bi-sun' },
  { id: 'ink', label: 'Ink', icon: 'bi-moon-stars' }
];

const ThemeSwitcher = ({ compact = false }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`theme-switcher ${compact ? 'compact' : ''}`}>
      <span className="theme-switcher-label">Theme</span>
      <div className="theme-switcher-tabs" role="tablist" aria-label="Theme Selector">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`theme-tab ${theme === option.id ? 'active' : ''}`}
            onClick={() => setTheme(option.id)}
            aria-selected={theme === option.id}
            title={option.label}
          >
            <i className={`bi ${option.icon}`}></i>
            {!compact && <span>{option.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
