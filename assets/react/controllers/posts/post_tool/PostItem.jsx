import React, { useState, useEffect } from 'react';
import IsImageFile from './IsImageFile';
import IsVideoFile from './IsVideoFile';
import LikeBtn from '../btn_post/LikeBtn';
import CommentBtn from '../btn_post/CommentBtn';
import UpdateBtn from '../btn_post/UpdateBtn';
import DeleteBtn from '../btn_post/DeleteBtn';
import UpdatePost from '../UpdatePost';
import ShareBtn from '../btn_post/ShareBtn';
import '../../../../styles/PostItem.css';

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
    const userProfileUrl = `/profil/view/${author.username}`;

    return (
        <>
            <div className="post-item-container border border-dark bg-color-search p-1">
                <div className="d-flex align-items-center ms-7">
                    <img
                        src={author.avatar_url || '/default-avatar.png'}
                        alt={`${author.username}'s avatar`}
                        className="rounded-circle me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                        <h5 className="mb-0">
                            <a href={userProfileUrl} className="text-decoration-none text-dark fw-bold">
                                {author.username}
                            </a>
                        </h5>
                        <small className="text-muted">
                            {new Date(post.created_at).toLocaleString()}
                        </small>
                    </div>
                </div>
                <div className="ms-6">
                    <p>{post.content_text}</p>
                    {post.content_multimedia && (
                        <div className="media-preview">
                            <IsImageFile filename={post.content_multimedia} />
                            <IsVideoFile filename={post.content_multimedia} />
                        </div>
                    )}
                    <div className="d-flex justify-content-between">
                        <div className="d-flex justify-content-start">
                            <LikeBtn
                                postId={post.id}
                                initialLiked={post.liked_by_user}
                                likesCount={post.likes_count} />
                            <CommentBtn postId={post.id} onClick={() => handleCommentButtonClick(post.id)} />
                            {canUpdate && (
                                <UpdateBtn onClick={handleUpdateClick} />
                            )}
                            {canDelete && (
                                <DeleteBtn onClick={handleDeleteClick} />
                            )}
                        </div>
                        <div className="d-flex justify-content-end">
                            <ShareBtn />
                        </div>
                    </div>

                    {/* Supprimé: Le formulaire de commentaire et la liste sont maintenant dans RightSidebarArea */}
                    {/* {showCommentForm && (
                        <div>
                            <CommentForm postId={post.id} onCommentAdded={() => setShowCommentForm(false)} />
                        </div>
                    )}
                    <CommentsList postId={post.id} /> */}
                </div>
            </div>

            {isUpdateModalOpen && canUpdate && (
                <UpdatePost
                    postId={post.id}
                    initialContent={post.content_text}
                    initialMediaUrl={post.content_multimedia ? `/uploads/media/${post.content_multimedia}` : null}
                    initialMediaFilename={post.content_multimedia}
                    onClose={handleCloseUpdateModal}
                    onUpdated={handlePostUpdated}
                />
            )}
        </>
    );
}