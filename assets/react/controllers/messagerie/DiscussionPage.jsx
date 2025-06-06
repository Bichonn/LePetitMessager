import React, { useState } from 'react';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';
import '../../../styles/app.css';
import '../../../styles/Message.css';

export default function DiscussionPage({ recipientId, currentUserId }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReturnClick = () => {
    window.location.href = '/messages';
  };

  return (
    <div className="discussion-container">
      <div className="return-button-container border-bottom border-dark p-2">
        <button 
          onClick={handleReturnClick}
          className="btn btn-primary"
        >
          &larr; Retour à la messagerie
        </button>
      </div>
      <div className="messages-list-container">
        <MessagesList recipientId={recipientId} currentUserId={currentUserId} refreshTrigger={refreshTrigger} />
      </div>
      <div className="message-form-container">
        <MessageForm recipientId={recipientId} onMessageSent={() => setRefreshTrigger(t => t + 1)} />
      </div>
    </div>
  );
}