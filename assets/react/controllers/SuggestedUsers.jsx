import React, { useState, useEffect } from 'react';

// Module-level cache to store suggestions and loading state
let suggestionsGlobalCache = {
  data: null,
  error: null,
  hasAttemptedFetch: false,
};

/**
 * Component that displays suggested users in a two-column layout
 */
export default function SuggestedUsers() {
  const [users, setUsers] = useState(suggestionsGlobalCache.data || []);
  // Show loading only if fetch hasn't been attempted yet
  const [loading, setLoading] = useState(!suggestionsGlobalCache.hasAttemptedFetch);
  const [error, setError] = useState(suggestionsGlobalCache.error || null);

  useEffect(() => {
    // Use cached data if already fetched (success or error)
    if (suggestionsGlobalCache.hasAttemptedFetch) {
      setUsers(suggestionsGlobalCache.data || []);
      setError(suggestionsGlobalCache.error || null);
      setLoading(false); // Ensure loading is complete
      return;
    }

    // Fetch suggestions from API
    const fetchSuggestions = async () => {
      setLoading(true); // Ensure loading is active before request
      try {
        const response = await fetch('/api/users/suggestions?limit=6');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch suggestions: ${response.status}`);
        }
        const data = await response.json();
        
        // Cache successful response
        suggestionsGlobalCache.data = data;
        suggestionsGlobalCache.error = null; // Reset error on success
        setUsers(data);
        setError(null);
      } catch (err) {
        // Cache error for future component mounts
        suggestionsGlobalCache.error = err.message;
        setError(err.message);
        console.error("Error fetching suggested users:", err);
        // suggestionsGlobalCache.data remains at previous value (null or old data)
      } finally {
        suggestionsGlobalCache.hasAttemptedFetch = true; // Mark fetch as attempted
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []); // Empty dependency array ensures effect runs on each mount,
          // but internal logic prevents repeated fetches.

  // Loading state
  if (loading) {
    return <div className="p-2 text-center text-muted small">Chargement des suggestions...</div>;
  }

  // Error state
  if (error) {
    return <div className="p-2 text-center text-danger small">Erreur de suggestions: {error}</div>;
  }

  // Empty state
  if (!users || users.length === 0) {
    return <div className="p-2 text-center text-muted small">Aucune suggestion pour le moment.</div>;
  }

  // Split users into two columns
  const leftColumnUsers = users.slice(0, Math.ceil(users.length / 2));
  const rightColumnUsers = users.slice(Math.ceil(users.length / 2));

  // Render individual user suggestion
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
      {/* Two-column layout for suggested users */}
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