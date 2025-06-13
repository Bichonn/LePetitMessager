import React, { useState, useEffect } from 'react';
import '../../../../styles/RepostBtn.css';

const RepostBtn = ({ postId, initialReposted = false, repostsCount = 0 }) => {
    const [reposted, setReposted] = useState(initialReposted);
    const [count, setCount] = useState(repostsCount);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update state when props change
    useEffect(() => {
        setReposted(initialReposted);
        setCount(repostsCount);
    }, [initialReposted, repostsCount]);

    const handleRepostClick = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Store previous state for rollback if needed
        const previousReposted = reposted;
        const previousCount = count;

        // Optimistic UI update
        setReposted(!reposted);
        setCount(reposted ? count - 1 : count + 1);
        setFeedback('');

        try {
            const formData = new FormData();
            formData.append('post_id', postId);

            const response = await fetch('/reposts/toggle', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            const data = await response.json();

            if (response.ok) {
                // Update with server response
                setReposted(data.reposted);
                setCount(data.repostCount);
                // Notify other components of repost action
                const event = new CustomEvent('postReposted');
                document.dispatchEvent(event);
            } else {
                // Rollback optimistic update on error
                setReposted(previousReposted);
                setCount(previousCount);
                setFeedback(data.message || 'Erreur lors du repost');
            }
        } catch (err) {
            // Rollback on network error
            setReposted(previousReposted);
            setCount(previousCount);
            setFeedback('Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="repost-btn-wrapper d-flex align-items-center">
            <button
                className={`btn btn-repost ${reposted ? 'reposted' : ''}`}
                onClick={handleRepostClick}
                disabled={isSubmitting}
                title={reposted ? "Annuler le repost" : "Reposter"}
            >
                <img
                    src="/icons/repost.png"
                    alt="Repost"
                    className="icon"
                    style={{ width: '22px', height: '22px' }}
                />
            </button>
            <span className="repost-count-closer">{count}</span>
            {feedback && <span className="small text-danger ms-1">{feedback}</span>}
        </div>
    );
};

export default RepostBtn;