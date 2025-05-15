import React from 'react';
import NavIcons from './NavIcons';

export default function Navbar() {
  return (
    <div className="border-end border-dark p-3 d-flex flex-column" style={{ height: "100vh" }}>

      <div>
        <NavIcons iconPath={"/icons/home.png"} iconName={"Accueil"} />
        <NavIcons iconPath={"/icons/message.png"} iconName={"Messages"} />
        <NavIcons iconPath={"/icons/write.png"} iconName={"Ajouter"} />
        <NavIcons iconPath={"/icons/top.png"} iconName={"Gros Titres"} />
      </div>

      <div className='mt-auto'>
        <NavIcons iconPath={"/icons/notif.png"} iconName={"Courrier"} />
        <NavIcons iconPath={"/icons/profil.png"} iconName={"Profil"} />
      </div>

    </div>
  );
};