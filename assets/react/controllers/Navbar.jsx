import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const themeContextValue = useContext(ThemeContext) || { darkMode: false };
  const { darkMode } = themeContextValue;

  return (
    <div
      className={`navbar border-end ${darkMode ? 'bg-dark text-light border-light' : 'bg-light text-dark border-dark'} p-3 d-flex flex-column`}
      style={{ height: "100vh", width: "100%" }}
    >
      
      <nav className="nav flex-column align-items-center">
        {/* Home - Première icône */}
        <div className="nav-item mb-3 position-relative nav-hover">
          <div className="nav-link d-flex flex-column align-items-center">
            <img src="/icons/home.png" alt="Accueil" className="img-fluid navbar-icon" />
            <span className="mt-1 icon-name-appear">Accueil</span>
          </div>
        </div>
        
        {/* Message - Deuxième icône */}
        <div className="nav-item mb-3 position-relative nav-hover">
          <div className="nav-link d-flex flex-column align-items-center">
            <img src="/icons/message.png" alt="Messages" className="img-fluid navbar-icon" />
            <span className="mt-1 icon-name-appear">Messages</span>
          </div>
        </div>
        
        {/* Write - Nouvelle icône */}
        <div className="nav-item mb-3 position-relative nav-hover">
          <div className="nav-link d-flex flex-column align-items-center">
            <img src="/icons/write.png" alt="Écrire" className="img-fluid navbar-icon" />
            <span className="mt-1 icon-name-appear">Écrire</span>
          </div>
        </div>
        
        {/* Top - Nouvelle icône */}
        <div className="nav-item mb-3 position-relative nav-hover">
          <div className="nav-link d-flex flex-column align-items-center">
            <img src="/icons/top.png" alt="Top" className="img-fluid navbar-icon" />
            <span className="mt-1 icon-name-appear">Gros Titre</span>
          </div>
        </div>
      </nav>
      
      <div className="mt-auto">
        {/* Notification - Remplace ThemeToggle */}
        <div className="nav-item mb-3 position-relative nav-hover text-center">
          <div className="nav-link d-flex flex-column align-items-center">
            <img src="/icons/notif.png" alt="Notifications" className="img-fluid navbar-icon" />
            <span className="mt-1 icon-name-appear">Notifications</span>
          </div>
        </div>
        
        <div className="nav-item mb-3 position-relative nav-hover text-center">
          <div className="nav-link d-flex flex-column align-items-center">
            <img src="/icons/profil.png" alt="Profil" className="img-fluid navbar-icon" />
            <span className="mt-1 icon-name-appear">Profil</span>
          </div>
        </div>
        
        {/* Je garde le ThemeToggle en dessous pour le dark mode */}
        <ThemeToggle />
      </div>
    </div>
  );
}