import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostItem from './post_tool/PostItem'; // Assurez-vous que le chemin est correct

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Initialement false, sera true pendant les fetches
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [limit] = useState(20); // Charger 20 posts à la fois
    const observer = useRef(); // Pour IntersectionObserver

    const fetchPosts = useCallback(async (pageToFetch, append = false) => {
        if (isLoading) return; // Empêche les fetches multiples simultanés
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/posts?page=${pageToFetch}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La réponse n\'est pas au format JSON');
            }
            const data = await response.json();

            setPosts(prevPosts => append ? [...prevPosts, ...data.posts] : data.posts);
            setTotalPosts(data.totalPosts);
            setCurrentPage(data.currentPage); // Mettre à jour la page actuelle avec celle retournée par l'API
        } catch (err) {
            setError(err.message);
            console.error('Erreur complète:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, limit]); // Ajout de isLoading et limit comme dépendances

    // Chargement initial des posts
    useEffect(() => {
        fetchPosts(1, false); // Charger la première page, ne pas ajouter
    }, [limit]); // Déclencher seulement si limit change (ce qui ne devrait pas arriver souvent)

    // Gestion de la création de post
    useEffect(() => {
        const handlePostCreated = () => {
            fetchPosts(1, false); // Recharger la première page pour voir le nouveau post en haut
        };
        document.addEventListener('postCreated', handlePostCreated);
        return () => {
            document.removeEventListener('postCreated', handlePostCreated);
        };
    }, [fetchPosts]); // fetchPosts est maintenant dans useCallback

    // Gestion du repost de post
    useEffect(() => {
        const handlePostReposted = () => {
            fetchPosts(1, false); // Recharger la première page pour voir le post reposté en haut
        };
        document.addEventListener('postReposted', handlePostReposted);
        return () => {
            document.removeEventListener('postReposted', handlePostReposted);
        };
    }, [fetchPosts]); // fetchPosts est dans useCallback

    // IntersectionObserver pour le chargement infini
    const lastPostElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && posts.length < totalPosts) {
                fetchPosts(currentPage + 1, true); // Charger la page suivante et ajouter les posts
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, posts.length, totalPosts, currentPage, fetchPosts]);

    const handlePostDeleted = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setTotalPosts(prevTotal => prevTotal - 1);
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? { ...post, ...updatedPost } : post));
    };

    if (posts.length === 0 && isLoading) return <div className="text-center p-3">Chargement des postes...</div>;
    if (error && posts.length === 0) return <div className="alert alert-danger">Erreur: {error}</div>;
    if (posts.length === 0 && !isLoading) return <div className="text-center p-3">Aucun message à afficher pour le moment.</div>;

    return (
        <div>
            {posts.map((post, index) => {
                // Attacher la ref au dernier élément pour déclencher le chargement
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
            {isLoading && posts.length > 0 && <div className="text-center p-3">Chargement de plus de postes...</div>}
            {!isLoading && posts.length > 0 && posts.length >= totalPosts && <div className="text-center text-muted p-3">Vous avez vu tous les messages.</div>}
            {error && <div className="alert alert-warning mt-2">Erreur lors du chargement de messages supplémentaires: {error}</div>}
        </div>
    );
}