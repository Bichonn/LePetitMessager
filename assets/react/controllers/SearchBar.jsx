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
    <div className="bg-color-search border-bottom border-dark">
      <form onSubmit={handleSubmit}>
        <div className="input-group">

          <input
            type="text"
            className="border-end border-dark form-control border-0 rounded-0 bg-color-search large-placeholder inner-shadow"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleChange}
            aria-label="Rechercher"
          />

          <button className="btn rounded-0" type="submit">
            <img className="img-fluid w-25" src="/icons/search.png"></img>
          </button>
          
        </div>
      </form>
    </div>
  );
}