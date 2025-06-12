import React from 'react';
import '../../../styles/app.css';

export default function GoogleAuthBtn({ className = "btn-primary", text = "Connexion avec Google" }) {
  return (
    <a href="/auth/google" className="btn btn-primary" style={{ textDecoration: 'none' }}>
      <img 
        src="/icons/google.png" 
        alt="Google" 
        width="15" 
        height="15" 
        className="me-2 " 
      />
      {text}
    </a>
  );
}