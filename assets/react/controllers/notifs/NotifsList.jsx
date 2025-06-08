import React, { useEffect, useState } from "react";
import "../../../styles/Notifications.css";

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
      <h4 className="text-center text-decoration-underline mb-3">Vos notifications</h4>
      <div>
        {notifs.map(notif => (
          <div
            key={notif.id}
            className={`notif-bar${notif.is_read ? "" : " unread"}`}
          >
            
            <div className="notif-content">{notif.content}</div>
            <div className="notif-date">{notif.created_at}</div>
          </div>
        ))}
      </div>
    </div>
  );
}