import React, { useState } from 'react';
import '../../../styles/formStyle.css';
import '../../../styles/app.css';

export default function RegisterForm() {
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        username: ''
    });
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({
        email: null,
        username: null,
        password: null,
        general: null
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Effacer l'erreur spécifique lorsque l'utilisateur modifie le champ
        if (errors[e.target.name]) {
            setErrors({...errors, [e.target.name]: null});
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        // Effacer l'erreur de mot de passe lorsque l'utilisateur le modifie
        if (errors.password) {
            setErrors({...errors, password: null});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Réinitialiser toutes les erreurs
        setErrors({
            email: null,
            username: null,
            password: null,
            general: null
        });

        if (password !== confirmPassword) {
            setErrors({...errors, password: "Les mots de passe ne correspondent pas."});
            return;
        }

        const dataToSend = { ...form, password };

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('Compte créé avec succès !');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                // Gérer les différents types d'erreurs
                if (data.error && data.error.includes("email")) {
                    setErrors({...errors, email: "Cet email est déjà utilisé."});
                } else if (data.error && data.error.includes("utilisateur")) {
                    setErrors({...errors, username: "Ce nom d'utilisateur est déjà utilisé."});
                } else {
                    setErrors({...errors, general: data.error || "Une erreur est survenue"});
                }
            }
        } catch (error) {
            setErrors({...errors, general: "Erreur de connexion au serveur"});
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
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label text-decoration-underline">Email</label>
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
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label text-decoration-underline">Mot de passe</label>
                                        <input
                                            type="password"
                                            id="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label text-decoration-underline">Confirmer le mot de passe</label>
                                        {errors.password && <div className="text-danger small mb-1">{errors.password}</div>}
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                                    <button type="submit" className="btn btn-primary mt-3">S'inscrire</button>
                                    {status && (
                                        <div className="alert alert-success mt-3">
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