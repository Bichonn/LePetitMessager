import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import UserProfileInfo from './UserProfileInfo';
import UserPostsList from './UserPostsList';
import EditProfileForm from './EditProfileForm';

export default function ShowProfil() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/user`); 
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status}` }));
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleProfileUpdated = (updatedUserData) => {
    fetchUser();
    setShowEditModal(false);
  };

  if (isLoading) return <div className="text-center mt-4">Chargement du profil...</div>;
  if (error) return <div className="text-danger mt-4">Erreur du profil: {error}</div>;

  return (
    <>
      <UserProfileInfo user={user} onEditClick={() => user && setShowEditModal(true)} />

      {showEditModal && user && (
        <EditProfileForm
          currentUser={user}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {user ? (
        <UserPostsList user={user} />
      ) : (
        !isLoading && <div className="mt-4">Utilisateur non trouvé ou profil inaccessible.</div>
      )}
    </>
  );
}