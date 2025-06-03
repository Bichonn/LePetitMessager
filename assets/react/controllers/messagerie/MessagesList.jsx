import React, { useEffect, useState } from 'react';

export default function MessagesList({ recipientId, currentUserId, refreshTrigger }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`/messages/thread/${recipientId}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [recipientId, refreshTrigger]);

  const isVideo = (mediaUrl) => {
    if (!mediaUrl) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    const lowercasedUrl = mediaUrl.toLowerCase();
    return videoExtensions.some(ext => lowercasedUrl.endsWith(ext));
  };

  return (
    <div className="messages-list p-2">
      {messages.length === 0 && <div className="text-muted">Aucun message</div>}
      {messages.map(msg => (
        <div
          key={msg.id}
          className={` ${msg.from === currentUserId ? 'text-end' : 'text-start'}`}
        >
          <div className={`d-inline-block p-2 rounded-0 mb-1 ${msg.from === currentUserId ? 'message-sent' : 'message-received'}`}>
            {msg.content}
            {msg.media && (
              <div style={{ marginTop: '5px' }}>
                {isVideo(msg.media) ? (
                  <video
                    src={msg.media}
                    controls
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      display: 'block',
                      borderRadius: '4px',
                      marginBottom: '5px',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(msg.media, '_blank')}
                  >
                    Votre navigateur ne supporte pas la balise vidéo.
                  </video>
                ) : (
                  <img
                    src={msg.media}
                    alt="Média"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      display: 'block',
                      borderRadius: '4px',
                      marginBottom: '5px',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(msg.media, '_blank')}
                  />
                )}
              </div>
            )}
            <div className="small text-muted">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}