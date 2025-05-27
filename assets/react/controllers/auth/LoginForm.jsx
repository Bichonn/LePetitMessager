import React, { useState, useEffect } from 'react';
import '../../../styles/formStyle.css';
import '../../../styles/app.css';

export default function LoginForm() {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState({
        email: null,
        password: null,
        general: null
    });

    const [tokenError, setTokenError] = useState(false);

    // Récupérer le token CSRF au chargement du modal
    useEffect(() => {
        if (showModal) {
            setTokenError(false);
            setErrors({ email: null, password: null, general: null });
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
        setErrors({ email: null, password: null, general: null });
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
                    setStatus('');
                    if (data.message) {
                        if (data.message.toLowerCase().includes('utilisateur non trouvé')) {
                            setErrors(prevErrors => ({ ...prevErrors, email: data.message }));
                        } else if (data.message.toLowerCase().includes('mot de passe incorrect')) {
                            setErrors(prevErrors => ({ ...prevErrors, password: data.message }));
                        } else {
                            setErrors(prevErrors => ({ ...prevErrors, general: data.message }));
                        }
                    } else {
                        setErrors(prevErrors => ({ ...prevErrors, general: 'Échec de la connexion' }));
                    }
                } catch (err) {
                    setStatus('');
                    setErrors(prevErrors => ({ ...prevErrors, general: 'Identifiants invalides' }));
                }
            }
        } catch (error) {
            setStatus('');
            setErrors(prevErrors => ({ ...prevErrors, general: 'Erreur de connexion au serveur' }));
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prevErrors => ({ ...prevErrors, email: null }));
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) {
            setErrors(prevErrors => ({ ...prevErrors, password: null }));
        }
    };

    return (
        <>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
                                    {errors.general && <div className="custom-alert custom-alert-danger">{errors.general}</div>}

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label text-decoration-underline">Email</label>
                                        {errors.email && <div className="text-danger small mb-1">{errors.email}</div>}
                                        <input
                                            type="email"
                                            id="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            value={email}
                                            onChange={handleEmailChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label text-decoration-underline">Mot de passe</label>
                                        {errors.password && <div className="text-danger small mb-1">{errors.password}</div>}
                                        <input
                                            type="password"
                                            id="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <input type="hidden" name="_csrf_token" value={csrfToken} />

                                    <button type="submit" className="btn btn-primary mt-3" disabled={!csrfToken}>
                                        Se connecter
                                    </button>

                                    {status && (
                                        <div className="custom-alert custom-alert-info mt-3">{status}</div>
                                    )}

                                    {tokenError && (
                                        <div className="custom-alert custom-alert-danger mb-3">
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