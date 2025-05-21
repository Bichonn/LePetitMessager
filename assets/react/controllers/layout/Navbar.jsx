import React, { useContext } from 'react';
import NavIcons from './NavIcons';
import '../../../styles/Navbar.css';


export default function Navbar() {

  const handleWriteClick = () => {
    document.dispatchEvent(new CustomEvent('openCreatePostSection')); // Ensure this event name matches
  };

  return (
    <div className="navbar-container border-end border-dark position-fixed">
      <div className="navbar-top">
        <NavIcons iconPath={"/icons/home.png"} iconName={"Accueil"} />
        <NavIcons iconPath={"/icons/message.png"} iconName={"Messages"} />
        <div onClick={handleWriteClick} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleWriteClick()}>
          <NavIcons iconPath={"/icons/write.png"} iconName={"Ecrire"} />
        </div>
        <NavIcons iconPath={"/icons/top.png"} iconName={"Gros titre"} />
      </div>

      <div className="navbar-bottom">
        <NavIcons iconPath={"/icons/notif.png"} iconName={"Courier"} />
        <NavIcons iconPath={"/icons/profil.png"} iconName={"profil"} />
      </div>
    </div>
  );
}