import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import UserProfileInfo from './UserProfileInfo';
import UserPostsList from './UserPostsList';
import EditProfileForm from './EditProfileForm';

export default function ShowProfil({ targetUsername }) { // Accept targetUsername prop
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // const [isOwnProfile, setIsOwnProfile] = useState(false); // Backend will send this

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    const endpoint = targetUsername ? `/user/username/${targetUsername}` : `/user`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json(); // Try to parse JSON regardless of status for error messages

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP ${response.status}`);
      }
      setUser(data);
      // setIsOwnProfile(data.is_own_profile !== undefined ? data.is_own_profile : !targetUsername);
    } catch (err) {
      setError(err.message);
      setUser(null); // Clear user data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [targetUsername]); // Re-fetch if targetUsername changes

  const handleProfileUpdated = (updatedUserData) => {
    // setUser(updatedUserData); // Optimistically update or refetch
    fetchUser(); // Refetch to ensure all data is current
    setShowEditModal(false);
  };

  if (isLoading) return <div className="text-center mt-4">Chargement du profil...</div>;
  
  // If there's an error message, display it.
  // If user is null after loading and no error (e.g. private profile message from backend but HTTP 200), handle accordingly.
  if (error) {
    // If user data exists (e.g. for private profile minimal data), still show UserProfileInfo
    if (user && user.is_private) {
         return (
            <>
                <UserProfileInfo user={user} onEditClick={null} /> {/* No edit for others */}
                <div className="alert alert-info m-3">{error}</div>
                {/* Optionally, don't show UserPostsList or show a specific message */}
            </>
         );
    }
    return <div className="alert alert-danger m-3">Erreur du profil: {error}</div>;
  }
  
  if (!user) return <div className="alert alert-warning m-3">Utilisateur non trouvé ou profil inaccessible.</div>;

  return (
    <>
      <UserProfileInfo 
        user={user} 
        onEditClick={user.is_own_profile ? () => setShowEditModal(true) : null} 
      />

      {showEditModal && user.is_own_profile && (
        <EditProfileForm
          currentUser={user}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
      
      {/* Only show posts if the profile is not private or if it's the owner's profile */}
      {(!user.private_account || user.is_own_profile) && <UserPostsList user={user} />}
      {user.private_account && !user.is_own_profile && !error && (
        <div className="alert alert-info m-3">Les posts de ce profil privé ne sont pas visibles.</div>
      )}
    </>
  );
}