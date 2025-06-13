import React from 'react';
import '../../../styles/app.css'; // Import custom styles

// Google Authentication Button component
export default function GoogleAuthBtn({ className = "btn-primary", text = "Connexion avec Google" }) {
  return (
    // Link to Google authentication endpoint
    <a href="/auth/google" className="btn btn-primary" style={{ textDecoration: 'none' }}>
      {/* Google icon */}
      <img 
        src="/icons/google.png" 
        alt="Google" 
        width="15" 
        height="15" 
        className="me-2 " 
      />
      {/* Button text */}
      {text}
    </a>
  );
}