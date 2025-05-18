import React, { useContext } from 'react';
import NavIcons from './NavIcons';
import '../../styles/Navbar.css';


export default function Navbar() {
  return (
    <div className="navbar-container border-end border-dark">
      <div className="navbar-top">
        <NavIcons iconPath={"/icons/home.png"} iconName={"Accueil"} />
        <NavIcons iconPath={"/icons/message.png"} iconName={"Messages"} />
        <NavIcons iconPath={"/icons/write.png"} iconName={"Ecrire"} />
        <NavIcons iconPath={"/icons/top.png"} iconName={"Gros titre"} />
      </div>
      
      <div className="navbar-bottom">
        <NavIcons iconPath={"/icons/notif.png"} iconName={"Courier"} />
        <NavIcons iconPath={"/icons/profil.png"} iconName={"profil"} />
      </div>
    </div>
  );
}