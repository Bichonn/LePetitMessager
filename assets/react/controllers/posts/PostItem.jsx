import React from 'react';
import IsImageFile from './media_helpers/IsImageFile';
import IsVideoFile from './media_helpers/IsVideoFile';
import LikeBtn from './btn_post/LikeBtn';
import CommentBtn from './btn_post/CommentBtn';
import '../../../styles/PostItem.css';

export default function PostItem({ post, author }) {
    if (!post || !author) {
        return null;
    }

    return (
        <div className="post-item-container border border-dark bg-color-search p-3">
            <div className="d-flex align-items-center ms-7">
                <img
                    src={author.avatar_url || '/default-avatar.png'}
                    alt="avatar"
                    className="avatar rounded-circle me-2"
                />
                <span className="fw-semibold">{author.username}</span>
                <span className="text-muted ms-3">
                    {new Date(post.created_at).toLocaleDateString()} à {new Date(post.created_at).toLocaleTimeString()}
                </span>
            </div>
            <div className="ms-6">
                <p className="mb-1">{post.content_text}</p>
                {post.content_multimedia && (
                    <div className="media-preview mt-2 mb-3">
                        <IsImageFile filename={post.content_multimedia} />
                        <IsVideoFile filename={post.content_multimedia} />
                    </div>
                )}
            </div>
        </div>
    );
}