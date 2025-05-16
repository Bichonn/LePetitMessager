import React, { createContext, useState, useEffect } from 'react';

// Créer le contexte
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // État pour stocker le mode sombre (true/false)
  const [darkMode, setDarkMode] = useState(() => {
    // Vérifier si une préférence a été sauvegardée dans localStorage
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    // Mettre à jour localStorage quand le mode change
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Appliquer l'attribut data-bs-theme pour les styles CSS
    document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Fonction pour basculer entre les modes
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};