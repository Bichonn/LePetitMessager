import React, { useState, useEffect, useCallback } from 'react';
import PostItem from '../posts/post_tool/PostItem'; // Adjust path as necessary

export default function UserRepostedPostsList({ user }) {
  const [repostedPosts, setRepostedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepostedPosts = useCallback(async (userId) => {
    if (!userId) {
      setRepostedPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/users/${userId}/reposted-posts`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la récupération des posts republiés`);
      }
      const posts = await response.json();
      setRepostedPosts(posts);
    } catch (err) {
      console.error("Erreur détaillée fetchRepostedPosts:", err);
      setError(err.message);
      setRepostedPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchRepostedPosts(user.id);
    } else {
      setRepostedPosts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user, fetchRepostedPosts]);

  const handlePostDeletedInRepostedList = (postId) => {
    setRepostedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handlePostUpdatedInRepostedList = (updatedPost) => {
    setRepostedPosts(prevPosts => prevPosts.map(post =>
      post.id === updatedPost.id ? { ...post, ...updatedPost } : post
    ));
  };

  if (isLoading) return <div className="text-center my-3">Chargement des posts republiés...</div>;
  if (error && user) return <div className="alert alert-danger my-3 mx-2">Erreur lors du chargement des posts republiés: {error}</div>;

  return (
    <>
      {repostedPosts.length === 0 && !isLoading && !error && (
        <p className="text-muted my-3 ms-2">Cet utilisateur n'a republié aucun message pour le moment.</p>
      )}
      {repostedPosts.map(post => (
        <PostItem
          key={`${post.id}-${post.repost_created_at}`} // Unique key including repost date
          post={post} // This object from API now includes `reposter_info`
          author={post.user} // Original author of the post
          onPostDeleted={handlePostDeletedInRepostedList}
          onPostActuallyUpdated={handlePostUpdatedInRepostedList}
        />
      ))}
    </>
  );
}