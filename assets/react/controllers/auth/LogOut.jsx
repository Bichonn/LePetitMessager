import React from 'react';
import '../../../styles/app.css';

export default function LogOut({ username, logoutPath }) {
  return (
    <div className="container border-bottom border-top border-dark">
      <div className="d-flex justify-content-center mb-1 mt-3">
        <h5 className="text-center text-decoration-underline">
          Bienvenue, {username}!
        </h5>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <a href={logoutPath} className="custom-login-button text-decoration-none">
          Se déconnecter
        </a>
      </div>
    </div>
  );
}