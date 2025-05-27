import React, { useEffect, useState } from 'react';

export default function CommentsList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/comments/post/${postId}`)
      .then(res => res.json())
      .then(data => {
        setComments(data);
        setLoading(false);
      });
  }, [postId]);

  if (loading) return <div>Chargement des commentaires...</div>;

  return (
    <div className="comments-list mt-2">
      {comments.map(comment => (
        <div key={comment.id} className="comment-item mb-2 p-2 border rounded bg-light">
          <div className="d-flex align-items-center mb-1">
            <img
              src={comment.user.avatar_url || '/default-avatar.png'}
              alt="avatar"
              className="rounded-circle me-2"
              width={32}
              height={32}
            />
            <strong>{comment.user.username}</strong>
            <span className="text-muted ms-2" style={{ fontSize: '0.85em' }}>
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          {comment.content_text && <div>{comment.content_text}</div>}
          {comment.content_multimedia && (
            <div className="mt-1">
              {comment.content_multimedia.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={`/uploads/media/${comment.content_multimedia}`} alt="media" className="img-fluid" style={{ maxHeight: 120 }} />
              ) : (
                <video src={`/uploads/media/${comment.content_multimedia}`} controls style={{ maxHeight: 120 }} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}