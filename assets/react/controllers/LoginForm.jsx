import React, { useState } from 'react';
import '../../styles/LoginForm.css';
import RegisterForm from './RegisterForm';

export default function LoginForm() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                setStatus('Connexion réussie !');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                setStatus('Identifiants invalides');
            }
        } catch (error) {
            setStatus('Erreur de connexion');
        }
    };

    return (
        <>
            <button className="custom-login-button" onClick={() => setShowModal(true)}>
                Se connecter
            </button>

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header rounded-0 justify-content-center">
                                <h3 className="text-center mb-0">Connexion</h3>
                                <button type="button" className="btn-close position-absolute end-0 me-3" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit} className="d-flex flex-column">
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
                                    <button type="submit" className="btn btn-primary mt-3">Se connecter</button>
                                    {status && (
                                        <div className="status-message">
                                            « {status} »
                                        </div>
                                    )}

                                    <p className="mt-4 fw-semibold text-center">
                                        Nouveau sur Le Petit Messager ?<br />
                                        <span className="text-muted">Créez un compte gratuitement pour rejoindre la communauté&nbsp;!</span>
                                    </p>
                                    <RegisterForm />

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}