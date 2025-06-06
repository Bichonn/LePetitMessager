import React, { useState } from 'react';
import '../../../../styles/app.css';

const FollowBtn = ({ userId, initialFollowed = false }) => {
    const [followed, setFollowed] = useState(initialFollowed);
    const [feedback, setFeedback] = useState('');

    const handleFollowClick = async () => {
        try {
            const formData = new FormData();
            formData.append('following_id', userId);

            const response = await fetch('/follows/add', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            const data = await response.json();
            if (response.ok) {
                if (typeof data.followed !== "undefined") {
                    setFollowed(data.followed);
                }
                setFeedback('');
            } else {
                setFeedback(data.message || 'Erreur lors du suivi');
            }
        } catch (err) {
            setFeedback('Erreur de connexion');
        }
    };

    return (
        <div>
            <button
                className={`btn btn-primary mt-2${followed ? 'active' : ''}`}
                onClick={handleFollowClick}
                title={followed ? "Se désabonner" : "Suivre"}
            >
                {followed ? "Abonné" : "Suivre"}
            </button>
        </div>
    );
};

export default FollowBtn;