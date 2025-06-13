import React, { useState, useEffect } from 'react';
import PostItem from '../posts/post_tool/PostItem';

/**
 * Component that displays a user's liked posts
 */
export default function UserLikedPostsList({ user }) {
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's liked posts from API
  const fetchLikedPosts = async (userId) => {
    if (!userId) {
      setLikedPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/users/${userId}/liked-posts`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la récupération des posts aimés`);
      }
      const posts = await response.json();
      setLikedPosts(posts);
    } catch (err) {
      console.error("Erreur détaillée fetchLikedPosts:", err);
      setError(err.message);
      setLikedPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load liked posts when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchLikedPosts(user.id);
    } else {
      // Reset state when no user provided
      setLikedPosts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  // Handle post deletion by removing from local state
  const handlePostDeletedInLikedList = (postId) => {
    setLikedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };
  
  // Handle post updates by updating local state
  const handlePostUpdatedInLikedList = (updatedPost) => {
    setLikedPosts(prevPosts => prevPosts.map(post =>
      post.id === updatedPost.id ? { ...post, ...updatedPost } : post
    ));
  };

  // Loading state
  if (isLoading) return <div className="text-center my-3">Chargement des posts aimés...</div>;
  
  // Error state
  if (error && user) return <div className="alert alert-danger my-3 mx-2">Erreur lors du chargement des posts aimés: {error}</div>;

  return (
    <>
      {/* Empty state when no liked posts */}
      {likedPosts.length === 0 && !isLoading && !error && (
        <p className="text-muted my-3 ms-2">Cet utilisateur n'a aimé aucun message pour le moment.</p>
      )}
      {/* Render liked posts list */}
      {likedPosts.map(post => (
        <PostItem
          key={post.id}
          post={post}
          author={post.user} // Original post author
          onPostDeleted={handlePostDeletedInLikedList}
          onPostActuallyUpdated={handlePostUpdatedInLikedList}
        />
      ))}
    </>
  );
}