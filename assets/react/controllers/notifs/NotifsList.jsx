import React, { useEffect, useState } from "react";
import "../../../styles/Notifications.css";

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);

  if (diffInSeconds < 30) {
    return "À l'instant";
  } else if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours}h`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days}j`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }
};

export default function NotifsList() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/notifications/list", {
      headers: { "Accept": "application/json" }
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
      <h4 className="text-center p-3 text-decoration-underline border border-dark mb-0 inner-shadow">Vos notifications</h4>
      <div>
        {notifs.map(notif => (
          <div
            key={notif.id}
            className={`notif-bar border boder-dark ${notif.is_read ? "" : " unread"}`}
          >
            <div className="notif-content">{notif.content}</div>
            <div className="notif-date">{formatRelativeTime(notif.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}