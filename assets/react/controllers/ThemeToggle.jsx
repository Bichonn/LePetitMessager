import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const themeContextValue = useContext(ThemeContext) || { darkMode: false, toggleTheme: () => {} };
  const { darkMode, toggleTheme } = themeContextValue;

  return (
    <div className="theme-toggle text-center">
      <button 
        onClick={toggleTheme} 
        className={`btn btn-sm ${darkMode ? 'btn-light' : 'btn-dark'} rounded-circle p-2`}
        aria-label="Changer le thème"
      >
        {darkMode ? (
          <img src="/icons/sun.png" alt="Mode clair" className="img-fluid" style={{width: "20px", height: "20px"}} />
        ) : (
          <img src="/icons/Moon.png" alt="Mode sombre" className="img-fluid" style={{width: "20px", height: "20px"}} />
        )}
      </button>
    </div>
  );
}