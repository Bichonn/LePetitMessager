import React, { useState } from 'react';
import '../../../../styles/LikeBtn.css'; // Specific styles for the like button

// Component for the like button, handles liking/unliking a post and displays like count
const LikeBtn = ({ postId, initialLiked = false, likesCount = 0 }) => {
    const [liked, setLiked] = useState(initialLiked); // State to track if the post is liked by the current user
    const [count, setCount] = useState(likesCount); // State for the total number of likes
    const [feedback, setFeedback] = useState(''); // State for displaying feedback messages (e.g., errors)

    // Handles the click event on the like button
    const handleLikeClick = async () => {
        // Keep a copy of the previous state to revert in case of an error
        const previousLiked = liked;
        const previousCount = count;

        // Optimistic UI update
        if (liked) {
            setLiked(false);
            setCount(count - 1);
        } else {
            setLiked(true);
            setCount(count + 1);
        }
        setFeedback(''); // Reset feedback

        try {
            const formData = new FormData();
            formData.append('post_id', postId);

            // API call to toggle the like status on the server
            const response = await fetch('/likes/add', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' } // Indicate AJAX request for Symfony
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({})); // Handle cases where the error response is not JSON
                // Revert the optimistic update in case of an error
                setLiked(previousLiked);
                setCount(previousCount);
                setFeedback(data.message || 'Erreur lors du like'); // "Error during like" - consider translating this too if it's user-facing
            }
            // If the response is ok, the optimistic update was correct, nothing more to do.
            // The server response confirms the action, but the UI is already updated.
        } catch (err) {
            // Revert the optimistic update in case of a connection error
            setLiked(previousLiked);
            setCount(previousCount);
            setFeedback('Erreur de connexion'); // "Connection error" - consider translating if user-facing
        }
    };

    return (
        <div className="like-btn-wrapper d-flex align-items-center">
            <button
                className={`btn ${liked ? 'liked' : ''}`} // Apply 'liked' class if the post is liked
                onClick={handleLikeClick}
                title={liked ? "Retirer le like" : "Liker"} // Tooltip: "Unlike" or "Like"
            >
                <svg
                    className="icon"
                    width={22} 
                    height={22} 
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill={liked ? "#fd1853" : "none"} // Fill color changes based on 'liked' state
                    stroke={liked ? "none" : "currentColor"} // Stroke color changes based on 'liked' state
                    strokeWidth="1"
                >
                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                </svg>
            </button>
            {/* Display the like count */}
            <span className="like-count-closer">{count}</span>
            {/* Display feedback message if any - consider adding this to the UI if feedback is important to show */}
            {/* {feedback && <div className="feedback-message">{feedback}</div>} */}
        </div>
    );
}

export default LikeBtn;