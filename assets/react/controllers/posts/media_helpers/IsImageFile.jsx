import React from 'react';
import '../../../../styles/PostItem.css';

// Ce composant accepte 'filename' comme prop.
export default function IsImageFile({ filename }) {
    if (!filename) {
        return null;
    }

    const extension = filename.split('.').pop().toLowerCase();
    // Ajoutez d'autres extensions d'image si nécessaire
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

    if (imageExtensions.includes(extension)) {
        return (
            <img
                src={`/uploads/media/${filename}`}
                alt="Post media"
                className="img-fluid style-image"
            />
        );
    }

    return null; // Ne rien rendre si ce n'est pas une image
}