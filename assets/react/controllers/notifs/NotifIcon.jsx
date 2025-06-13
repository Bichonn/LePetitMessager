import React, { useEffect, useState } from "react";
import NavIcons from "../layout/NavIcons"; // Component for displaying navigation icons

// Component for the notification icon, indicating unread notifications
export default function NotifIcon() {
  const [hasUnread, setHasUnread] = useState(false); // State to track if there are unread notifications

  // Effect to fetch notifications and check for unread ones on component mount
  useEffect(() => {
    fetch("/notifications/list", { headers: { Accept: "application/json" } }) // API endpoint to get notifications
      .then(res => res.json())
      .then(data => {
        // Check if any notification in the fetched data is unread
        setHasUnread(data.some(notif => !notif.is_read));
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handles click on the notification icon
  const handleClick = () => {
    // Mark notifications as read via a POST request
    fetch("/notifications/read", {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" } // Indicate AJAX request for Symfony
    }).then(() => setHasUnread(false)); // Update state to reflect no unread notifications
    window.location.href = "/notifications"; // Redirect to the notifications page
  };

    return (
    // Clickable span that triggers the handleClick function
    <span onClick={handleClick} style={{ cursor: "pointer" }}>
      <NavIcons
        // Dynamically set icon based on unread status
        iconPath={hasUnread ? "/icons/notif-reading.png" : "/icons/notif.png"}
        iconName="Courrier" // Name of the icon (can be used for accessibility or tooltips)
        // Apply a shaking animation if there are unread notifications
        className={hasUnread ? "notif-shake" : ""}
      />
    </span>
  );
}