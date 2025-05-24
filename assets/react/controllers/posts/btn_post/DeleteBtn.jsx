import React from 'react';

export default function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-sm btn-outline-danger ms-2 p-1"
      title="Supprimer le post"
      style={{ border: 'none' }}
    >
      <img src="/icons/delete.png" alt="Supprimer" style={{ width: '20px', height: '20px' }} />
    </button>
  );
}