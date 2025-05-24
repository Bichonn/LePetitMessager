import React, { useState, useEffect } from 'react';
import PostItem from './post_tool/PostItem';

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/posts');

            // Vérifier si la réponse est OK
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            // Vérifier le type de contenu
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La réponse n\'est pas au format JSON');
            }

            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
            console.error('Erreur complète:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;
    if (posts.length === 0) return <div>Aucun post</div>;

    return (
        <div>
            {posts.map(post => (
                <PostItem key={post.id} post={post} author={post.user} />
            ))}
        </div>
    );
}