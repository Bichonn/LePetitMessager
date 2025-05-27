import React from 'react';
import { useState } from 'react';
import '../../../../styles/SaveBtn.css';

const SaveBtn = ({ postId, initialFavoris = false }) => {

  const [favoris, setFavoris] = useState(initialFavoris);
  const [feedback, setFeedback] = useState('');

  const handleSaveClick = async () => {
    try {
      const formData = new FormData();
      formData.append('post_id', postId);

      const response = await fetch('/favoris/add', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const data = await response.json();
      if (response.ok) {
        if (liked) {
          setFavoris(false);
        } else {
          setFavoris(true);
        }
      } else {
        setFeedback(data.message || 'Erreur lors de l\'ajout aux favoris');
      }
    } catch (err) {
      setFeedback('Erreur de connexion');
    }
  };

  return (
    <div className="save-wrapper">
      <button
        className={`btn-save ${favoris ? 'active' : ''}`}
        onClick={handleSaveClick}
        title={favoris ? "Retirer des favoris" : "Ajouter aux favoris"}
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        {favoris ? (
          <svg className="save-solid" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="#fd1853">
            <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
          </svg>
        ) : (
          <svg className="save-regular" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="#888">
            <path d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z" />
          </svg>
        )}
      </button>
      {feedback && <span className="small text-info ms-1">{feedback}</span>}
    </div>
  );
};

export default SaveBtn;