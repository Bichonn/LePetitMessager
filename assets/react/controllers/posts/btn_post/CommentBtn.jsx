import React, { useState } from 'react';
import '../../../../styles/CommentBtn.css';
import commentaireIcon from '../../../../../public/icons/commentaire.png'; // Assurez-vous que ce chemin est correct

const CommentBtn = ({ onClick }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    if (onClick) onClick();
  };

  return (
    <div className="comment-btn-wrapper">
      <button 
        className={`btn ${isActive ? 'active' : ''}`} 
        onClick={handleClick}
      >
        <img 
          src={commentaireIcon} 
          alt="Commenter" 
          className="icon" 
          width={25} 
          height={25} 
        />
      </button>
    </div>
  );
};

export default CommentBtn;