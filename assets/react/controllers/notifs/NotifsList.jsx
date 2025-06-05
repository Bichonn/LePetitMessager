import React, { useEffect, useState } from "react";

export default function NotifsList() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/notifications", {
      headers: {
        "Accept": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        setNotifs(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement des notifications...</div>;

  if (!notifs.length) return <div>Aucune notification.</div>;

  return (
    <div>
      <h4>Vos notifications</h4>
      <ul className="list-group">
        {notifs.map(notif => (
          <li
            key={notif.id}
            className={`list-group-item d-flex justify-content-between align-items-center ${notif.is_read ? '' : 'fw-bold'}`}
          >
            <span>{notif.content}</span>
            <span className="text-muted" style={{ fontSize: "0.8em" }}>
              {notif.created_at}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}