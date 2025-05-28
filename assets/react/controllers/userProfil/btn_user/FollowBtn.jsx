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
                setFollowed(!followed);
            } else {
            }
        } catch (err) {
            setFeedback('Erreur de connexion');
        }
    };

    return (
        <div className="follow-btn-wrapper d-flex align-items-center">
            <button
                className={`btn ${followed ? 'btn-secondary' : 'btn-outline-primary'}`}
                onClick={handleFollowClick}
                title={followed ? "Se désabonner" : "Suivre"}
            >
                {followed ? "Abonné" : "Suivre"}
            </button>
        </div>
    );
};

export default FollowBtn;