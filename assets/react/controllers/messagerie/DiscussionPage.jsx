import React, { useState } from 'react';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';

export default function DiscussionPage({ recipientId, currentUserId }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <MessagesList recipientId={recipientId} currentUserId={currentUserId} refreshTrigger={refreshTrigger} />
      <MessageForm recipientId={recipientId} onMessageSent={() => setRefreshTrigger(t => t + 1)} />
    </>
  );
}