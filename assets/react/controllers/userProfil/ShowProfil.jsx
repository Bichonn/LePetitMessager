import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import UserProfileInfo from './UserProfileInfo';
import UserPostsList from './UserPostsList';
import EditProfileForm from './EditProfileForm';

export default function ShowProfil({ targetId }) { // Changed from targetUsername
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    setUser(null);

    const endpoint = targetId ? `/user/id/${targetId}` : `/user`; // Use targetId and new endpoint

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        setUser(data); // Important: data contient is_private, username, avatar_url
        // Si c'est un profil privé consulté par un autre, ne pas définir d'erreur générique ici.
        // UserProfileInfo et la section des posts afficheront leurs propres messages.
        if (!(data && data.is_private && !data.is_own_profile)) {
          setError(data.message || `Erreur: ${response.status}`);
        } else {
          setError(null); // Assurez-vous qu'aucune erreur générique n'est définie pour ce cas
        }
      } else {
        setUser(data);
        setError(null); // Effacer toute erreur précédente en cas de succès
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
  }, [targetId]); // Re-fetch if targetId changes

  const handleProfileUpdated = (updatedUserData) => {
    fetchUser(); 
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
    </>
  );
}