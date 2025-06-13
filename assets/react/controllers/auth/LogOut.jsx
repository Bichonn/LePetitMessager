import React from 'react';
import '../../../styles/app.css';

// Component to display a welcome message and a logout button
export default function LogOut({ username, logoutPath }) {
  return (
    <div className="container border-bottom border-top border-dark">
      {/* Welcome message section */}
      <div className="d-flex justify-content-center mb-1 mt-3">
        <h5 className="text-center text-decoration-underline">
          Bienvenue, {username} !
        </h5>
      </div>
      {/* Logout button section */}
      <div className="d-flex justify-content-center mb-3">
        <a href={logoutPath} className="btn btn-primary">
          Se déconnecter
        </a>
      </div>
    </div>
  );
}