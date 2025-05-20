import React, { useState, useEffect } from 'react';
import '../../../styles/LoginForm.css';

export default function LoginForm() {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);

    const [tokenError, setTokenError] = useState(false);

    // Récupérer le token CSRF au chargement du modal
    useEffect(() => {
        if (showModal) {
            setTokenError(false);
            fetch('/get-csrf-token')
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch CSRF token');
                    return response.json();
                })
                .then(data => {
                    if (data.token) {
                        setCsrfToken(data.token);
                    } else {
                        setTokenError(true);
                        console.error('CSRF token not found in response');
                    }
                })
                .catch(error => {
                    setTokenError(true);
                    console.error('Error fetching CSRF token:', error);
                });
        }
    }, [showModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setStatus('Connexion en cours...');

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('_csrf_token', csrfToken);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            

            if (response.ok) {
                setStatus('Connexion réussie!');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                try {
                    const data = await response.json();
                    setError(data.message || 'Échec de la connexion');
                    setStatus('');
                } catch (e) {
                    setError('Identifiants invalides');
                    setStatus('');
                }
            }
        } catch (error) {
            setError('Erreur de connexion au serveur');
            setStatus('');
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
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label text-decoration-underline">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label text-decoration-underline">Mot de passe</label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <input type="hidden" name="_csrf_token" value={csrfToken} />

                                    <button type="submit" className="btn btn-primary mt-3" disabled={!csrfToken}>
                                        Se connecter
                                    </button>

                                    {status && (
                                        <div className="alert alert-info mt-3">{status}</div>
                                    )}

                                    {tokenError && (
                                        <div className="alert alert-danger mb-3">
                                            Impossible de récupérer le token de sécurité. Veuillez rafraîchir la page.
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