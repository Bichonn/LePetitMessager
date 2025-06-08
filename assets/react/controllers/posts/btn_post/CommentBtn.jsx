import React, { useState, useEffect } from 'react';
import '../../../../styles/CommentBtn.css';
import commentaireIcon from '../../../../../public/icons/commentaire.png';

const CommentBtn = ({ onClick, commentsCount = 0, postId }) => {
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(commentsCount);

  useEffect(() => {
    setCount(commentsCount);
  }, [commentsCount]);

  // Listen for custom event to update comment count
  useEffect(() => {
    const handleCommentCreated = (event) => {
      if (event.detail.postId === postId) {
        // Assuming the event or another mechanism provides the new count
        // For simplicity, we'll just increment. A more robust solution
        // might fetch the new count or have it passed in the event.
        setCount(prevCount => prevCount + 1);
      }
    };

    // If you have an event for comment deletion, you'd listen to it here too
    // const handleCommentDeleted = (event) => {
    //   if (event.detail.postId === postId) {
    //     setCount(prevCount => Math.max(0, prevCount - 1));
    //   }
    // };

    document.addEventListener('commentCreated', handleCommentCreated);
    // document.addEventListener('commentDeleted', handleCommentDeleted); // Example

    return () => {
      document.removeEventListener('commentCreated', handleCommentCreated);
      // document.removeEventListener('commentDeleted', handleCommentDeleted); // Example
    };
  }, [postId]);


  const handleClick = () => {
    setIsActive(!isActive);
    if (onClick) onClick();
  };

  return (
    <div className="comment-btn-wrapper d-flex align-items-center">
      <button
        className={`btn ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        title="Commenter"
      >
        <img
          src={commentaireIcon}
          alt="Commenter"
          className="icon"
          width={22}
          height={22}
        />
      </button>
      <span className="comment-count-closer">{count}</span>
    </div>
  );
};

export default CommentBtn;