import React, { useEffect, useState } from 'react';

export default function MessagesList({ recipientId, currentUserId, refreshTrigger }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`/messages/thread/${recipientId}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [recipientId, refreshTrigger]);

  return (
    <div className="messages-list p-2">
      {messages.length === 0 && <div className="text-muted">Aucun message</div>}
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`mb-2 ${msg.from === currentUserId ? 'text-end' : 'text-start'}`}
        >
          <div className={`d-inline-block p-2 rounded ${msg.from === currentUserId ? 'bg-primary text-white' : 'bg-light'}`}>
            {msg.content}
            {msg.media && (
              <div>
                <a href={`/uploads/${msg.media}`} target="_blank" rel="noopener noreferrer">Voir le média</a>
              </div>
            )}
            <div className="small text-muted">{msg.created_at}</div>
          </div>
        </div>
      ))}
    </div>
  );
}