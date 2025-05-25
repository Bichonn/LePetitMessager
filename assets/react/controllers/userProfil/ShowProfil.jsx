import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css'; // Assurez-vous que le chemin est correct
import UserProfileInfo from './UserProfileInfo';
import UserPostsList from './UserPostsList'; // UserPostsList va gérer ses propres posts

export default function ShowProfil() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setUser(null); // Réinitialiser l'utilisateur en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // Récupérer l'utilisateur au montage du composant

  // Les gestionnaires handlePostDeletedOnProfile et handlePostUpdatedOnProfile
  // seront maintenant dans UserPostsList s'il gère ses propres données.

  if (isLoading) return <div className="text-center mt-4">Chargement du profil...</div>;
  if (error) return <div className="text-danger mt-4">Erreur du profil: {error}</div>;
  // UserProfileInfo gère l'affichage si user est null.
  // UserPostsList gérera également l'affichage si user est null.

  return (
    <>
      <UserProfileInfo user={user} />
      {user ? (
        <UserPostsList user={user} />
      ) : (
        !isLoading && <div className="mt-4">Utilisateur non trouvé ou profil inaccessible.</div>
      )}
    </>
  );
}