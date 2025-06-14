import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostItem from './post_tool/PostItem';

/**
 * Component that displays a paginated list of top posts with infinite scroll
 */
export default function TopPostsList() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // UI loading state
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [limit] = useState(20); // Number of posts to load per request
    const observer = useRef(); // For IntersectionObserver
    const fetchGuard = useRef(false); // Guard against concurrent fetches

    // Fetch top posts from API with pagination and concurrent fetch protection
    const fetchTopPosts = useCallback(async (pageToFetch, append = false) => {
        if (fetchGuard.current) { // Check the guard
            return;
        }
        fetchGuard.current = true; // Set the guard

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/posts/top-data?page=${pageToFetch}&limit=${limit}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
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
            console.error('Erreur complète fetchTopPosts:', err);
        } finally {
            setIsLoading(false);
            fetchGuard.current = false; // Release the guard
        }
    }, [limit]); // `limit` is stable. Setters from useState are stable and don't need to be listed.

    // Load initial top posts on component mount
    useEffect(() => {
        fetchTopPosts(1, false); // Initial fetch
    }, [fetchTopPosts]); // Now `fetchTopPosts` is stable, so this effect runs once on mount (if limit doesn't change)

    // IntersectionObserver for infinite scroll functionality
    const lastPostElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            // Load next page when last post becomes visible
            if (entries[0].isIntersecting && posts.length < totalPosts) {
                fetchTopPosts(currentPage + 1, true);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, posts.length, totalPosts, currentPage, fetchTopPosts]);

    // Handle post deletion by removing from local state
    const handlePostDeleted = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setTotalPosts(prevTotal => prevTotal - 1);
    };

    // Handle post updates by updating local state
    const handlePostUpdated = (updatedPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? { ...post, ...updatedPost } : post));
    };

    // Loading state on initial load
    if (posts.length === 0 && isLoading) return <div className="text-center p-3">Chargement des gros titres...</div>;
    
    // Error state when no posts loaded
    if (error && posts.length === 0) return <div className="alert alert-danger m-3">Erreur: {error}</div>;
    
    // Empty state when no posts available
    if (posts.length === 0 && !isLoading) return <div className="text-center p-3">Aucun gros titre à afficher pour le moment.</div>;

    return (
        <div>
            <h2 className="text-center p-3 text-decoration-underline border border-dark mb-0 inner-shadow"> Les Gros Titres</h2>
            {posts.map((post, index) => {
                const key = `${post.id}-${index}`; // Ensure unique key if post.id might not be unique during updates
                
                // Attach ref to last element to trigger loading
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastPostElementRef} key={key}>
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
                            key={key}
                            post={post}
                            author={post.user}
                            onPostDeleted={handlePostDeleted}
                            onPostActuallyUpdated={handlePostUpdated}
                        />
                    );
                }
            })}
            {/* Loading indicator for additional posts */}
            {isLoading && posts.length > 0 && <div className="text-center p-3">Chargement de plus de gros titres...</div>}
            
            {/* End of posts indicator */}
            {!isLoading && posts.length > 0 && posts.length >= totalPosts && <div className="text-center text-muted p-3">Vous avez vu tous les gros titres.</div>}
            
            {/* Error indicator for additional loading */}
            {error && posts.length > 0 && <div className="alert alert-warning mt-2">Erreur lors du chargement: {error}</div>}
        </div>
    );
}