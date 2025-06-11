import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import UserProfileInfo from './UserProfileInfo';
import UserPostsList from './UserPostsList';
import EditProfileForm from './EditProfileForm';
import UserLikedPostsList from './UserLikedPostsList';
import UserRepostedPostsList from './UserRepostedPostsList';
import UserFavorisPostsList from './UserFavorisPostsList';


export default function ShowProfil({ targetId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent', 'liked', or 'reposted'

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    setUser(null);

    const endpoint = targetId ? `/user/id/${targetId}` : `/user`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        setUser(data);
        if (!(data && data.is_private && !data.is_own_profile)) {
          setError(data.message || `Erreur: ${response.status}`);
        } else {
          setError(null);
        }
      } else {
        setUser(data);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Une erreur de communication est survenue.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [targetId]);

  const handleProfileUpdated = (updatedUserData) => {
    fetchUser();
    setShowEditModal(false);
  };

  if (isLoading) return <div className="text-center mt-4">Chargement du profil...</div>;

  if (error && (!user || !user.is_private || (user.is_private && !user.is_own_profile && !user.username))) {
    return <div className="alert alert-danger m-3">Erreur du profil: {error}</div>;
  }

  if (!user && !isLoading) {
    return <div className="alert alert-warning m-3">{error || "Utilisateur non trouvé ou profil inaccessible."}</div>;
  }

  return (
    <>
      <UserProfileInfo
        user={user}
        onEditClick={user && user.is_own_profile ? () => setShowEditModal(true) : null}
      />

      {showEditModal && user && user.is_own_profile && (
        <EditProfileForm
          currentUser={user}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Section pour les posts et posts aimés avec boutons de bascule */}
      {user && (!user.is_private || user.is_own_profile || user.followed_by_user) && (
        <div>
          <div className="container p-2 text-center border border-dark">
            <button
              className={`btn me-2 ${activeTab === 'recent' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('recent')}
              style={{ minWidth: '180px' }} // Assurer une largeur minimale pour les boutons
            >
              Publications Récentes
            </button>
            <button
              className={`btn me-2 ${activeTab === 'liked' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('liked')}
              style={{ minWidth: '180px' }} // Assurer une largeur minimale pour les boutons
            >
              Publications Aimées
            </button>
            <button
              className={`btn me-2 ${activeTab === 'reposted' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('reposted')}
              style={{ minWidth: '180px' }} // Assurer une largeur minimale pour les boutons
            >
              Publications Republiées
            </button>
            <button
              className={`btn ${activeTab === 'favoris' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('favoris')}
              style={{ minWidth: '180px' }} // Assurer une largeur minimale pour les boutons
            >
              Publications Enregistrées
            </button>
          </div>

          {activeTab === 'recent' && <UserPostsList user={user} />}
          {activeTab === 'liked' && <UserLikedPostsList user={user} />}
          {activeTab === 'reposted' && <UserRepostedPostsList user={user} />}
          {activeTab === 'favoris' && <UserFavorisPostsList user={user} />}

        </div>
      )}
    </>
  );
}