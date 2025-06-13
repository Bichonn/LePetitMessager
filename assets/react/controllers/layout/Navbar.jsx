import React from 'react';
import NavIcons from './NavIcons';
import NotifIcon from '../notifs/NotifIcon';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../../contexts/ThemeContext';
import '../../../styles/Navbar.css';


export default function Navbar({ isAuthenticated, isAdmin }) {

  // Function to handle the "Write" button click event
  const handleWriteClick = () => {
    document.dispatchEvent(new CustomEvent('openCreatePostSection'));
  };

  return (
    <ThemeProvider>
      {/* Main container for the navigation bar */}
      <div className="navbar-container border-end border-dark position-fixed inner-shadow">
        {/* Top section of the navigation bar */}
        <div className="navbar-top">
          {/* Link to the home page */}
          <a href="/" className="nav-link">
            <NavIcons iconPath={"/icons/home.png"} iconName={"Accueil"} />
          </a>
          {/* Link to the top posts */}
          <a href="/posts/top" className="nav-link">
            <NavIcons iconPath={"/icons/top.png"} iconName={"Gros titre"} />
          </a>
          {/* Link to messages, visible only if authenticated */}
          {isAuthenticated && (
          <a href="/messages" className="nav-link">
            <NavIcons iconPath={"/icons/message.png"} iconName={"Messages"} />
          </a>
          )}
        </div>

        {/* Admin link, visible only if authenticated and user is an admin */}
        {isAuthenticated && isAdmin && (
          <a href="/admin" className="nav-link">
            <NavIcons iconPath={"/icons/admin.png"} iconName={"Admin"} />
          </a>
        )}

        {/* Bottom section of the navigation bar */}
        <div className="navbar-bottom">
          {/* Notifications link, visible only if authenticated */}
          {isAuthenticated && (
          <a href="/notifications" className="nav-link">
            <NotifIcon />
          </a>
          )}
          {/* Profile link, visible only if authenticated */}
          {isAuthenticated && (
            <a href="/profil" className="nav-link">
              <NavIcons iconPath={"/icons/profil.png"} iconName={"Profil"} />
            </a>
          )}
          {/* Theme toggle button */}
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}