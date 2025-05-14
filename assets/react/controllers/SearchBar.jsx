import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="card shadow border border-dark mb-3">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleChange}
            aria-label="Rechercher"
          />
          <button className="btn btn-primary" type="submit">
            <img className="img-fluid w-25 bi bi-search" src="/icons/search.png"></img>
          </button>
        </div>
      </form>

    </div>
  );
}