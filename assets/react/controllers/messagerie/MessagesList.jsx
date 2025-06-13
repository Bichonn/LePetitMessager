import React, { useEffect, useState } from 'react';

// Component to display a list of messages in a discussion thread
export default function MessagesList({ recipientId, currentUserId, refreshTrigger }) {
  const [messages, setMessages] = useState([]); // State for storing messages

  // Effect to fetch messages when recipientId or refreshTrigger changes
  useEffect(() => {
    fetch(`/messages/thread/${recipientId}`) // API endpoint to get messages for a specific thread
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [recipientId, refreshTrigger]); // Dependencies for re-fetching messages

  // Helper function to check if a media URL is a video
  const isVideo = (mediaUrl) => {
    if (!mediaUrl) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg']; // Common video file extensions
    const lowercasedUrl = mediaUrl.toLowerCase();
    return videoExtensions.some(ext => lowercasedUrl.endsWith(ext)); // Check if URL ends with any video extension
  };

  return (
    <div className="messages-list p-2">
      {/* Display message if there are no messages */}
      {messages.length === 0 && <div className="text-muted">Aucun message</div>}
      {/* Map through messages and render each one */}
      {messages.map(msg => (
        <div
          key={msg.id} // Unique key for each message
          className={` ${msg.from === currentUserId ? 'text-end' : 'text-start'}`} // Align message based on sender
        >
          {/* Message bubble styling based on sender */}
          <div className={`d-inline-block p-2 rounded-0 mb-1 ${msg.from === currentUserId ? 'message-sent' : 'message-received'}`}>
            {/* Message content */}
            {msg.content}
            {/* Display media if present */}
            {msg.media && (
              <div className="message-media-container">
                {isVideo(msg.media) ? (
                  // Display video player if media is a video
                  <video
                    src={msg.media}
                    controls
                    className="message-media"
                    onClick={() => window.open(msg.media, '_blank')} // Open media in new tab on click
                  >
                    Votre navigateur ne supporte pas la balise vidéo. {/* Fallback text for video tag */}
                  </video>
                ) : (
                  // Display image if media is an image
                  <img
                    src={msg.media}
                    alt="Média" // Alt text for media
                    className="message-media"
                    onClick={() => window.open(msg.media, '_blank')} // Open media in new tab on click
                  />
                )}
              </div>
            )}
            {/* Timestamp of the message */}
            <div className="small text-muted">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}