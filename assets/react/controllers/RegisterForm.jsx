import React, { useState } from 'react';
import '../../styles/RegisterForm.css';

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
            setStatus('Compte créé avec succès !');
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
                            <div className="modal-header justify-content-center">
                                <h3 class="text-center mb-0">Devenez un Messager !</h3>
                                <button type="button" className="btn-close position-absolute end-0 me-3" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit} className="d-flex flex-column">
                                    <div className="mb-3">
                                        <label htmlFor="firstName" className="form-label text-decoration-underline">Prénom</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label text-decoration-underline">Nom</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label text-decoration-underline">Pseudo</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label text-decoration-underline">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label text-decoration-underline">Mot de passe</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <hr />
                                    <button type="submit" className="btn btn-primary mt-3">S'inscrire</button>
                                    {status && (
                                        <div className="status-message">
                                            « {status} »
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}