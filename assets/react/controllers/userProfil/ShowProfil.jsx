import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import UserProfileInfo from './UserProfileInfo';
import UserPostsList from './UserPostsList';
import EditProfileForm from './EditProfileForm';

export default function ShowProfil({ targetUsername }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    setUser(null); // Clear previous user state

    const endpoint = targetUsername ? `/user/username/${targetUsername}` : `/user`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json(); // Try to parse JSON for all responses

      if (!response.ok) {
        // Even if not ok, data might contain useful info (e.g., for private profiles)
        // Store partial data if available (like username, avatar_url, is_private, is_own_profile)
        setUser(data); 
        setError(data.message || `Erreur: ${response.status}`);
        // For private profiles, we still want to render UserProfileInfo with the message
        // So, we don't throw an error here if data.is_private is true.
        if (!(data && data.is_private)) {
             // For other errors, ensure it's treated as a full error if not private profile specific
             // This path might not be hit if setUser(data) and setError() are sufficient
        }
      } else {
        setUser(data); // Full user data, including is_own_profile
      }
    } catch (err) {
      // This catch is for network errors or if response.json() fails
      setError(err.message || 'Une erreur de communication est survenue.');
      setUser(null); // Ensure user is null on critical fetch errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [targetUsername]); // Re-fetch if targetUsername changes

  const handleProfileUpdated = (updatedUserData) => {
    // setUser(updatedUserData); // Optimistically update or refetch
    fetchUser(); // Refetch to ensure all data is current, respecting targetUsername
    setShowEditModal(false);
  };

  if (isLoading) return <div className="text-center mt-4">Chargement du profil...</div>;

  // If there's an error message, and it's not a "private profile" scenario where user data is partially available for UserProfileInfo
  if (error && (!user || !user.is_private || (user.is_private && !user.is_own_profile && !user.username))) {
    return <div className="alert alert-danger m-3">Erreur du profil: {error}</div>;
  }
  
  // If user is null after loading and no specific error handled above (e.g. 404 not found and data was not parsable)
  if (!user && !isLoading) {
    return <div className="alert alert-warning m-3">{error || "Utilisateur non trouvé ou profil inaccessible."}</div>;
  }
  
  // At this point, 'user' should be populated, either fully or partially (e.g. for private profiles).
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

      {user && (!user.is_private || user.is_own_profile) && (
        <UserPostsList user={user} />
      )}

      {user && user.is_private && !user.is_own_profile && (
        <div className="alert alert-info m-3">{error || "Les posts de ce profil privé ne sont pas visibles."}</div>
      )}
    </>
  );
}