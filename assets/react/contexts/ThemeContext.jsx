import React, { createContext, useState, useEffect } from 'react';

// Créer le contexte
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // État pour stocker le mode sombre (true/false)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      // Récupérer la valeur depuis localStorage
      const savedMode = localStorage.getItem('darkMode');
      // Si la valeur existe et est 'true', retourner true, sinon false
      return savedMode === 'true' ? true : false;
    } catch (error) {
      // En cas d'erreur (par exemple, localStorage non disponible), utiliser false (mode clair)
      console.error("Erreur lors de l'accès à localStorage:", error);
      return false;
    }
  });

  // Effet pour synchroniser avec localStorage et DOM
  useEffect(() => {
    try {
      // Enregistrer dans localStorage
      localStorage.setItem('darkMode', darkMode.toString());
      // Mettre à jour l'attribut data-bs-theme
      document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du thème:", error);
    }
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