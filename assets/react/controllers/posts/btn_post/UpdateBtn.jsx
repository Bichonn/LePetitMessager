import React from 'react';

export default function UpdateBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-sm btn-outline-secondary ms-2 p-1"
      title="Modifier le post"
      style={{ border: 'none' }}
    >
      <img src="/icons/edit.png" alt="Modifier" style={{ width: '20px', height: '20px' }} />
    </button>
  );
}