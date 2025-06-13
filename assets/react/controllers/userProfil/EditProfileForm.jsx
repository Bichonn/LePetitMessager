import React, { useState, useEffect } from 'react';

/**
 * Modal component for editing user profile information
 */
export default function EditProfileForm({ currentUser, onClose, onProfileUpdated }) {
  const [firstName, setFirstName] = useState(currentUser.first_name || '');
  const [lastName, setLastName] = useState(currentUser.last_name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [privateAccount, setPrivateAccount] = useState(currentUser.private_account || false);
  const [csrfToken, setCsrfToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formErrors, setFormErrors] = useState({});

  // Fetch CSRF token on component mount
  useEffect(() => {
    fetch('/get-csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token))
      .catch(err => console.error("Failed to fetch CSRF token", err));
  }, []);

  // Helper function to handle file input changes
  const handleFileChange = (setter) => (event) => {
    setter(event.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setFeedback({ type: 'error', message: 'Action non autorisée (token CSRF manquant).' });
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    setFormErrors({});

    // Prepare form data for submission
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('_csrf_token', csrfToken);
    formData.append('privateAccount', privateAccount);

    // Add files if selected
    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    }
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    try {
      const response = await fetch('/user/update', {
        method: 'POST',
        body: formData, // Browser sets Content-Type for FormData
      });
      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', message: data.message || 'Profil mis à jour avec succès!' });
        if (onProfileUpdated) {
          onProfileUpdated(data.user); // Pass updated user data to parent
        }
        // Close modal after success message
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

  // Loading state if user data is not available
  if (!currentUser) {
    return <div className="alert alert-warning">Chargement des données utilisateur...</div>;
  }

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          {/* Modal header */}
          <div className="modal-header rounded-0 justify-content-center">
            <h5 className="modal-title">Modifier le profil</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Feedback message display */}
              {feedback.message && (
                <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'}`}>
                  {feedback.message}
                </div>
              )}

              {/* First name input */}
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

              {/* Last name input */}
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

              {/* Username input */}
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

              {/* Bio input */}
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

              {/* Private account toggle */}
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="privateAccount"
                  name="privateAccount"
                  checked={privateAccount}
                  onChange={(e) => setPrivateAccount(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="privateAccount">
                  Compte privé (masquer les informations personnelles et les posts aux autres utilisateurs)
                </label>
              </div>

              {/* Profile picture upload */}
              <div className="mb-3">
                <label htmlFor="profilePicture" className="form-label">Photo de profil</label>
                <input
                  type="file"
                  className={`form-control ${formErrors.profilePicture ? 'is-invalid' : ''}`}
                  id="profilePicture"
                  onChange={handleFileChange(setProfilePictureFile)}
                  accept="image/*"
                />
                {formErrors.profilePicture && <div className="invalid-feedback d-block">{formErrors.profilePicture}</div>}
              </div>

              {/* Banner upload */}
              <div className="mb-3">
                <label htmlFor="banner" className="form-label">Bannière</label>
                <input
                  type="file"
                  className={`form-control ${formErrors.banner ? 'is-invalid' : ''}`}
                  id="banner"
                  onChange={handleFileChange(setBannerFile)}
                  accept="image/*"
                />
                {formErrors.banner && <div className="invalid-feedback d-block">{formErrors.banner}</div>}
              </div>

            </div>
            {/* Modal action buttons */}
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