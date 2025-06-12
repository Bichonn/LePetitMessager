import React from 'react';
import '../../../styles/app.css';

export default function GoogleAuthBtn({ className = "btn btn-outline-primary" }) {
  return (
    <a href="/auth/google" className={className} style={{ textDecoration: 'none' }}>
      <img 
        src="/icons/google.png" 
        alt="Google" 
        width="20" 
        height="20" 
        className="me-2" 
      />
      Connexion avec Google
    </a>
  );
}