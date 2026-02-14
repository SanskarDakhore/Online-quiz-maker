import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const OPTIONS = [
  { id: 'aurora', label: 'Aurora' },
  { id: 'daybreak', label: 'Daybreak' },
  { id: 'ink', label: 'Ink' }
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher card-glass">
      <label htmlFor="theme-select" className="theme-switcher-label">Theme</label>
      <select
        id="theme-select"
        className="form-select input-glass"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        {OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
