import React from 'react';
import NavIcons from './NavIcons';
import NotifIcon from '../notifs/NotifIcon';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../../contexts/ThemeContext';
import '../../../styles/Navbar.css';


export default function Navbar({ isAuthenticated, isAdmin }) {

  const handleWriteClick = () => {
    document.dispatchEvent(new CustomEvent('openCreatePostSection'));
  };

  return (
    <ThemeProvider>
      <div className="navbar-container border-end border-dark position-fixed inner-shadow">
        <div className="navbar-top">
          <a href="/" className="nav-link">
            <NavIcons iconPath={"/icons/home.png"} iconName={"Accueil"} />
          </a>
          <a href="/messages" className="nav-link">
            <NavIcons iconPath={"/icons/message.png"} iconName={"Messages"} />
          </a>
          <a href="/posts/top" className="nav-link">
            <NavIcons iconPath={"/icons/top.png"} iconName={"Gros titre"} />
          </a>
        </div>

        {isAuthenticated && isAdmin && (
          <a href="/admin" className="nav-link">
            <NavIcons iconPath={"/icons/admin.png"} iconName={"Admin"} />
          </a>
        )}
        <div className="navbar-bottom">
          <a href="/notifications" className="nav-link">
            <NotifIcon />
          </a>
          {isAuthenticated && (
            <a href="/profil" className="nav-link">
              <NavIcons iconPath={"/icons/profil.png"} iconName={"Profil"} />
            </a>
          )}
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}