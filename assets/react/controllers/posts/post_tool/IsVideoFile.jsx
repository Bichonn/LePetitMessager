import React from 'react';
import '../../../../styles/PostItem.css';

export default function IsVideoFile({ filename }) {
    if (!filename) {
        return null;
    }

    const extension = filename.split('.').pop().toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];

    if (videoExtensions.includes(extension)) {
        return (
            <video
                src={filename}
                controls
                className="img-fluid style-video"
            >
                Votre navigateur ne supporte pas la balise vidéo.
            </video>
        );
    }

    return null;
}