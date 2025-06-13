import React, { useState, useEffect } from 'react';
import PostItem from '../posts/post_tool/PostItem';

/**
 * Component that displays a user's favorite/saved posts
 */
export default function UserFavorisPostsList({ user }) {
  const [favorisPosts, setFavorisPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's favorite posts from API
  const fetchFavorisPosts = async (userId) => {
    if (!userId) {
      setFavorisPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/users/${userId}/favoris-posts`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la récupération des favoris`);
      }
      const posts = await response.json();
      setFavorisPosts(posts);
    } catch (err) {
      setError(err.message);
      setFavorisPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load favorite posts when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchFavorisPosts(user.id);
    } else {
      // Reset state when no user provided
      setFavorisPosts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  // Loading state
  if (isLoading) return <div className="text-center my-3">Chargement des favoris...</div>;
  
  // Error state
  if (error && user) return <div className="alert alert-danger my-3 mx-2">Erreur lors du chargement des favoris : {error}</div>;

  return (
    <>
      {/* Empty state when no favorite posts */}
      {favorisPosts.length === 0 && !isLoading && !error && (
        <p className="text-muted my-3 ms-2">Cet utilisateur n'a aucun message en favoris pour le moment.</p>
      )}
      {/* Render favorite posts list */}
      {favorisPosts.map(post => (
        <PostItem
          key={post.id}
          post={{ ...post, favoris_by_user: true }} // Mark as favorited for UI consistency
          author={post.user}
        />
      ))}
    </>
  );
}