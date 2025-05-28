import React, { useState, useEffect, useCallback } from 'react';

// Fonction utilitaire pour le debouncing
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchUserSuggestions = async (term) => {
    if (term.trim() === '' || term.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/users/search/${encodeURIComponent(term)}`);
      if (!response.ok) {
        // Gérer les erreurs de réponse (ex: log, ou message utilisateur)
        console.error('Search API response not OK:', response.status);
        setSuggestions([]);
        return;
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to fetch user suggestions:", error);
      setSuggestions([]); // Effacer les suggestions en cas d'erreur
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Version débattue (debounced) de fetchUserSuggestions
  const debouncedFetchSuggestions = useCallback(debounce(fetchUserSuggestions, 300), []);

  const handleChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedFetchSuggestions(newSearchTerm);

    if (onSearch) {
      onSearch(newSearchTerm); // Conserver la fonctionnalité onSearch existante si elle est utilisée
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuggestions([]);
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleSuggestionClick = (username) => {
    setSearchTerm('');
    setSuggestions([]);
    window.location.href = `/profil/view/${username}`;
  };

  return (
    <div className="bg-color-search border-bottom border-dark position-relative">
      <form onSubmit={handleSubmit}>
        
        <div className="input-group">
          <input
            type="text"
            className="border-end border-dark form-control border-0 rounded-0 bg-color-search large-placeholder inner-shadow search-input-field"
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={handleChange}
            aria-label="Rechercher des utilisateurs"
            autoComplete="off"
          />
          
        </div>
      </form>
      {loadingSuggestions && <div className="text-muted p-2">Chargement...</div>}
      {suggestions.length > 0 && (
        <ul 
          className="list-group position-absolute w-100 search-suggestions-list rounded-0" 
        >
          {suggestions.map(user => (
            <li
              key={user.id}
              className="list-group-item d-flex align-items-center border-dark search-suggestion-item rounded-0 bg-color-search"
              onClick={() => handleSuggestionClick(user.username)}
            >
              <img
                src={user.avatar_url || '/default-avatar.png'}
                alt={`${user.username}'s avatar`}
                className="search-suggestion-avatar"
              />
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}