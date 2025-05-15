import React, { useState } from "react";

export default function NavIcons({ iconPath, iconName }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="position-relative d-flex flex-column align-items-center mb-5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img className="img-fluid w-50" src={iconPath} alt={iconName} />

            {isHovered && (
                <span className="position-absolute top-100 mt-1">
                    <h6 className="icon-name-appear"><strong>{iconName}</strong></h6>
                </span>
            )}
        </div>
    );
}