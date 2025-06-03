import React, { useState } from 'react';
import '../../../../styles/LikeBtn.css';

const LikeBtn = ({ postId, initialLiked = false, likesCount = 0 }) => {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(likesCount);
    const [feedback, setFeedback] = useState('');

    const handleLikeClick = async () => {
        // Garder une copie de l'état précédent pour pouvoir annuler en cas d'erreur
        const previousLiked = liked;
        const previousCount = count;

        // Mise à jour optimiste de l'UI
        if (liked) {
            setLiked(false);
            setCount(count - 1);
        } else {
            setLiked(true);
            setCount(count + 1);
        }
        setFeedback(''); // Réinitialiser le feedback

        try {
            const formData = new FormData();
            formData.append('post_id', postId);

            const response = await fetch('/likes/add', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({})); // Gérer le cas où la réponse d'erreur n'est pas JSON
                // Annuler la mise à jour optimiste en cas d'erreur
                setLiked(previousLiked);
                setCount(previousCount);
                setFeedback(data.message || 'Erreur lors du like');
            }
            // Si la réponse est ok, la mise à jour optimiste était correcte, rien de plus à faire.
            // La réponse du serveur confirme l'action, mais l'UI est déjà à jour.
        } catch (err) {
            // Annuler la mise à jour optimiste en cas d'erreur de connexion
            setLiked(previousLiked);
            setCount(previousCount);
            setFeedback('Erreur de connexion');
        }
    };

    return (
        <div className="like-btn-wrapper d-flex align-items-center">
            <button
                className={`btn ${liked ? 'liked' : ''}`}
                onClick={handleLikeClick}
                title={liked ? "Retirer le like" : "Liker"}
            >
                <svg
                    className="icon"
                    width={30}
                    height={30}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill={liked ? "#fd1853" : "none"}
                    stroke={liked ? "none" : "currentColor"}
                    strokeWidth="1"
                >
                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                </svg>
            </button>
            <span className="ms-n3">{count}</span>
        </div>
    );
}

export default LikeBtn;