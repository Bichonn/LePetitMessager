import React, { useEffect, useState } from 'react';
import '../../../styles/Message.css'; // Specific styles for messaging components

// Component to display a list of users for messaging
export default function ListUsers() {
  const [users, setUsers] = useState([]); // State for storing all users with whom there are discussions
  const [following, setFollowing] = useState([]); // State for storing users the current user is following
  const [showFollowing, setShowFollowing] = useState(false); // State to toggle between all users and followed users view

  // Effect to fetch users with whom there are existing discussions on component mount
  useEffect(() => {
    fetch('/messages/users') // API endpoint to get users involved in messages
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetches the list of users the current user is following
  const fetchFollowing = () => {
    fetch('/following') // API endpoint to get followed users
      .then(res => res.json())
      .then(data => {
        setFollowing(data);
        setShowFollowing(true); // Show the following list after fetching
      });
  };

  // Handles click on a user, navigates to the discussion page with that user
  const handleUserClick = (user) => {
    window.location.href = `/messages/${user.id}`; // Redirect to the specific user's message page
  };

  // Toggles the view between all users and followed users
  const toggleShowFollowing = () => {
    if (!showFollowing) {
      fetchFollowing(); // If not showing following, fetch and then show
    } else {
      setShowFollowing(false); // If showing following, hide it
    }
  };

  return (
    <div className="list-users">
      {/* Header section */}
      <div className="d-flex align-items-center p-3 border border-dark bg-color-search inner-shadow">
        <div className="flex-grow-1 text-center">
          <h1 className='text-decoration-underline'>La Petite Messagerie</h1>
        </div>
      </div>

      {/* Toggle button section */}
      <div className="p-2 text-center border border-dark">
        <button 
          className="btn btn-primary" 
          title={showFollowing ? "Retour à la messagerie" : "Voir les suivis"} 
          onClick={toggleShowFollowing}
        >
          {showFollowing ? "Retour à la messagerie" : "Voir les suivis"}
        </button>
      </div>

      {/* Conditional rendering based on showFollowing state */}
      {showFollowing ? (
        // Display list of followed users
        <div>
          <div className="fw-bold mb-2">Vous suivez :</div>
          {following.length === 0 && <div className="text-muted p-2">Aucun suivi</div>}
          {following.map(user => (
            <div
              key={user.id}
              className="user-bar d-flex align-items-center p-2" // Styling for each user item
              onClick={() => handleUserClick(user)} // Action on click
            >
              <img
                src={user.avatar_url || '/default-avatar.png'} // User avatar, with fallback
                alt="avatar"
                className="rounded-circle me-2"
                width={40}
                height={40}
              />
              <span className="fw-bold">{user.username}</span> {/* Username */}
            </div>
          ))}
        </div>
      ) : (
        // Display list of all users with discussions
        <>
          {users.length === 0 && <div className="text-muted p-2">Aucune discussion</div>}
          {users.map(user => (
            <div
              key={user.id}
              className="user-bar d-flex align-items-center p-2" // Styling for each user item
              onClick={() => handleUserClick(user)} // Action on click
            >
              <img
                src={user.avatar_url || '/default-avatar.png'} // User avatar, with fallback
                alt="avatar"
                className="rounded-circle me-2"
                width={40}
                height={40}
              />
              <span className="fw-bold">{user.username}</span> {/* Username */}
            </div>
          ))}
        </>
      )}
    </div>
  );
}