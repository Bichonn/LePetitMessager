import React, { useState, useEffect } from 'react';

import SearchBar from '../SearchBar';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import LogOut from '../auth/LogOut';
import Footer from './Footer';
import CommentsList from '../comments/CommentsList';
import CommentForm from '../comments/CommentForm';
import PaypalButton from '../premium/PaypalButton';
import SuggestedUsers from '../SuggestedUsers';
import GoogleAuthBtn from '../auth/GoogleAuthBtn';

// Component for managing the right sidebar area
export default function RightSidebarArea({ isAuthenticated, username, logoutPath }) {
  const [currentView, setCurrentView] = useState('default');
  const [postIdForComments, setPostIdForComments] = useState(null);

  useEffect(() => {
    // Event listener to handle showing comments for a specific post
    const handleShowComments = (event) => {
      const { postId } = event.detail;
      if (postId) {
        setPostIdForComments(postId);
        setCurrentView('comments');
      }
    };
    document.addEventListener('showPostCommentsInSidebar', handleShowComments);
    return () => {
      document.removeEventListener('showPostCommentsInSidebar', handleShowComments);
    };
  }, []);

  // Switch back to the default sidebar view
  const switchToDefaultView = () => {
    setCurrentView('default');
    setPostIdForComments(null);
  };

  // Render the default sidebar view
  const renderDefaultSidebar = () => (
    <>
      <SearchBar />
      {!isAuthenticated ? (
        <div className="container border-bottom border-top border-dark">
          <div className="d-flex justify-content-center mb-1 mt-3">
            <h5 className="text-center text-decoration-underline">Messager ! à votre plume !</h5>
          </div>
          <div className="d-flex justify-content-center mb-3">
            <LoginForm />
            <RegisterForm />
          </div>
        </div>
      ) : (
        <>
          <LogOut username={username} logoutPath={logoutPath} />
          <PaypalButton onPaymentSuccess={() => window.location.reload()} />
          <SuggestedUsers />
        </>
      )}
    </>
  );

  // Render the comments view
  const renderCommentsView = () => (
    <div className="comments-view border-bottom border-dark">
      <button onClick={switchToDefaultView} className="btn btn-primary flex-shrink-0">
        &larr; Retirer les commentaires
      </button>
      <CommentForm
        postId={postIdForComments}
        onCommentAdded={() => {
          console.log(`Nouveau commentaire ajouté au post ${postIdForComments}. CommentsList pourrait avoir besoin d'être actualisé.`);
        }}
        className="flex-shrink-0" // Prevent CommentForm from shrinking/growing
      />
      <div className="comments-list-scrollable-container">
        <CommentsList postId={postIdForComments} />
      </div>
    </div>
  );

  return (
    // Main container for the sidebar area
    <div className="sidebar-area-container border-start border-dark">
      {currentView === 'comments' && postIdForComments ? renderCommentsView() : renderDefaultSidebar()}
      {currentView !== 'comments' && <Footer />}
    </div>
  );
}