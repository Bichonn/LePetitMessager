import React, { useEffect, useState } from 'react';

export default function ListUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/messages/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleUserClick = (user) => {
    // Redirige vers la page de discussion avec l'utilisateur sélectionné
    window.location.href = `/messages/${user.id}`;
    // Si tu préfères utiliser le username : `/messages/${user.username}`
  };

  return (
    <div className="list-users border-end">
      <h5 className="p-2">Messagerie</h5>
      {users.length === 0 && <div className="text-muted p-2">Aucune discussion</div>}
      {users.map(user => (
        <div
          key={user.id}
          className="user-bar d-flex align-items-center p-2"
          style={{ cursor: 'pointer' }}
          onClick={() => handleUserClick(user)}
        >
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt="avatar"
            className="rounded-circle me-2"
            width={40}
            height={40}
          />
          <span className="fw-bold">{user.username}</span>
        </div>
      ))}
    </div>
  );
}