import React, { useState, useEffect } from 'react';
import GoogleAuthBtn from './GoogleAuthBtn';
import '../../../styles/formStyle.css';
import '../../../styles/app.css';

export default function LoginForm() {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [csrfToken, setCsrfToken] = useState('');
    const [status, setStatus] = useState(''); // For displaying messages like "Connecting..."
    const [errors, setErrors] = useState({ // For form validation errors
        email: null,
        password: null,
        general: null
    });

    const [tokenError, setTokenError] = useState(false); // State for CSRF token fetch error

    // Fetch CSRF token when the modal is shown
    useEffect(() => {
        if (showModal) {
            setTokenError(false);
            setErrors({ email: null, password: null, general: null }); // Reset errors
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
        setErrors({ email: null, password: null, general: null }); // Reset errors on new submission
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
                    'X-Requested-With': 'XMLHttpRequest' // Important for Symfony to recognize AJAX request
                }
            });



            if (response.ok) {
                setStatus('Connexion réussie!');
                setTimeout(() => {
                    window.location.reload(); // Reload the page on successful login
                }, 1000);
            } else {
                try {
                    const data = await response.json(); // Try to parse error response
                    setStatus('');
                    if (data.message) {
                        // Set specific error messages based on server response
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
                    // Handle cases where error response is not JSON or other parsing errors
                    setStatus('');
                    setErrors(prevErrors => ({ ...prevErrors, general: 'Identifiants invalides' }));
                }
            }
        } catch (error) {
            // Handle network errors or other issues with the fetch request
            setStatus('');
            setErrors(prevErrors => ({ ...prevErrors, general: 'Erreur de connexion au serveur' }));
        }
    };

    // Clear email error when user types
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prevErrors => ({ ...prevErrors, email: null }));
        }
    };

    // Clear password error when user types
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) {
            setErrors(prevErrors => ({ ...prevErrors, password: null }));
        }
    };

    return (
        <>
            <button className="btn btn-primary me-3" onClick={() => setShowModal(true)}>
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
                                {/* Google Auth Button at the top of the modal */}
                                <div className="mb-3 text-center">
                                    <GoogleAuthBtn className="btn btn-outline-dark w-100 mb-3" />
                                    <hr />
                                </div>

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
                                    <div className="mb-3 position-relative">
                                        <label htmlFor="password" className="form-label text-decoration-underline">Mot de passe</label>
                                        {errors.password && <div className="text-danger small mb-1">{errors.password}</div>}
                                        <input
                                            type={showPassword ? "text" : "password"} // Toggle input type for password visibility
                                            id="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                        {!errors.password && ( // Show toggle button only if there's no password error
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary password-toggle-btn login-password-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                                title={showPassword ? 'Masquer le mot de passe' : 'Voir le mot de passe'}
                                            >
                                                <img
                                                    src={showPassword ? "/icons/voir-mdp.png" : "/icons/hide-mdp.png"}
                                                    alt={showPassword ? "Masquer" : "Voir"}
                                                />
                                            </button>
                                        )}
                                    </div>
                                    <input type="hidden" name="_csrf_token" value={csrfToken} />

                                    <button type="submit" className="btn btn-primary mt-3" disabled={!csrfToken}>
                                        Se connecter
                                    </button>

                                    {/* Display connection status messages */}
                                    {status && (
                                        <div className="custom-alert custom-alert-info mt-3">{status}</div>
                                    )}

                                    {/* Display CSRF token error message */}
                                    {tokenError && (
                                        <div className="custom-alert mb-3">
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