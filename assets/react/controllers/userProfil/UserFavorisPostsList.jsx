import React, { useState, useEffect } from 'react';
import PostItem from '../posts/post_tool/PostItem';

export default function UserFavorisPostsList({ user }) {
  const [favorisPosts, setFavorisPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (user && user.id) {
      fetchFavorisPosts(user.id);
    } else {
      setFavorisPosts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  if (isLoading) return <div className="text-center my-3">Chargement des favoris...</div>;
  if (error && user) return <div className="alert alert-danger my-3 mx-2">Erreur lors du chargement des favoris : {error}</div>;

  return (
    <>
      {favorisPosts.length === 0 && !isLoading && !error && (
        <p className="text-muted my-3 ms-2">Cet utilisateur n'a aucun message en favoris pour le moment.</p>
      )}
      {favorisPosts.map(post => (
        <PostItem
          key={post.id}
          post={{ ...post, favoris_by_user: true }}
          author={post.user}
        />
      ))}
    </>
  );
}