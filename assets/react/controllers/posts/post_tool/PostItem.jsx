import React, { useState, useEffect } from 'react';
import IsImageFile from './IsImageFile';
import IsVideoFile from './IsVideoFile';
import LikeBtn from '../btn_post/LikeBtn';
import CommentBtn from '../btn_post/CommentBtn';
import SaveBtn from '../btn_post/SaveBtn';
import RepostBtn from '../btn_post/RepostBtn';
import UpdateBtn from '../btn_post/UpdateBtn';
import DeleteBtn from '../btn_post/DeleteBtn';
import UpdatePost from '../UpdatePost';
import ReportPostBtn from '../btn_post/ReportPostBtn'; // Add this import
import '../../../../styles/PostItem.css';

// Fonction pour formater la date en format relatif
const formatRelativeTime = (dateString) => {
    const now = new Date();
    let postDate = new Date(dateString);
    
    // Vérifier si les dates sont valides
    if (isNaN(postDate.getTime())) {
        return "Date invalide";
    }
    
    const diffInMs = now - postDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    
    // Si la date est dans le futur ou la différence est négative
    if (diffInSeconds < 0) {
        return "À l'instant";
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 30) {
        return "À l'instant";
    } else if (diffInMinutes < 1) {
        return `il y a ${diffInSeconds}s`;
    } else if (diffInMinutes < 60) {
        return `il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
        return `il y a ${diffInHours}h`;
    } else if (diffInDays < 7) {
        return `il y a ${diffInDays}j`;
    } else {
        // Pour les dates plus anciennes, afficher la date complète
        return postDate.toLocaleDateString('fr-FR');
    }
};

export default function PostItem({ post, author, onPostDeleted, onPostActuallyUpdated }) {
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    // const [showCommentForm, setShowCommentForm] = useState(false); // Supprimé - géré par RightSidebarArea

    useEffect(() => {
        fetch('/user')
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && data.id) {
                    setCurrentUserId(data.id);
                }
            })
            .catch(err => console.error("Failed to fetch current user for PostItem:", err));
    }, []);

    if (!post || !author) {
        return null;
    }

    const handleUpdateClick = () => {
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
    };

    const handlePostUpdated = (updatedPostData) => {
        setIsUpdateModalOpen(false);
        if (onPostActuallyUpdated) {
            onPostActuallyUpdated(updatedPostData);
        }
    };

    const handleDeleteClick = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.')) {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            try {
                const response = await fetch(`/post/${post.id}/delete`, {
                    method: 'DELETE',
                    headers: token ? { 'X-CSRF-TOKEN': token } : {},
                });

                if (response.ok) {
                    if (onPostDeleted) {
                        onPostDeleted(post.id);
                    }
                } else {
                    const errorData = await response.json();
                    alert(`Erreur lors de la suppression: ${errorData.message || 'Erreur inconnue'}`);
                }
            } catch (error) {
                alert(`Erreur de connexion: ${error.message}`);
            }
        }
    };

    const handleCommentButtonClick = (postId) => {
        const event = new CustomEvent('showPostCommentsInSidebar', { detail: { postId: postId } });
        document.dispatchEvent(event);
    };

    const canUpdate = author && currentUserId && author.id === currentUserId;
    const canDelete = author && currentUserId && author.id === currentUserId;
    const userProfileUrl = `/profil/view/${author.id}`;
    const { reposter_info } = post; // Destructure reposter_info from post

    // Determine if the report button should be shown (not own post and user is logged in)
    const showReportButton = currentUserId && author && author.id !== currentUserId;

    return (
        <>
            <div className="post-item-container border border-dark bg-color-search p-1">
                {/* Display Reposter Info if available */}
                {reposter_info && (
                    <div className="reposter-info mb-1 ms-2" style={{ fontSize: '0.85em', color: 'var(--bs-secondary-color)' }}>
                        <small>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-arrow-repeat me-1" viewBox="0 0 16 16">
                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.5A5.002 5.002 0 0 0 8 3zM3.5 9A5.002 5.002 0 0 0 8 13c1.552 0 2.94-.707 3.857-1.818a.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.5z" />
                            </svg>
                            Republié par <a href={`/profil/view/${reposter_info.id}`} className="text-decoration-none fw-bold" style={{ color: 'inherit' }}>{reposter_info.username}</a>
                        </small>
                    </div>
                )}

                <div className="d-flex align-items-center ms-7">
                    <img
                        src={author.avatar_url || 'icons/default-avatar.png'}
                        alt={`${author.username}'s avatar`}
                        className="rounded-circle me-2 post-author-avatar border border-dark"
                    />
                    <div className="flex-grow-1">
                        <h5 className="mb-0">
                            <a href={userProfileUrl} className="text-decoration-none text-dark fw-bold">
                                {author.username}
                                {author.user_premium && (
                                    <img
                                        src="/icons/badge.svg"
                                        alt="Premium"
                                        title="Utilisateur Premium"
                                        className="ms-2"
                                        style={{ width: 16, height: 16, verticalAlign: 'middle' }}
                                    />
                                )}
                            </a>
                        </h5>
                        <small className="text-muted">
                            {formatRelativeTime(post.created_at)}
                        </small>
                    </div>
                    {showReportButton && (
                        <ReportPostBtn postId={post.id} postAuthorUsername={author.username} />
                    )}
                </div>
                <div className="ms-6">
                    <div>
                        <div className="flex-grow-1 text-content-area">
                            <p>{post.content_text}</p>
                        </div>
                        {post.content_multimedia && (
                            <div className="media-preview mt-2">
                                <IsImageFile filename={post.content_multimedia} />
                                <IsVideoFile filename={post.content_multimedia} />
                            </div>
                        )}
                    </div>
                    {post.hashtags && post.hashtags.length > 0 && (
                        <div className="mt-2">
                            {post.hashtags.map(tag => (
                                <span key={tag.id} className="badge bg-warning text-dark me-1">#{tag.content}</span>
                            ))}
                        </div>
                    )}
                    <div className="d-flex justify-content-between mt-2">
                        <div className="d-flex justify-content-start align-items-center">
                            <LikeBtn
                                postId={post.id}
                                initialLiked={post.liked_by_user}
                                likesCount={post.likes_count} />
                            <CommentBtn
                                postId={post.id}
                                onClick={() => handleCommentButtonClick(post.id)}
                                commentsCount={post.comments_count} // Add this prop
                            />
                            <RepostBtn
                                postId={post.id}
                                initialReposted={post.reposted_by_user}
                                repostsCount={post.reposts_count}
                            />
                            <SaveBtn
                                postId={post.id}
                                initialFavoris={post.favoris_by_user}
                            />
                        </div>
                        <div className="d-flex justify-content-end">
                            {canUpdate && (
                                <UpdateBtn onClick={handleUpdateClick} />
                            )}
                            {canDelete && (
                                <DeleteBtn onClick={handleDeleteClick} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isUpdateModalOpen && canUpdate && (
                <UpdatePost
                    postId={post.id}
                    initialContent={post.content_text}
                    initialMediaUrl={post.content_multimedia} // Directly use the Cloudinary URL
                    initialMediaFilename={post.content_multimedia ? post.content_multimedia.split('/').pop() : null} // Filename part for display, if needed
                    onClose={handleCloseUpdateModal}
                    onUpdated={handlePostUpdated}
                />
            )}
        </>
    );
}