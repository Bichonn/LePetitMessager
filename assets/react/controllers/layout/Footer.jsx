import React from 'react';
import '../../../styles/widgetBar.css';

export default function Footer() {
    return (
        <div className="footer-container mt-auto mb-auto border-top border-dark position-absolute bottom-0 p-2 w-100">
            <div className="text-center">
                <h1 className="display-4 text-decoration-underline">Le Petit Messager</h1>
                <p className="text-muted">"La plume d'aujourd'hui écrit l'actualité de demain"</p>
            </div>
        </div>
    );
}