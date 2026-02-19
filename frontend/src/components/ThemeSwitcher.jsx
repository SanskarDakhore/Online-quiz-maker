import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const OPTIONS = [
  { id: 'aurora', label: 'Aurora', icon: 'bi-stars' },
  { id: 'daybreak', label: 'Daybreak', icon: 'bi-sun' },
  { id: 'ink', label: 'Ink', icon: 'bi-moon-stars' }
];

const ThemeSwitcher = ({ compact = false, single = false }) => {
  const { theme, setTheme, themes } = useTheme();

  if (single) {
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    const active = OPTIONS.find((option) => option.id === theme) || OPTIONS[0];

    return (
      <button
        type="button"
        className="theme-cycle-btn"
        onClick={() => setTheme(nextTheme)}
        title={`Theme: ${active.label}`}
        aria-label={`Switch theme, current ${active.label}`}
      >
        <i className={`bi ${active.icon}`}></i>
      </button>
    );
  }

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
