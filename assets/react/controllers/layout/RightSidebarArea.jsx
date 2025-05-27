import React, { useState, useEffect } from 'react';

import SearchBar from '../SearchBar';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import LogOut from '../auth/LogOut'; // Assurez-vous que ce composant existe dans assets/react/controllers/auth/
import Footer from './Footer';       // Assurez-vous que ce composant existe dans assets/react/controllers/layout/

// Assurez-vous que ces composants de commentaires existent et sont correctement importés
import CommentsList from '../comments/CommentsList'; // Ex: assets/react/controllers/comments/CommentsList.jsx
import CommentForm from '../comments/CommentForm';   // Ex: assets/react/controllers/comments/CommentForm.jsx

export default function RightSidebarArea({ isAuthenticated, username, logoutPath }) {
  const [currentView, setCurrentView] = useState('default'); // 'default' ou 'comments'
  const [postIdForComments, setPostIdForComments] = useState(null);

  useEffect(() => {
    const handleShowComments = (event) => {
      const { postId } = event.detail;
      if (postId) {
        setPostIdForComments(postId);
        setCurrentView('comments');
      }
    };

    // Écoute d'un événement personnalisé pour afficher les commentaires
    document.addEventListener('showPostCommentsInSidebar', handleShowComments);

    return () => {
      // Nettoyage de l'écouteur d'événements
      document.removeEventListener('showPostCommentsInSidebar', handleShowComments);
    };
  }, []); // S'exécute une seule fois au montage

  const switchToDefaultView = () => {
    setCurrentView('default');
    setPostIdForComments(null);
  };

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
        <LogOut username={username} logoutPath={logoutPath} />
      )}
    </>
  );

  const renderCommentsView = () => (
    <div className="container p-3">
      <button onClick={switchToDefaultView} className="btn btn-sm btn-outline-secondary mb-3">
        &larr; Retour à la sidebar
      </button>
      {/* CommentsList devrait prendre postId et gérer l'affichage des commentaires */}
      <CommentsList postId={postIdForComments} />
      {/* CommentForm prend postId et une fonction callback pour un nouveau commentaire */}
      <CommentForm postId={postIdForComments} onCommentAdded={() => {
        // Optionnel : Actualiser CommentsList ou notifier l'utilisateur
        // Par exemple, CommentsList pourrait écouter un événement spécifique.
        console.log(`Nouveau commentaire ajouté au post ${postIdForComments}. CommentsList pourrait avoir besoin d'être actualisé.`);
        // Vous pourriez déclencher un événement ici pour que CommentsList le capte et se mette à jour.
        // document.dispatchEvent(new CustomEvent(`commentAddedToPost_${postIdForComments}`));
      }} />
    </div>
  );

  return (
    <>
      {currentView === 'comments' && postIdForComments ? renderCommentsView() : renderDefaultSidebar()}
      <Footer />
    </>
  );
}