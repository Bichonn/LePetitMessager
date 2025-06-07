import React, { useEffect, useState } from "react";
import NavIcons from "../layout/NavIcons";

export default function NotifIcon() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    fetch("/notifications/list", { headers: { Accept: "application/json" } })
      .then(res => res.json())
      .then(data => {
        setHasUnread(data.some(notif => !notif.is_read));
      });
  }, []);

  const handleClick = () => {
    fetch("/notifications/read", {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" }
    }).then(() => setHasUnread(false));
    window.location.href = "/notifications";
  };

    return (
    <span onClick={handleClick} style={{ cursor: "pointer" }}>
      <NavIcons
        iconPath={hasUnread ? "/icons/notif-reading.png" : "/icons/notif.png"}
        iconName="Courrier"
        className={hasUnread ? "notif-shake" : ""}
      />
    </span>
  );
}