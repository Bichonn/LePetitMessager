import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-toggle mt-3">
      <button 
        onClick={toggleTheme} 
        className={`btn btn-sm ${darkMode ? 'btn-light' : 'btn-dark'}`}
        aria-label="Changer le thème"
      >
        {darkMode ? (
          <img src="/icons/sun.png" alt="Mode clair" className="img-fluid w-75" />
        ) : (
          <img src="/icons/Moon.png" alt="Mode sombre" className="img-fluid w-75" />
        )}
      </button>
    </div>
  );
}