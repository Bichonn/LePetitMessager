import React, { useEffect, useState } from 'react';

export default function ListUsers() {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    fetch('/messages/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const fetchFollowing = () => {
    fetch('/following')
      .then(res => res.json())
      .then(data => {
        setFollowing(data);
        setShowFollowing(true);
      });
  };

  const handleUserClick = (user) => {
    window.location.href = `/messages/${user.id}`;
  };

  return (
    <div className="list-users">
      <div className="d-flex justify-content-between align-items-center p-2">
        <h5>Messagerie</h5>
        <button
          className="btn btn-link p-0"
          title="Voir les suivis"
          onClick={fetchFollowing}
        >
          <img src="/icons/following.png" alt="Suivis" style={{ width: 24, height: 24 }} />
        </button>
      </div>
      {showFollowing ? (
        <div>
          <div className="fw-bold mb-2">Vous suivez :</div>
          {following.length === 0 && <div className="text-muted p-2">Aucun suivi</div>}
          {following.map(user => (
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
          <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setShowFollowing(false)}>
            Retour à la messagerie
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}