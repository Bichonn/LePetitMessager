import React, { useState } from 'react';
import GoogleAuthBtn from './GoogleAuthBtn';
import '../../../styles/formStyle.css';
import '../../../styles/app.css';

export default function RegisterForm() {
    // State for form fields
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        username: ''
    });
    const [status, setStatus] = useState(''); // For displaying success/status messages
    const [showModal, setShowModal] = useState(false); // Controls modal visibility
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggles confirm password visibility
    // State for form validation errors
    const [errors, setErrors] = useState({
        email: null,
        username: null,
        password: null,
        general: null
    });

    // Handles changes in form input fields
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear the specific error when the user modifies the field
        if (errors[e.target.name]) {
            setErrors({...errors, [e.target.name]: null});
        }
    };

    // Handles changes in the password field
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        // Clear password error when the user modifies it
        if (errors.password) {
            setErrors({...errors, password: null});
        }
    };

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Reset all errors on new submission
        setErrors({
            email: null,
            username: null,
            password: null,
            general: null
        });

        // Check if passwords match
        if (password !== confirmPassword) {
            setErrors({...errors, password: "Les mots de passe ne correspondent pas."});
            return;
        }

        // Strong password validation (minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-\+\.,:;<=>])[A-Za-z\d@$!%*?&_#^()\-\+\.,:;<=>]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            setErrors({...errors, password: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."});
            return;
        }

        const dataToSend = { ...form, password };

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // Important for server to know we expect JSON
                    'X-Requested-With': 'XMLHttpRequest' // Important for Symfony to recognize AJAX request
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await res.json(); // Expect a JSON response from the server

            if (res.ok) {
                setStatus('Compte créé avec succès !');
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                // Handle different types of errors from server
                if (data.error && data.error.includes("email")) {
                    setErrors({...errors, email: "Cet email est déjà utilisé."});
                } else if (data.error && data.error.includes("utilisateur")) {
                    setErrors({...errors, username: "Ce nom d'utilisateur est déjà utilisé."});
                } else {
                    setErrors({...errors, general: data.error || "Une erreur est survenue"});
                }
            }
        } catch (error) {
            console.error("Registration fetch error:", error); // Log the full error object for debugging
            let errorMessage = "Erreur de connexion au serveur";
            // Provide more specific error messages for common network issues
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                errorMessage = "Impossible de joindre le serveur. Vérifiez votre connexion internet ou que le serveur est bien démarré.";
            } else if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            setErrors({...errors, general: errorMessage});
        }
    };

    return (
        <>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                S'inscrire
            </button>

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header rounded-0 justify-content-center">
                                <h3 className="text-center mb-0">Devenez un Messager !</h3>
                                <button type="button" className="btn-close position-absolute end-0 me-3" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {/* Google Auth Button at the top of the modal */}
                                <div className="mb-3 text-center">
                                    <GoogleAuthBtn className="btn btn-outline-dark w-100 mb-3" text="Inscription avec Google" />
                                    <hr/>
                                </div>

                                <form onSubmit={handleSubmit} className="d-flex flex-column">
                                    {/* First Name Input */}
                                    <div className="mb-3">
                                        <label htmlFor="firstName" className="form-label text-decoration-underline mb-0">Prénom</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Last Name Input */}
                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label text-decoration-underline mb-0">Nom</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Username Input */}
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label text-decoration-underline mb-0">Pseudo</label>
                                        {errors.username && <div className="text-danger small mb-1">{errors.username}</div>}
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Email Input */}
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label text-decoration-underline mb-0">Email</label>
                                        {errors.email && <div className="text-danger small mb-1">{errors.email}</div>}
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Password Input */}
                                    <div className="mb-3 position-relative">
                                        <label htmlFor="password" className="form-label text-decoration-underline mb-0">Mot de passe</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                        {/* Toggle password visibility button */}
                                        {!errors.password && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary password-toggle-btn"
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
                                    {/* Confirm Password Input */}
                                    <div className="mb-3 position-relative">
                                        <label htmlFor="confirmPassword" className="form-label text-decoration-underline mb-0">Confirmer le mot de passe</label>
                                        {errors.password && <div className="text-danger small mb-1">{errors.password}</div>}
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        {/* Toggle confirm password visibility button */}
                                        {!errors.password && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary password-toggle-btn"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                title={showConfirmPassword ? 'Masquer le mot de passe' : 'Voir le mot de passe'}
                                            >
                                                <img
                                                    src={showConfirmPassword ? "/icons/voir-mdp.png" : "/icons/hide-mdp.png"}
                                                    alt={showConfirmPassword ? "Masquer" : "Voir"}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* Display general form errors */}
                                    {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                                    <button type="submit" className="btn btn-primary mt-3">S'inscrire</button>
                                    {/* Display status messages (e.g., success message) */}
                                    {status && (
                                        <div className="custom-alert mt-3">
                                            {status}
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