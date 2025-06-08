import React, { useState, useEffect } from 'react';

// Cache au niveau du module pour stocker les suggestions et l'état du chargement
let suggestionsGlobalCache = {
  data: null,
  error: null,
  hasAttemptedFetch: false,
};

export default function SuggestedUsers() {
  const [users, setUsers] = useState(suggestionsGlobalCache.data || []);
  // Afficher le chargement uniquement si la requête n'a pas encore été tentée
  const [loading, setLoading] = useState(!suggestionsGlobalCache.hasAttemptedFetch);
  const [error, setError] = useState(suggestionsGlobalCache.error || null);

  useEffect(() => {
    // Si les données sont déjà en cache, ou si une erreur s'est produite lors d'une tentative précédente,
    // utiliser l'état mis en cache et ne pas refaire de requête.
    if (suggestionsGlobalCache.hasAttemptedFetch) {
      setUsers(suggestionsGlobalCache.data || []);
      setError(suggestionsGlobalCache.error || null);
      setLoading(false); // S'assurer que le chargement est terminé
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true); // S'assurer que le chargement est actif avant la requête
      try {
        const response = await fetch('/api/users/suggestions?limit=6');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch suggestions: ${response.status}`);
        }
        const data = await response.json();
        suggestionsGlobalCache.data = data; // Mettre en cache les données
        suggestionsGlobalCache.error = null; // Réinitialiser l'erreur en cas de succès
        setUsers(data);
        setError(null);
      } catch (err) {
        suggestionsGlobalCache.error = err.message; // Mettre en cache l'erreur
        setError(err.message);
        console.error("Error fetching suggested users:", err);
        // suggestionsGlobalCache.data reste à sa valeur précédente (null ou données d'un ancien succès)
      } finally {
        suggestionsGlobalCache.hasAttemptedFetch = true; // Marquer que la tentative de fetch a eu lieu
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []); // Le tableau de dépendances vide assure que l'effet s'exécute à chaque montage,
          // mais la logique interne empêche les fetchs répétés.

  if (loading) {
    return <div className="p-2 text-center text-muted small">Chargement des suggestions...</div>;
  }

  if (error) {
    return <div className="p-2 text-center text-danger small">Erreur de suggestions: {error}</div>;
  }

  if (!users || users.length === 0) {
    return <div className="p-2 text-center text-muted small">Aucune suggestion pour le moment.</div>;
  }

  const leftColumnUsers = users.slice(0, Math.ceil(users.length / 2));
  const rightColumnUsers = users.slice(Math.ceil(users.length / 2));

  const renderUser = (user) => (
    <li key={user.id} className="list-group-item bg-transparent pt-1 me-0">
      <a href={`/profil/view/${user.id}`} className="d-flex align-items-center text-decoration-none text-body pt-1 bordrer-0">
        <img
          src={user.avatar_url || '/icons/default-avatar.png'}
          alt={user.username}
          className="rounded-circle me-2"
          width={32}
          height={32}
          style={{ objectFit: 'cover'}}
        />
        <small className="text-truncate" style={{maxWidth: '100px'}}>{user.username}</small>
      </a>
    </li>
  );

  return (
    <div className="suggested-users-container border-top border-dark p-3 mb-0">
      <h3 className="text-decoration-underline mb-2 text-center">Suggestions pour vous</h3>
      <div className="row">
        <div className="col-6">
          <ul className="list-group list-group-flush">
            {leftColumnUsers.map(renderUser)}
          </ul>
        </div>
        <div className="col-6">
          <ul className="list-group list-group-flush">
            {rightColumnUsers.map(renderUser)}
          </ul>
        </div>
      </div>
    </div>
  );
}