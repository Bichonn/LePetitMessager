import React from 'react';
import NavIcons from './NavIcons';
import '../../../styles/Navbar.css';


export default function Navbar({ isAuthenticated, isAdmin }) {

  const handleWriteClick = () => {
    document.dispatchEvent(new CustomEvent('openCreatePostSection'));
  };

  return (
    <div className="navbar-container border-end border-dark position-fixed">
      <div className="navbar-top">
        <a href="/" className="nav-link">
          <NavIcons iconPath={"/icons/home.png"} iconName={"Accueil"} />
        </a>
        <NavIcons iconPath={"/icons/message.png"} iconName={"Messages"} />
        <div onClick={handleWriteClick} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleWriteClick()}>
          <NavIcons iconPath={"/icons/write.png"} iconName={"Ecrire"} />
        </div>
        <NavIcons iconPath={"/icons/top.png"} iconName={"Gros titre"} />
      </div>

      {isAuthenticated && isAdmin && (
        <a href="/admin" className="nav-link"> {/* Mettez ici le lien vers votre page d'administration */}
          <NavIcons iconPath={"/icons/admin.png"} iconName={"Admin"} />
        </a>
      )}
      <div className="navbar-bottom">
        <NavIcons iconPath={"/icons/notif.png"} iconName={"Courier"} />
        {isAuthenticated && (
          <a href="/profil" className="nav-link">
            <NavIcons iconPath={"/icons/profil.png"} iconName={"Profil"} />
          </a>
        )}
      </div>
    </div>
  );
}