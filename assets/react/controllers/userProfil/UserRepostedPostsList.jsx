import React, { useState, useEffect, useCallback } from 'react';
import PostItem from '../posts/post_tool/PostItem'; // Adjust path as necessary

/**
 * Component that displays a user's reposted posts
 */
export default function UserRepostedPostsList({ user }) {
  const [repostedPosts, setRepostedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's reposted posts from API
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

  // Load reposted posts when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchRepostedPosts(user.id);
    } else {
      // Reset state when no user provided
      setRepostedPosts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user, fetchRepostedPosts]);

  // Handle post deletion by removing from local state
  const handlePostDeletedInRepostedList = (postId) => {
    setRepostedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  // Handle post updates by updating local state
  const handlePostUpdatedInRepostedList = (updatedPost) => {
    setRepostedPosts(prevPosts => prevPosts.map(post =>
      post.id === updatedPost.id ? { ...post, ...updatedPost } : post
    ));
  };

  // Loading state
  if (isLoading) return <div className="text-center my-3">Chargement des posts republiés...</div>;
  
  // Error state
  if (error && user) return <div className="alert alert-danger my-3 mx-2">Erreur lors du chargement des posts republiés: {error}</div>;

  return (
    <>
      {/* Empty state when no reposted posts */}
      {repostedPosts.length === 0 && !isLoading && !error && (
        <p className="text-muted my-3 ms-2">Cet utilisateur n'a republié aucun message pour le moment.</p>
      )}
      {/* Render reposted posts list */}
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