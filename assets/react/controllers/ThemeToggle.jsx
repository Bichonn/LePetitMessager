import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext'; // Adjust path if necessary

/**
 * Component for toggling between light and dark theme modes
 */
export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-toggle">
      {/* Toggle button with theme-appropriate icon */}
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