import React, { useState } from 'react';
import MessagesList from './MessagesList'; // Component to display the list of messages
import MessageForm from './MessageForm'; // Component for the message input form
import '../../../styles/app.css'; // General application styles
import '../../../styles/Message.css'; // Specific styles for messaging components

// Main component for the discussion page between two users
export default function DiscussionPage({ recipientId, currentUserId }) {
  // State to trigger a refresh of the messages list
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handles the click on the return button, navigates back to the main messaging page
  const handleReturnClick = () => {
    window.location.href = '/messages'; // Redirects to the messages overview
  };

  return (
    <div className="discussion-container">
      {/* Container for the return button */}
      <div className="return-button-container border-bottom border-dark p-2">
        <button 
          onClick={handleReturnClick}
          className="btn btn-primary"
        >
          &larr; Retour à la messagerie {/* Text for the return button */}
        </button>
      </div>
      {/* Container for the list of messages */}
      <div className="messages-list-container">
        <MessagesList recipientId={recipientId} currentUserId={currentUserId} refreshTrigger={refreshTrigger} />
      </div>
      {/* Container for the message input form */}
      <div className="message-form-container">
        {/* MessageForm component, triggers refresh when a message is sent */}
        <MessageForm recipientId={recipientId} onMessageSent={() => setRefreshTrigger(t => t + 1)} />
      </div>
    </div>
  );
}