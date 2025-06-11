import React, { useEffect, useState, useCallback } from 'react';

// Fonction pour formater les timestamps relatifs
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
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async (currentPostId) => {
    if (!currentPostId) return;
    setLoading(true);
    try {
      const res = await fetch(`/comments/post/${currentPostId}`);
      if (!res.ok) {
        console.error("Failed to fetch comments:", res.status);
        setComments([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments(postId);
  }, [postId, fetchComments]);

  useEffect(() => {
    const handleCommentCreated = (event) => {
      if (event.detail.postId === postId) {
        fetchComments(postId);
      }
    };

    document.addEventListener('commentCreated', handleCommentCreated);

    return () => {
      document.removeEventListener('commentCreated', handleCommentCreated);
    };
  }, [postId, fetchComments]);

  if (loading) return <div>Chargement des commentaires...</div>;

  return (
    <div className="comments-list">
      {comments.length === 0 && !loading && (
        <p className="text-muted text-center p-2">Aucun commentaire pour le moment.</p>
      )}
      {comments.map(comment => (
        <div key={comment.id} className="comment-item border-top border-bottom border-dark rounded-0 bg-color-search p-1">
          <div className="d-flex align-items-center mb-1">
            <img
              src={comment.user.avatar_url || '/default-avatar.png'}
              alt={`${comment.user.username}'s avatar`}
              className="rounded-circle me-2"
              width={32}
              height={32}
              style={{ objectFit: 'cover' }}
            />
            <strong>{comment.user.username}</strong>
            {comment.user.user_premium && (
              <img
                src="/icons/badge.svg"
                alt="Premium"
                title="Utilisateur Premium"
                className="ms-2"
                style={{ width: 16, height: 16, verticalAlign: 'middle' }}
              />
            )}
            <span className="text-muted ms-2" style={{ fontSize: '0.85em' }}>
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          {comment.content_text && <div className='ms-4'>{comment.content_text}</div>}
          {comment.content_multimedia && (
            <div className="mt-1 ms-4">
              {comment.content_multimedia.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={comment.content_multimedia} alt="media" className="img-fluid d-block mx-auto" style={{ maxHeight: 120 }} />
              ) : comment.content_multimedia.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video src={comment.content_multimedia} controls className="img-fluid d-block mx-auto" style={{ maxHeight: 120 }} />
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}