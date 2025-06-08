import React, { useState, useEffect } from 'react';

export default function ReportPostBtn({ postId, postAuthorUsername }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportFeedback, setReportFeedback] = useState({ type: '', message: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showOptionsButton, setShowOptionsButton] = useState(false); // Controls visibility of 3-dots icon
  const [showActualReportButton, setShowActualReportButton] = useState(false); // Controls visibility of "Signaler" button
  const [currentUserId, setCurrentUserId] = useState(null);
  const [postAuthorId, setPostAuthorId] = useState(null);

  useEffect(() => {
    // Fetch current user ID and post author ID to prevent self-reporting display
    fetch('/user')
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        if (userData && userData.id) {
          setCurrentUserId(userData.id);
        }
        if (userData && userData.id) {
            setShowOptionsButton(true); // Show 3-dots if user is logged in
        } else {
            setShowOptionsButton(false);
        }
      })
      .catch(() => {
        setShowOptionsButton(false);
      });
  }, [postId]);

  const toggleActualReportButton = (e) => {
    e.stopPropagation();
    setShowActualReportButton(prev => !prev);
  };

  const openModalAndHideButton = (e) => {
    e.stopPropagation();
    setShowReportModal(true);
    setShowActualReportButton(false); // Hide the "Signaler" button itself
  };

  const closeModal = () => {
    setShowReportModal(false);
    setReportReason('');
    setReportFeedback({ type: '', message: '' });
    // Do not hide the three-dots button here, only the modal
  };

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      setReportFeedback({ message: 'Veuillez fournir une raison pour le signalement.', type: 'error' });
      return;
    }

    setIsSubmittingReport(true);
    setReportFeedback({ message: '', type: '' });

    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
      if (token) {
        headers['X-CSRF-TOKEN'] = token;
      }

      const response = await fetch(`/post/${postId}/report`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ reason: reportReason }),
      });

      // Vérifier si la réponse n'est pas OK (status hors 200-299)
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText || 'Erreur inconnue'}`;
        try {
          // Essayer de lire un message d'erreur JSON du serveur
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // La réponse d'erreur n'était pas du JSON, utiliser le message HTTP
          console.error('Failed to parse error response as JSON:', e);
        }
        setReportFeedback({ message: errorMessage, type: 'error' });
        return; // Arrêter ici car la réponse n'est pas OK
      }

      // Si la réponse est OK, alors on s'attend à du JSON valide
      const data = await response.json();

      // Le message de succès vient de data.message ou est un message par défaut
      setReportFeedback({ message: data.message || 'Post signalé avec succès.', type: 'success' });
      setTimeout(() => {
        closeModal();
      }, 2000);

    } catch (error) {
      // Ce bloc catch est pour les erreurs réseau ou les erreurs de programmation dans le bloc try
      console.error('Erreur lors de la requête de signalement:', error);
      setReportFeedback({ message: 'Erreur de connexion lors du signalement. Vérifiez la console pour les détails.', type: 'error' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!showOptionsButton) {
    return null; // Don't render anything if user is not authenticated or it's their own post (optional logic)
  }

  return (
    <div className="report-post-btn-container ms-2" style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-sm p-0 report-options-btn" // Re-use class if styles are shared
        onClick={toggleActualReportButton}
        title="Options pour ce post"
      >
        <img src="/icons/3-points.png" alt="Options" className="report-options-icon" style={{ filter: 'var(--icon-filter, none)' }} />
      </button>

      {showActualReportButton && (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm position-absolute report-action-button" // report-action-button class provides white-space: nowrap
          onClick={openModalAndHideButton}
          title="Signaler ce post"
          style={{
            bottom: '100%', // Position above the 3-dots icon
            right: '100%',  // Position to the left of the 3-dots icon
            marginBottom: '1px', // Space above the icon
            marginRight: '2px', // Space to the left of the icon
            zIndex: 10
            // whiteSpace: 'nowrap' // This can be inherited from report-action-button or added here
          }}
        >
          Signaler
        </button>
      )}

      {showReportModal && (
        <div className="modal fade show d-block report-modal-custom" tabIndex="-1" onClick={closeModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Signaler le post de : {postAuthorUsername}</h5>
                <button type="button" className="btn-close" onClick={closeModal} disabled={isSubmittingReport}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor={`reportReasonPost-${postId}`} className="form-label">Raison du signalement:</label>
                  <textarea
                    className="form-control"
                    id={`reportReasonPost-${postId}`}
                    rows="3"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    disabled={isSubmittingReport}
                    placeholder="Expliquez pourquoi vous signalez ce post..."
                  ></textarea>
                </div>
                {reportFeedback.message && (
                  <div className={`custom-alert alert-${reportFeedback.type === 'success' ? 'success' : 'danger'}`}>
                    {reportFeedback.message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn custom-cancel-button" onClick={closeModal} disabled={isSubmittingReport}>
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleReportPost}
                  disabled={isSubmittingReport || !reportReason.trim()}
                >
                  {isSubmittingReport ? 'Envoi...' : 'Signaler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}