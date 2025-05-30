import React from 'react';
import '../../../../styles/PostItem.css';

export default function IsImageFile({ filename }) {
    if (!filename) {
        return null;
    }

    const extension = filename.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

    if (imageExtensions.includes(extension)) {
        return (
            <img
                src={filename}
                alt="Post media"
                className="img-fluid style-image"
            />
        );
    }

    return null;
}