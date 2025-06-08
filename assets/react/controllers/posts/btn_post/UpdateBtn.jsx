import React from 'react';

export default function UpdateBtn({ onClick }) {
  const cacheBuster = new Date().getTime();
  return (
    <button
      onClick={onClick}
      className="btn btn-sm btn-outline-secondary ms-2 p-1"
      title="Modifier le post"
      style={{ border: 'none' }}
    >
      <img src={`/icons/edit.png?v=${cacheBuster}`} alt="Modifier" className="edit-icon" style={{ width: '20px', height: '20px' }} />
    </button>
  );
}