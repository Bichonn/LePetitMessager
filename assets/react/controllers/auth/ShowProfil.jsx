import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import PostItem from '../posts/post_tool/PostItem';

export default function ShowProfil() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/user`);
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      const fetchUserPosts = async () => {
        setPostsLoading(true);
        setPostsError(null);
        try {
          const response = await fetch(`/posts`); // Fetches all posts
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la récupération des posts`);
          }
          const allPosts = await response.json();
          // Filter posts for the current user and sort by date (newest first)
          const filteredPosts = allPosts
            .filter(post => post.user && post.user.id === user.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setUserPosts(filteredPosts);
        } catch (err) {
          setPostsError(err.message);
        } finally {
          setPostsLoading(false);
        }
      };
      fetchUserPosts();
    }
  }, [user]); // Re-run when user data is available

  if (isLoading) return <div className="text-center mt-4">Chargement du profil...</div>;
  if (error) return <div className="text-danger mt-4">Erreur profil: {error}</div>;
  if (!user) return <div className="mt-4">Utilisateur non trouvé</div>;

  return (
    <>
      <div className="container p-4 profil-container shadow border-start border-bottom border-end border-dark bg-color-search">
        {/* En-tête profil */}
        <div className="d-flex align-items-center mb-4">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt="avatar"
            className="rounded-circle profil-avatar me-4"
          />
          <div>
            <h3 className="mb-1 fw-bold fst-italic">
              {user.username} <i className="bi bi-lock-fill"></i>
            </h3>
            <p className="text-muted fst-italic mb-2">
              {user.first_name} {user.last_name} --{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {/* Bio */}
        {user.bio && (
          <p className="fst-italic mb-5">
            {user.bio}
          </p>
        )}
      </div>

      {/* Message(s) Récent */}
      <div className="container p-2 shadow border border-dark">
        <h3 className="fw-bold">Message(s) Récent :</h3>
      </div>

      {postsLoading && <div className="text-center my-3">Chargement des posts...</div>}
      {postsError && <div className="text-danger my-3">Erreur lors du chargement des posts: {postsError}</div>}
      {!postsLoading && !postsError && userPosts.length === 0 && (
        <p className="text-muted my-3">Cet utilisateur n'a pas encore posté de message.</p>
      )}
      {!postsLoading && !postsError && userPosts.map(post => (
        <PostItem key={post.id} post={post} author={user} />
      ))}

    </>
  );
}