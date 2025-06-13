import React, { useState, useEffect } from 'react';
import '../../../../styles/CommentBtn.css'; // Specific styles for the comment button
import commentaireIcon from '../../../../../public/icons/commentaire.png'; // Icon for the comment button

// Component for the comment button, displays comment count and toggles comment section
const CommentBtn = ({ onClick, commentsCount = 0, postId }) => {
  const [isActive, setIsActive] = useState(false); // State to track if the comment section is active/visible
  const [count, setCount] = useState(commentsCount); // State for the number of comments

  // Effect to update the local comment count when the prop changes
  useEffect(() => {
    setCount(commentsCount);
  }, [commentsCount]);

  // Effect to listen for custom 'commentCreated' event to update comment count
  useEffect(() => {
    const handleCommentCreated = (event) => {
      // Check if the created comment belongs to the current post
      if (event.detail.postId === postId) {
        // Increment count when a new comment is created for this post
        setCount(prevCount => prevCount + 1);
      }
    };

    document.addEventListener('commentCreated', handleCommentCreated);
    // document.addEventListener('commentDeleted', handleCommentDeleted); // Example: Add listener for comment deletion

    // Cleanup: remove event listeners when component unmounts or postId changes
    return () => {
      document.removeEventListener('commentCreated', handleCommentCreated);
      // document.removeEventListener('commentDeleted', handleCommentDeleted); // Example: Remove listener for comment deletion
    };
  }, [postId]); // Dependency: postId ensures the listener is updated if the post context changes


  // Handles the click event on the comment button
  const handleClick = () => {
    setIsActive(!isActive); // Toggle the active state
    if (onClick) onClick(); // Execute the passed onClick function (e.g., to show/hide comment form)
  };

  return (
    <div className="comment-btn-wrapper d-flex align-items-center">
      <button
        className={`btn ${isActive ? 'active' : ''}`} // Apply 'active' class if isActive is true
        onClick={handleClick}
        title="Commenter" // Tooltip for the button
      >
        <img
          src={commentaireIcon}
          alt="Commenter" // Alt text for the icon
          className="icon"
          width={22}
          height={22}
        />
      </button>
      {/* Display the comment count */}
      <span className="comment-count-closer">{count}</span>
    </div>
  );
};

export default CommentBtn;