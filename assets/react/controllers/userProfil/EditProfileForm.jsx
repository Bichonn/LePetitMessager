import React, { useState, useEffect } from 'react';

export default function EditProfileForm({ currentUser, onClose, onProfileUpdated }) {
  const [firstName, setFirstName] = useState(currentUser.first_name || '');
  const [lastName, setLastName] = useState(currentUser.last_name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Fetch CSRF token, similar to LoginForm or RegisterForm
    fetch('/get-csrf-token') // Assuming 'authenticate' is the token_id for this form too
      .then(res => res.json())
      .then(data => setCsrfToken(data.token))
      .catch(err => console.error("Failed to fetch CSRF token", err));
  }, []);

  const handleFileChange = (setter) => (event) => {
    setter(event.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setFeedback({ type: 'error', message: 'Action non autorisée (token CSRF manquant).' });
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    setFormErrors({});

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('_csrf_token', csrfToken); // Add CSRF token

    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    }
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    try {
      const response = await fetch('/user/update', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed, browser sets it for FormData
      });
      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', message: data.message || 'Profil mis à jour avec succès!' });
        if (onProfileUpdated) {
          onProfileUpdated(data.user); // Pass the updated user data
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        if (data.errors) {
          setFormErrors(data.errors);
          setFeedback({ type: 'error', message: 'Veuillez corriger les erreurs dans le formulaire.' });
        } else {
          setFeedback({ type: 'error', message: data.error || data.message || 'Erreur lors de la mise à jour.' });
        }
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erreur de connexion au serveur.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return <div className="alert alert-warning">Chargement des données utilisateur...</div>;
  }

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header rounded-0 justify-content-center">
            <h5 className="modal-title">Modifier le profil</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {feedback.message && (
                <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'}`}>
                  {feedback.message}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">Prénom</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`}
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`}
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="username" className="form-label">Pseudo</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  className={`form-control ${formErrors.bio ? 'is-invalid' : ''}`}
                  id="bio"
                  name="bio"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
                {formErrors.bio && <div className="invalid-feedback">{formErrors.bio}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="profilePicture" className="form-label">Photo de profil</label>
                <input
                  type="file"
                  className="form-control"
                  id="profilePicture"
                  onChange={handleFileChange(setProfilePictureFile)}
                  accept="image/*"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="banner" className="form-label">Bannière</label>
                <input
                  type="file"
                  className="form-control"
                  id="banner"
                  onChange={handleFileChange(setBannerFile)}
                  accept="image/*"
                />
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn custom-cancel-button me-2" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !csrfToken}>
                {isSubmitting ? 'Mise à jour...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}