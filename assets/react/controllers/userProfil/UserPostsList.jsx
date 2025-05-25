import React, { useState, useEffect } from 'react';
import PostItem from '../posts/post_tool/PostItem';

export default function UserPostsList({ user }) { // Attend l'objet 'user' du profil
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false); // Initialement false, activé par fetchUserPosts
  const [postsError, setPostsError] = useState(null);

  const fetchUserPosts = async (userId) => {
    if (!userId) {
      setUserPosts([]);
      setPostsLoading(false);
      return;
    }
    setPostsLoading(true);
    setPostsError(null);
    try {
      // Appel du nouvel endpoint
      const response = await fetch(`/users/${userId}/posts`); 
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Gérer le cas où la réponse d'erreur n'est pas JSON
        throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la récupération des posts de l'utilisateur`);
      }
      const userSpecificPosts = await response.json();
      // Plus besoin de filtrer ici, le backend le fait déjà.
      // Le tri est également fait par le backend.
      setUserPosts(userSpecificPosts);
    } catch (err) {
      console.error("Erreur détaillée fetchUserPosts:", err);
      setPostsError(err.message);
      setUserPosts([]); // Vider les posts en cas d'erreur
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchUserPosts(user.id);
    } else {
      setUserPosts([]);
      setPostsLoading(false);
      setPostsError(null);
    }

    const handleGlobalPostCreated = () => {
      if (user && user.id) {
        fetchUserPosts(user.id); // Recharger les posts pour cet utilisateur
      }
    };
    document.addEventListener('postCreated', handleGlobalPostCreated);

    return () => {
      document.removeEventListener('postCreated', handleGlobalPostCreated);
    };
  }, [user]); // Se réexécute si l'objet 'user' change

  const handlePostDeleted = (postId) => {
    setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setUserPosts(prevPosts => prevPosts.map(post =>
      post.id === updatedPost.id ? { ...updatedPost, user: user } : post
    ));
  };

  if (postsLoading) return <div className="text-center my-3">Chargement des posts...</div>;
  // Ne pas afficher d'erreur si user est null et que nous n'avons pas essayé de charger
  if (postsError && user) return <div className="text-danger my-3">Erreur lors du chargement des posts: {postsError}</div>;


  return (
    <>
      <div className="container p-2 shadow border border-dark">
        <h3 className="fw-bold">Message(s) Récent :</h3>
      </div>

      {user && userPosts.length === 0 && !postsLoading && !postsError && (
        <div className="container p-3 border-start border-end border-bottom border-dark">
          <p className="text-muted my-3">Cet utilisateur n'a pas encore posté de message.</p>
        </div>
      )}
      {user && userPosts.map(post => (
        <PostItem
          key={post.id}
          post={post}
           author={post.user || user} 
          onPostDeleted={handlePostDeleted}
          onPostActuallyUpdated={handlePostUpdated}
        />
      ))}
    </>
  );
}