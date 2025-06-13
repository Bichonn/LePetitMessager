import React, { useState, useEffect } from 'react';
import '../../../../styles/SaveBtn.css';

const SaveBtn = ({ postId, initialFavoris = false }) => {
  const [favoris, setFavoris] = useState(initialFavoris);
  const [feedback, setFeedback] = useState('');

  // Update state when props change
  useEffect(() => {
    setFavoris(initialFavoris);
  }, [initialFavoris]);

  const handleSaveClick = async () => {
    // Store previous state for rollback if needed
    const previousFavoris = favoris;
    
    // Optimistic UI update
    setFavoris(!favoris);
    setFeedback('');
    
    try {
      const formData = new FormData();
      formData.append('post_id', postId);

      const response = await fetch('/favoris/add', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // Rollback on error
        setFavoris(previousFavoris);
        setFeedback(data.message || 'Erreur lors de l\'ajout aux favoris');
      }
    } catch (err) {
      // Rollback on network error
      setFavoris(previousFavoris);
      setFeedback('Erreur de connexion');
    }
  };

  return (
    <div className="save-btn-wrapper d-flex align-items-center ms-2">
      <button
        className={`btn p-0 ${favoris ? 'saved' : ''}`}
        onClick={handleSaveClick}
        title={favoris ? "Retirer des favoris" : "Ajouter aux favoris"}
        style={{
          background: 'none',
          border: 'none',
          padding: '5px',
          marginLeft: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <svg
          className="icon"
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill={favoris ? "#fd1853" : "none"}
          stroke={favoris ? "#fd1853" : "currentColor"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {feedback && <span className="small text-info ms-1">{feedback}</span>}
    </div>
  );
};

export default SaveBtn;