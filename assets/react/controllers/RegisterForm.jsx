import React, { useState } from 'react';

export default function RegisterForm() {
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', username: '' });
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        if (res.ok) {
            setStatus('Compte créé !');
        } else {
            const errorText = await res.text();
            setStatus('Erreur : ' + errorText);

        }
    };

    return (
        <>
            {/* Bouton pour ouvrir la modal */}
            <button className="custom-register-button" onClick={() => setShowModal(true)}>
                S'inscrire
            </button>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <input type="text" name="firstName" placeholder="Prénom" onChange={handleChange} />
                                    <input type="text" name="lastName" placeholder="Nom" onChange={handleChange} />
                                    <input type="text" name="username" placeholder="Pseudo" onChange={handleChange} />
                                    <input type="email" name="email" placeholder="Email" onChange={handleChange} />
                                    <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} />
                                    <button type="submit" className="btn btn-primary mt-3">S'inscrire</button>
                                    <p>{status}</p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
// This code defines a React component for a registration form. It uses the useState hook to manage form data and submission status. The handleChange function updates the form state when input fields change, and handleSubmit sends the form data to the server when the form is submitted. The response status is displayed to the user.