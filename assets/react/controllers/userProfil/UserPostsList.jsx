import React, { useState, useEffect } from 'react';
import PostItem from '../posts/post_tool/PostItem';

/**
 * Component that displays a user's own posts
 */
export default function UserPostsList({ user }) { // Expects user object from profile
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false); // Initially false, activated by fetchUserPosts
  const [postsError, setPostsError] = useState(null);

  // Fetch user's posts from API
  const fetchUserPosts = async (userId) => {
    if (!userId) {
      setUserPosts([]);
      setPostsLoading(false);
      return;
    }
    setPostsLoading(true);
    setPostsError(null);
    try {
      // Call the new endpoint for user-specific posts
      const response = await fetch(`/users/${userId}/posts`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Handle case where error response is not JSON
        throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la récupération des posts de l'utilisateur`);
      }
      const userSpecificPosts = await response.json();
      // No need to filter here, backend already does it
      // Sorting is also done by backend
      setUserPosts(userSpecificPosts);
    } catch (err) {
      console.error("Erreur détaillée fetchUserPosts:", err);
      setPostsError(err.message);
      setUserPosts([]); // Clear posts on error
    } finally {
      setPostsLoading(false);
    }
  };

  // Load user posts when user changes and listen for global post creation events
  useEffect(() => {
    if (user && user.id) {
      fetchUserPosts(user.id);
    } else {
      setUserPosts([]);
      setPostsLoading(false);
      setPostsError(null);
    }

    // Listen for new posts to refresh user's posts list
    const handleGlobalPostCreated = () => {
      if (user && user.id) {
        fetchUserPosts(user.id); // Reload posts for this user
      }
    };
    document.addEventListener('postCreated', handleGlobalPostCreated);

    return () => {
      document.removeEventListener('postCreated', handleGlobalPostCreated);
    };
  }, [user]); // Re-runs if user object changes

  // Handle post deletion by removing from local state
  const handlePostDeleted = (postId) => {
    setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  // Handle post updates by updating local state
  const handlePostUpdated = (updatedPost) => {
    setUserPosts(prevPosts => prevPosts.map(post =>
      post.id === updatedPost.id ? { ...updatedPost, user: user } : post
    ));
  };

  // Loading state
  if (postsLoading) return <div className="text-center my-3">Chargement des posts...</div>;
  
  // Error state - only show if user exists and we actually tried to load
  if (postsError && user) return <div className="text-danger my-3">Erreur lors du chargement des posts: {postsError}</div>;

  return (
    <>
      {/* Empty state when user has no posts */}
      {user && userPosts.length === 0 && !postsLoading && !postsError && (
        <p className="text-muted my-3 ms-2">Cet utilisateur n'a pas encore posté de message.</p>
      )}
      {/* Render user's posts list */}
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