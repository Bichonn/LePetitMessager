import React, { useState, useEffect, useCallback } from 'react';

/**
 * Utility function for debouncing
 */
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

/**
 * Component for searching users with suggestions dropdown
 */
export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch user suggestions from API
  const fetchUserSuggestions = async (term) => {
    if (term.trim() === '' || term.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/users/search/${encodeURIComponent(term)}`);
      if (!response.ok) {
        // Handle response errors
        console.error('Search API response not OK:', response.status);
        setSuggestions([]);
        return;
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to fetch user suggestions:", error);
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced version of fetchUserSuggestions
  const debouncedFetchSuggestions = useCallback(debounce(fetchUserSuggestions, 300), []);

  // Handle search input changes
  const handleChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedFetchSuggestions(newSearchTerm);

    // Maintain existing onSearch functionality if used
    if (onSearch) {
      onSearch(newSearchTerm);
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    setSuggestions([]);
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  // Handle suggestion click to navigate to user profile
  const handleSuggestionClick = (userId) => {
    setSearchTerm('');
    setSuggestions([]);
    window.location.href = `/profil/view/${userId}`; // Navigate using userId
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
      {/* Loading indicator */}
      {loadingSuggestions && <div className="text-muted p-2">Chargement...</div>}
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul 
          className="list-group position-absolute w-100 search-suggestions-list rounded-0" 
        >
          {suggestions.map(user => (
            <li
              key={user.id}
              className="list-group-item d-flex align-items-center border-dark search-suggestion-item rounded-0 bg-color-search"
              onClick={() => handleSuggestionClick(user.id)} // Navigate using user ID
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