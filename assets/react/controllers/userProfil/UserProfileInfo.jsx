import React, { useState, useEffect } from 'react'; // Assurez-vous que useState et useEffect sont importés
import '../../../styles/ShowProfil.css';
import '../../../styles/app.css';
import FollowBtn from './btn_user/FollowBtn.jsx';
import ReportBtn from './btn_user/ReportBtn.jsx';

export default function UserProfileInfo({ user, onEditClick }) {
  const isOwnProfile = user && user.is_own_profile;
  const [visitorIsAuthenticated, setVisitorIsAuthenticated] = useState(false); // Nouvel état

  useEffect(() => {
    // Vérifier si le visiteur est authentifié
    fetch('/user') // L'endpoint /user renvoie les données de l'utilisateur connecté ou 401
      .then(response => {
        if (response.ok) {
          setVisitorIsAuthenticated(true);
        } else {
          setVisitorIsAuthenticated(false);
        }
      })
      .catch(() => {
        setVisitorIsAuthenticated(false); // En cas d'erreur réseau, considérer comme non authentifié
      });
  }, []); // Exécuter une seule fois au montage du composant

  if (!user) {
    return <div className="text-center p-3">Chargement des informations du profil...</div>;
  }

  return (
    <div className="profile-header-container border-start border-bottom border-end border-dark">
      {user.banner && (
        <div className="banner-container border-bottom border-dark">
          <img
            src={user.banner}
            alt="Banner"
            className="banner-image"
          />
        </div>
      )}

      {user.avatar_url && (
        <div className="profile-avatar-wrapper">
          <img
            src={user.avatar_url}
            alt="avatar"
            className="rounded-circle profil-avatar"
          />
        </div>
      )}

      <div className="container p-4 profil-container shadow bg-color-search">
        <div className="profile-info-details">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h3 className="mb-1 fw-bold fst-italic">
                {user.username} {user.private_account && !isOwnProfile && <img src="/icons/cadenas.png" className="lock-icon-img ms-1" alt="Profil privé"/>}
              </h3>
              {(!user.private_account || isOwnProfile) && (
                <>
                  <p className="text-muted fst-italic mb-2">
                    {user.first_name} {user.last_name} -- Membre depuis le{' '}
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  {user.bio && (
                    <p className="fst-italic mb-0 mt-2">
                      {user.bio}
                    </p>
                  )}
                </>
              )}
              {(user.private_account && !isOwnProfile) && (
                <p className="text-muted fst-italic my-2">
                  {user.message || "Ce compte est privé."}
                </p>
              )}
            </div>
            <div className="d-flex flex-column align-items-end">
              {isOwnProfile && onEditClick && (
                <button className="btn btn-primary mb-2" onClick={onEditClick}>
                  Modifier le profil
                </button>
              )}
              {/* Condition mise à jour ici */}
              {visitorIsAuthenticated && !isOwnProfile && user.id && (
                <>
                  <ReportBtn userId={user.id} username={user.username} />
                  <FollowBtn userId={user.id} initialFollowed={user.followed_by_user} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}