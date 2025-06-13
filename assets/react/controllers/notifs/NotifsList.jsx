import React, { useEffect, useState } from "react";
import "../../../styles/Notifications.css"; // Specific styles for notifications

// Function to format relative timestamps for notification dates
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date; // Difference in milliseconds
  const diffInSeconds = Math.floor(diffInMs / 1000); // Difference in seconds

  if (diffInSeconds < 30) {
    return "À l'instant"; // "Just now"
  } else if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds}s`; // "X seconds ago"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} min`; // "X minutes ago"
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours}h`; // "X hours ago"
  } else if (diffInSeconds < 604800) { // Less than a week
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days}j`; // "X days ago"
  } else {
    // Format date as "Day Month" for older notifications
    return date.toLocaleDateString('fr-FR', { // Using 'fr-FR' for "Day Month" format, adjust if needed
      day: 'numeric',
      month: 'short',
    });
  }
};

// Component to display a list of notifications
export default function NotifsList() {
  const [notifs, setNotifs] = useState([]); // State for storing notifications
  const [loading, setLoading] = useState(true); // State for loading status

  // Effect to fetch notifications on component mount
  useEffect(() => {
    fetch("/notifications/list", {
      headers: { "Accept": "application/json" } // Request JSON response
    })
      .then(res => res.json())
      .then(data => {
        setNotifs(data); // Set fetched notifications
        setLoading(false); // Set loading to false after data is fetched
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  // Display loading message while notifications are being fetched
  if (loading) return <div>Chargement des notifications...</div>;
  // Display message if there are no notifications
  if (!notifs.length) return <div>Aucune notification.</div>;

  return (
    <div>
      {/* Notifications header */}
      <h4 className="text-center p-3 text-decoration-underline border border-dark mb-0 inner-shadow">Vos notifications</h4>
      <div>
        {/* Map through notifications and render each one */}
        {notifs.map(notif => (
          <div
            key={notif.id} // Unique key for each notification
            // Apply 'unread' class if the notification is not read
            className={`notif-bar border boder-dark ${notif.is_read ? "" : " unread"}`}
          >
            {/* Notification content */}
            <div className="notif-content">{notif.content}</div>
            {/* Notification creation date, formatted relatively */}
            <div className="notif-date">{formatRelativeTime(notif.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}