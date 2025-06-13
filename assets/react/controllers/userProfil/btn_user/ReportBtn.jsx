import React, { useState, useEffect } from 'react';
import '../../../../styles/ShowProfil.css';
import '../../../../styles/app.css';

/**
 * Component for reporting users with a collapsible options menu
 */
export default function ReportBtn({ userId, username }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportFeedback, setReportFeedback] = useState({ message: '', type: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showActualReportButton, setShowActualReportButton] = useState(false);
  const [displayOptionsButton, setDisplayOptionsButton] = useState(false); // Show 3-dots icon for options

  // Check if current user can report this profile (not own profile)
  useEffect(() => {
    fetch('/user') // Fetch current authenticated user
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Not authenticated or error fetching current user');
      })
      .then(currentUser => {
        if (currentUser && currentUser.id !== userId) {
          setDisplayOptionsButton(true); // Show options icon for other users
          setShowActualReportButton(false); // Hide report button by default
        } else {
          setDisplayOptionsButton(false); // Hide options for own profile
          setShowActualReportButton(false); // Hide report button
        }
      })
      .catch(() => {
        setDisplayOptionsButton(false); // Hide on authentication error
        setShowActualReportButton(false); // Hide on error
      });
  }, [userId]);

  // Handle user report submission
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
        // Auto-close modal after successful report
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

  // Toggle visibility of report button
  const toggleReportButtonVisibility = () => {
    setShowActualReportButton(prev => !prev);
  };

  // Open report modal and hide options
  const openModalAndHideButton = () => {
    setReportFeedback({ message: '', type: '' });
    setShowReportModal(true); // Show report modal
    setShowActualReportButton(false); // Hide report button
  };

  // Close report modal
  const closeModal = () => {
    setShowReportModal(false);
  };

  return (
    <div className="report-options-container mt-2">
      {/* Options button (3 dots) for accessing report functionality */}
      {displayOptionsButton && (
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

      {/* Report button that appears when options are clicked */}
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

      {/* Report modal */}
      {showReportModal && (
        <div 
          className="modal fade show d-block report-modal-custom" 
          tabIndex="-1" 
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Modal header */}
              <div className="modal-header">
                <h5 className="modal-title">Signaler {username}</h5>
                <button type="button" className="btn-close" onClick={closeModal} disabled={isSubmittingReport}></button>
              </div>
              <div className="modal-body">
                {/* Report reason input */}
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
                {/* Feedback message display */}
                {reportFeedback.message && (
                  <div className={`custom-alert${reportFeedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {reportFeedback.message}
                  </div>
                )}
              </div>
              {/* Modal action buttons */}
              <div className="modal-footer">
                <button type="button" className="btn custom-cancel-button" onClick={closeModal} disabled={isSubmittingReport}>
                  Annuler
                </button>
                <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleReportUser} 
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