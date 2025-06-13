import React, { useState } from "react";

export default function NavIcons({ iconPath, iconName, className = "" }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        // Container for the navigation icon
        <div className="position-relative d-flex flex-column align-items-center mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Icon image */}
            <img className={`img-fluid w-25 ${className}`} src={iconPath} alt={iconName} />

            {/* Icon name displayed when hovered */}
            {isHovered && (
                <span className="position-absolute">
                    <h6 className="icon-name-appear m-0"><strong>{iconName}</strong></h6>
                </span>
            )}
        </div>
    );
}