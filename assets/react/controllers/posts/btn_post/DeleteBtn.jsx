import React from 'react';

// Component for a delete button, typically used for posts
export default function DeleteBtn({ onClick }) {
  // Cache buster for the icon to ensure the latest version is loaded
  const cacheBuster = new Date().getTime(); 
  return (
    <button
      onClick={onClick} // Click handler passed via props
      className="btn btn-sm btn-outline-danger ms-2 p-1" // Styling classes
      title="Supprimer le post" // Tooltip for the button
      style={{ border: 'none' }} // Inline style to remove border
    >
      <img 
        src={`/icons/delete.png?v=${cacheBuster}`} // Icon source with cache buster
        alt="Supprimer" // Alt text for the icon
        className="delete-icon" // Class for the icon
        style={{ width: '20px', height: '20px' }} // Inline styles for icon size
      />
    </button>
  );
}