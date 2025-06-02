import React, { useState, useEffect } from 'react';
import '../../../../styles/ShowProfil.css';
import '../../../../styles/app.css';

export default function ReportBtn({ userId, username }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportFeedback, setReportFeedback] = useState({ message: '', type: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showActualReportButton, setShowActualReportButton] = useState(false);
  const [displayOptionsButton, setDisplayOptionsButton] = useState(false); // Added state for the 3-dots icon

  // Check if the current user is the one being viewed to hide the report button for self
  useEffect(() => {
    fetch('/user') // Assuming this endpoint returns current user's ID or details
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Not authenticated or error fetching current user');
      })
      .then(currentUser => {
        if (currentUser && currentUser.id !== userId) {
          setDisplayOptionsButton(true); // Show the 3-dots options icon
          setShowActualReportButton(false); // Ensure "Signaler" button is hidden by default
        } else {
          setDisplayOptionsButton(false); // Hide 3-dots icon
          setShowActualReportButton(false); // Hide button if own profile or not logged in
        }
      })
      .catch(() => {
        setDisplayOptionsButton(false); // Hide 3-dots icon on error
        setShowActualReportButton(false); // Hide on error or if not authenticated
      });
  }, [userId]);

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      setReportFeedback({ message: 'Veuillez fournir une raison pour le signalement.', type: 'error' });
      return;
    }

    setIsSubmittingReport(true);
    setReportFeedback({ message: '', type: '' });

    try {
      const headers = { 
        'Content-Type': 'application/json',
      };

      const response = await fetch(`/user/${userId}/report`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ reason: reportReason }),
      });
      const data = await response.json();
      if (response.ok) {
        setReportFeedback({ message: 'Utilisateur signalé avec succès.', type: 'success' });
        setTimeout(() => {
          setShowReportModal(false);
          setReportReason('');
          setReportFeedback({ message: '', type: '' });
        }, 2000);
      } else {
        if (response.status === 403) {
             setReportFeedback({ message: data.message || 'Action non autorisée (jeton de sécurité invalide).', type: 'error' });
        } else {
            setReportFeedback({ message: data.message || 'Erreur lors du signalement.', type: 'error' });
        }
      }
    } catch (error) {
      setReportFeedback({ message: 'Erreur de connexion lors du signalement.', type: 'error' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const toggleReportButtonVisibility = () => {
    setShowActualReportButton(prev => !prev);
  };

  const openModalAndHideButton = () => {
    setReportFeedback({ message: '', type: '' });
    setShowReportModal(true); // Directly show modal
    setShowActualReportButton(false); // Hide the "Signaler" button
  };

  const closeModal = () => {
    setShowReportModal(false);
  };

  return (
    <div className="report-options-container mt-2">
      {displayOptionsButton && ( // Conditionally render the 3-dots button
        <button
          type="button"
          className="btn btn-sm p-0"
          onClick={toggleReportButtonVisibility}
          title="Options"
          aria-label="Options pour cet utilisateur"
        >
          <img 
            src="/icons/3-points.png" 
            alt="Options" 
            className="report-options-icon"
          />
        </button>
      )}

      {showActualReportButton && (
        <div className="position-relative">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm position-absolute report-action-button" 
            onClick={openModalAndHideButton}
            title="Signaler cet utilisateur"
          >
            Signaler
          </button>
        </div>
      )}

      {showReportModal && (
        <div 
          className="modal fade show d-block report-modal-custom" 
          tabIndex="-1" 
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Signaler {username}</h5>
                <button type="button" className="btn-close" onClick={closeModal} disabled={isSubmittingReport}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor={`reportReason-${userId}`} className="form-label">Raison du signalement:</label>
                  <textarea
                    className="form-control"
                    id={`reportReason-${userId}`}
                    rows="3"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    disabled={isSubmittingReport}
                    placeholder="Expliquez pourquoi vous signalez cet utilisateur..."
                  ></textarea>
                </div>
                {reportFeedback.message && (
                  <div className={`custom-alert${reportFeedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
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
                    onClick={handleReportUser} 
                    disabled={isSubmittingReport || !reportReason.trim()} // REMOVED || !csrfToken
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