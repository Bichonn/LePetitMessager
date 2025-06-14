import React, { useState } from "react";

export default function HashtagInput({ hashtags, setHashtags }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch hashtag suggestions from API
  const fetchSuggestions = async (q) => {
    if (!q) return setSuggestions([]);
    const res = await fetch(`/hashtags/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSuggestions(data);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Remove # prefix for search
    fetchSuggestions(e.target.value.replace(/^#/, ""));
  };

  // Add hashtag to list if not already present
  const handleAdd = (tag) => {
    if (!hashtags.includes(tag)) setHashtags([...hashtags, tag]);
    setInput("");
    setSuggestions([]);
  };

  return (
    <div>
      <input
        type="text"
        className="form-control"
        placeholder="Ajouter un hashtag"
        value={input}
        onChange={handleInputChange}
        onKeyDown={e => {
          if (e.key === "Enter" && input.trim()) {
            handleAdd(input.trim().replace(/^#/, ""));
          }
        }}
      />
      {/* Suggestion dropdown */}
      {suggestions.length > 0 && (
        <ul className="list-group position-absolute z-3">
          {suggestions.map(s => (
            <li
              key={s.id}
              className="list-group-item list-group-item-action"
              onClick={() => handleAdd(s.content)}
              style={{ cursor: "pointer" }}
            >
              #{s.content}
            </li>
          ))}
        </ul>
      )}
      {/* Display selected hashtags */}
      <div className="mt-2">
        {hashtags.map(tag => (
          <span key={tag} className="badge bg-warning text-dark me-1">#{tag}</span>
        ))}
      </div>
    </div>
  );
}