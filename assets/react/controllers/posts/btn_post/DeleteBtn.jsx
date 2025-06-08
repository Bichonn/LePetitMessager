import React from 'react';

export default function DeleteBtn({ onClick }) {
  const cacheBuster = new Date().getTime();
  return (
    <button
      onClick={onClick}
      className="btn btn-sm btn-outline-danger ms-2 p-1"
      title="Supprimer le post"
      style={{ border: 'none' }}
    >
      <img src={`/icons/delete.png?v=${cacheBuster}`} alt="Supprimer" className="delete-icon" style={{ width: '20px', height: '20px' }} />
    </button>
  );
}