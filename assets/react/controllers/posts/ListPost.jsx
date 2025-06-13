import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostItem from './post_tool/PostItem';

/**
 * Component that displays a paginated list of posts with infinite scroll
 */
export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [limit] = useState(20); // Number of posts to load per request
    const observer = useRef(); // For IntersectionObserver

    // Fetch posts from API with pagination
    const fetchPosts = useCallback(async (pageToFetch, append = false) => {
        if (isLoading) return; // Prevent multiple simultaneous fetches
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/posts?page=${pageToFetch}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }
            
            // Validate JSON response
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La réponse n\'est pas au format JSON');
            }
            
            const data = await response.json();

            // Either append to existing posts or replace them
            setPosts(prevPosts => append ? [...prevPosts, ...data.posts] : data.posts);
            setTotalPosts(data.totalPosts);
            setCurrentPage(data.currentPage);
        } catch (err) {
            setError(err.message);
            console.error('Erreur complète:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, limit]);

    // Load initial posts on component mount
    useEffect(() => {
        fetchPosts(1, false);
    }, [limit]);

    // Listen for post creation events to refresh the list
    useEffect(() => {
        const handlePostCreated = () => {
            fetchPosts(1, false); // Reload first page to show new post at top
        };
        document.addEventListener('postCreated', handlePostCreated);
        return () => {
            document.removeEventListener('postCreated', handlePostCreated);
        };
    }, [fetchPosts]);

    // Listen for post repost events to refresh the list
    useEffect(() => {
        const handlePostReposted = () => {
            fetchPosts(1, false); // Reload first page to show reposted post at top
        };
        document.addEventListener('postReposted', handlePostReposted);
        return () => {
            document.removeEventListener('postReposted', handlePostReposted);
        };
    }, [fetchPosts]);

    // IntersectionObserver for infinite scroll functionality
    const lastPostElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            // Load next page when last post becomes visible
            if (entries[0].isIntersecting && posts.length < totalPosts) {
                fetchPosts(currentPage + 1, true);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, posts.length, totalPosts, currentPage, fetchPosts]);

    // Handle post deletion by removing from local state
    const handlePostDeleted = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setTotalPosts(prevTotal => prevTotal - 1);
    };

    // Handle post updates by updating local state
    const handlePostUpdated = (updatedPost) => {
        setPosts(prevPosts => prevPosts.map(post => 
            post.id === updatedPost.id ? { ...post, ...updatedPost } : post
        ));
    };

    // Loading state on initial load
    if (posts.length === 0 && isLoading) return <div className="text-center p-3">Chargement des messages...</div>;
    
    // Error state when no posts loaded
    if (error && posts.length === 0) return <div className="alert alert-danger">Erreur: {error}</div>;
    
    // Empty state when no posts available
    if (posts.length === 0 && !isLoading) return <div className="text-center p-3">Aucun message à afficher pour le moment.</div>;

    return (
        <div>
            {posts.map((post, index) => {
                // Attach ref to last element to trigger loading
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastPostElementRef} key={post.id}>
                            <PostItem
                                post={post}
                                author={post.user}
                                onPostDeleted={handlePostDeleted}
                                onPostActuallyUpdated={handlePostUpdated}
                            />
                        </div>
                    );
                } else {
                    return (
                        <PostItem
                            key={post.id}
                            post={post}
                            author={post.user}
                            onPostDeleted={handlePostDeleted}
                            onPostActuallyUpdated={handlePostUpdated}
                        />
                    );
                }
            })}
            {/* Loading indicator for additional posts */}
            {isLoading && posts.length > 0 && <div className="text-center p-3">Chargement de plus de messages...</div>}
            
            {/* End of posts indicator */}
            {!isLoading && posts.length > 0 && posts.length >= totalPosts && <div className="text-center text-muted p-3">Vous avez vu tous les messages.</div>}
            
            {/* Error indicator for additional loading */}
            {error && <div className="alert alert-warning mt-2">Erreur lors du chargement de messages supplémentaires: {error}</div>}
        </div>
    );
}