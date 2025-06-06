import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext'; // Adjust path if necessary

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-toggle">
      <button onClick={toggleTheme} className="btn p-0">
        <img 
          src={darkMode ? "/icons/sun.png" : "/icons/Moon.png"} 
          alt={darkMode ? "Mode clair" : "Mode sombre"}
          className="img-fluid w-100"
        />
      </button>
    </div>
  );
}