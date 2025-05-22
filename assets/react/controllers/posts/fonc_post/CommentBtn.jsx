import React, { useState } from 'react';
import '../../../../styles/CommentBtn.css';

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
        <svg 
          className="icon" 
          width={30} 
          height={30} 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
          strokeWidth="1.5"
        >
          {/* Nouvelle icône de bulle de commentaire */}
          <path d="M12,2C6.48,2,2,6.48,2,12c0,1.54,0.36,2.98,0.97,4.29L2.09,21.29c-0.19,0.7,0.48,1.37,1.18,1.18l5-1.39
            C9.59,21.65,10.76,22,12,22c5.52,0,10-4.48,10-10C22,6.48,17.52,2,12,2z M16,13H8c-0.55,0-1-0.45-1-1s0.45-1,1-1h8
            c0.55,0,1,0.45,1,1S16.55,13,16,13z M16,9H8C7.45,9,7,8.55,7,8s0.45-1,1-1h8c0.55,0,1,0.45,1,1S16.55,9,16,9z"/>
        </svg>
      </button>
    </div>
  );
};

export default CommentBtn;