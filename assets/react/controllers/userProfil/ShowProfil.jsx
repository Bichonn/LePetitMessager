import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import UserProfileInfo from './UserProfileInfo';
import UserPostsList from './UserPostsList';
import EditProfileForm from './EditProfileForm';
import UserLikedPostsList from './UserLikedPostsList';
import UserRepostedPostsList from './UserRepostedPostsList';
import UserFavorisPostsList from './UserFavorisPostsList';

/**
 * Main component for displaying user profile with tabs for different post types
 */
export default function ShowProfil({ targetId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent', 'liked', 'reposted', or 'favoris'

  // Fetch user data from API
  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    setUser(null);

    // Use specific user ID endpoint or current user endpoint
    const endpoint = targetId ? `/user/id/${targetId}` : `/user`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        setUser(data);
        // Don't show error for private profiles that user can still view
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

  // Fetch user data when component mounts or targetId changes
  useEffect(() => {
    fetchUser();
  }, [targetId]);

  // Handle profile update and refresh data
  const handleProfileUpdated = (updatedUserData) => {
    fetchUser();
    setShowEditModal(false);
  };

  // Loading state
  if (isLoading) return <div className="text-center mt-4">Chargement du profil...</div>;

  // Error state for non-private profiles or unauthorized access
  if (error && (!user || !user.is_private || (user.is_private && !user.is_own_profile && !user.username))) {
    return <div className="alert alert-danger m-3">Erreur du profil: {error}</div>;
  }

  // No user found state
  if (!user && !isLoading) {
    return <div className="alert alert-warning m-3">{error || "Utilisateur non trouvé ou profil inaccessible."}</div>;
  }

  return (
    <>
      {/* User profile information section */}
      <UserProfileInfo
        user={user}
        onEditClick={user && user.is_own_profile ? () => setShowEditModal(true) : null}
      />

      {/* Edit profile modal for own profile */}
      {showEditModal && user && user.is_own_profile && (
        <EditProfileForm
          currentUser={user}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Posts section with tabs - only visible for public profiles or followed/own profiles */}
      {user && (!user.is_private || user.is_own_profile || user.followed_by_user) && (
        <div>
          {/* Tab navigation buttons */}
          <div className="container p-2 text-center border border-dark">
            <button
              className={`btn me-2 ${activeTab === 'recent' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('recent')}
              style={{ minWidth: '180px' }} // Ensure minimum width for buttons
            >
              Publications Récentes
            </button>
            <button
              className={`btn me-2 ${activeTab === 'liked' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('liked')}
              style={{ minWidth: '180px' }} // Ensure minimum width for buttons
            >
              Publications Aimées
            </button>
            <button
              className={`btn me-2 ${activeTab === 'reposted' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('reposted')}
              style={{ minWidth: '180px' }} // Ensure minimum width for buttons
            >
              Publications Republiées
            </button>
            <button
              className={`btn ${activeTab === 'favoris' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`}
              onClick={() => setActiveTab('favoris')}
              style={{ minWidth: '180px' }} // Ensure minimum width for buttons
            >
              Publications Enregistrées
            </button>
          </div>

          {/* Tab content - render different post lists based on active tab */}
          {activeTab === 'recent' && <UserPostsList user={user} />}
          {activeTab === 'liked' && <UserLikedPostsList user={user} />}
          {activeTab === 'reposted' && <UserRepostedPostsList user={user} />}
          {activeTab === 'favoris' && <UserFavorisPostsList user={user} />}

        </div>
      )}
    </>
  );
}