import React, { useState, useEffect } from 'react';
import PostItem from '../posts/post_tool/PostItem'; // Assurez-vous que le chemin est correct

export default function UserLikedPostsList({ user }) { // Attend l'objet 'user' du profil
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLikedPosts = async (userId) => {
    if (!userId) {
      setLikedPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/users/${userId}/liked-posts`); // Nouvel endpoint API
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

  useEffect(() => {
    if (user && user.id) {
      fetchLikedPosts(user.id);
    } else {
      setLikedPosts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user]); // Se réexécute si l'objet 'user' change

  const handlePostDeletedInLikedList = (postId) => {
    // Si un post affiché dans cette liste est supprimé globalement
    setLikedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };
  
  const handlePostUpdatedInLikedList = (updatedPost) => {
    // Si un post affiché dans cette liste est mis à jour
    setLikedPosts(prevPosts => prevPosts.map(post =>
      post.id === updatedPost.id ? { ...post, ...updatedPost } : post
    ));
  };

  if (isLoading) return <div className="text-center my-3">Chargement des posts aimés...</div>;
  if (error && user) return <div className="alert alert-danger my-3 mx-2">Erreur lors du chargement des posts aimés: {error}</div>;

  return (
    <>
      {/* Le titre "Message(s) Aimé(s)" sera géré par le bouton dans ShowProfil.jsx */}
      {/* Ou vous pouvez ajouter un titre spécifique ici si le design le requiert */}
      {/* <div className="container p-2 mt-3 shadow border border-dark"> */}
      {/*   <h3 className="fw-bold">Message(s) Aimé(s) par {user.username} :</h3> */}
      {/* </div> */}

      {likedPosts.length === 0 && !isLoading && !error && (
        <p className="text-muted my-3 ms-2">Cet utilisateur n'a aimé aucun message pour le moment.</p>
      )}
      {likedPosts.map(post => (
        <PostItem
          key={post.id}
          post={post}
          author={post.user} // L'auteur du post liké
          onPostDeleted={handlePostDeletedInLikedList} // Gérer la suppression
          onPostActuallyUpdated={handlePostUpdatedInLikedList} // Gérer la mise à jour
        />
      ))}
    </>
  );
}