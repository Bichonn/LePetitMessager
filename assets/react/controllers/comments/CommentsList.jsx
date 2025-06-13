import React, { useEffect, useState, useCallback } from 'react';

// Function to format relative timestamps
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "à l'instant";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours}h`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days}j`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

export default function CommentsList({ postId }) {
  const [comments, setComments] = useState([]); // State for storing comments
  const [loading, setLoading] = useState(true); // State for loading status

  // Fetches comments for a given post ID
  const fetchComments = useCallback(async (currentPostId) => {
    if (!currentPostId) return;
    setLoading(true);
    try {
      const res = await fetch(`/comments/post/${currentPostId}`);
      if (!res.ok) {
        console.error("Failed to fetch comments:", res.status);
        setComments([]); // Clear comments on failure
        setLoading(false);
        return;
      }
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]); // Clear comments on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch comments when postId changes
  useEffect(() => {
    fetchComments(postId);
  }, [postId, fetchComments]);

  // Effect to listen for new comment events and refresh the list
  useEffect(() => {
    const handleCommentCreated = (event) => {
      // Check if the new comment belongs to the current post
      if (event.detail.postId === postId) {
        fetchComments(postId); // Refresh comments
      }
    };

    document.addEventListener('commentCreated', handleCommentCreated);

    // Cleanup: remove event listener when component unmounts or dependencies change
    return () => {
      document.removeEventListener('commentCreated', handleCommentCreated);
    };
  }, [postId, fetchComments]);

  if (loading) return <div>Chargement des commentaires...</div>; // Display loading message

  return (
    <div className="comments-list">
      {/* Display message if no comments and not loading */}
      {comments.length === 0 && !loading && (
        <p className="text-muted text-center p-2">Aucun commentaire pour le moment.</p>
      )}
      {/* Map through comments and display each one */}
      {comments.map(comment => (
        <div key={comment.id} className="comment-item border-top border-bottom border-dark rounded-0 bg-color-search p-1">
          <div className="d-flex align-items-center mb-1">
            <img
              src={comment.user.avatar_url || '/default-avatar.png'} // User avatar
              alt={`${comment.user.username}'s avatar`}
              className="rounded-circle me-2"
              width={32}
              height={32}
              style={{ objectFit: 'cover' }}
            />
            <strong>{comment.user.username}</strong> {/* Username */}
            {comment.user.user_premium && ( // Display premium badge if user is premium
              <img
                src="/icons/badge.svg"
                alt="Premium"
                title="Utilisateur Premium"
                className="ms-2"
                style={{ width: 16, height: 16, verticalAlign: 'middle' }}
              />
            )}
            <span className="text-muted ms-2" style={{ fontSize: '0.85em' }}>
              {formatRelativeTime(comment.created_at)} {/* Comment creation time */}
            </span>
          </div>
          {comment.content_text && <div className='ms-4'>{comment.content_text}</div>} {/* Comment text content */}
          {comment.content_multimedia && ( // Display multimedia content if present
            <div className="mt-1 ms-4">
              {/* Check if multimedia is an image */}
              {comment.content_multimedia.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={comment.content_multimedia} alt="media" className="img-fluid d-block mx-auto" style={{ maxHeight: 120 }} />
              ) : /* Check if multimedia is a video */ comment.content_multimedia.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video src={comment.content_multimedia} controls className="img-fluid d-block mx-auto" style={{ maxHeight: 120 }} />
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}