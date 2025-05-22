import React, { useState, useEffect } from 'react';
import '../../../styles/PostList.css';
import LikeBtn from './btn_post/LikeBtn';
import CommentBtn from './btn_post/CommentBtn';

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    // Fonctions utilitaires pour détecter le type de fichier
    const isImageFile = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
    };

    const isVideoFile = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov'].includes(extension);
    };

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
                <div key={post.id} className="border border-dark bg-color-search inner-shadow-post p-3">

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">
                            {post.user?.username || 'Anonyme'}
                        </h5>
                        <small className="text-muted">
                            {new Date(post.created_at).toLocaleString()}
                        </small>
                    </div>

                    <p className="card-text">{post.content_text}</p>

                    {post.content_multimedia && (
                        <div className="media-preview mt-2">
                            {isImageFile(post.content_multimedia) ? (
                                <>
                                    <img
                                        src={`/uploads/media/${post.content_multimedia}`}
                                        alt="Contenu partagé"
                                        className="img-fluid mb-2 w-25"
                                    />
                                </>
                            ) : isVideoFile(post.content_multimedia) ? (
                                <>
                                    <video
                                        src={`/uploads/media/${post.content_multimedia}`}
                                        controls
                                        className="img-fluid mb-2 w-75"
                                    />
                                </>
                            ) : null}
                        </div>
                    )}
                    <div className="d-flex justify-content-start align-items-center gap-3 mt-2">
                        <LikeBtn />
                        <CommentBtn />
                    </div>
                </div>
            ))}
        </div>
    );
}