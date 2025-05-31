import React, { useState, useEffect } from 'react';
import '../../../../styles/ShowProfil.css'; 

export default function ReportBtn({ userId, username }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportFeedback, setReportFeedback] = useState({ message: '', type: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showActualReportButton, setShowActualReportButton] = useState(false);
  const [csrfToken, setCsrfToken] = useState(''); // Décommenté

  useEffect(() => { // Décommenté et adapté
    if (showActualReportButton || showReportModal) { // Fetch token only when needed
      fetch('/get-csrf-token')
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            setCsrfToken(data.token);
          } else {
            console.error("CSRF token not received");
            setReportFeedback({ message: 'Erreur de sécurité (jeton CSRF manquant). Veuillez rafraîchir.', type: 'error' });
          }
        })
        .catch(err => {
          console.error("Failed to fetch CSRF token for reporting", err);
          setReportFeedback({ message: 'Erreur de sécurité (impossible de récupérer le jeton CSRF). Veuillez rafraîchir.', type: 'error' });
        });
    }
  }, [showActualReportButton, showReportModal]); // Re-fetch if the button or modal becomes visible

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      setReportFeedback({ message: 'Veuillez fournir une raison pour le signalement.', type: 'error' });
      return;
    }

    if (!csrfToken) { // Vérification du jeton CSRF
      setReportFeedback({ message: 'Action non autorisée (jeton de sécurité manquant). Veuillez rafraîchir la page.', type: 'error' });
      return;
    }

    setIsSubmittingReport(true);
    setReportFeedback({ message: '', type: '' });

    try {
      const headers = { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken // Ajout du jeton CSRF à l'en-tête
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
    if (!csrfToken && showActualReportButton) { // Ensure token is fetched if button was just made visible
         fetch('/get-csrf-token')
            .then(res => res.json())
            .then(data => {
              if (data.token) setCsrfToken(data.token);
              else console.error("CSRF token not received on modal open");
            }).catch(err => console.error("Failed to fetch CSRF token on modal open", err));
    }
    setReportFeedback({ message: '', type: '' });
    setShowReportModal(true);
    setShowActualReportButton(false); 
  };

  const closeModal = () => {
    setShowReportModal(false);
  };

  return (
    <div className="report-options-container mt-2">
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

      {showActualReportButton && (
        <div className="position-relative">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm position-absolute report-action-button" 
            onClick={openModalAndHideButton}
            title="Signaler cet utilisateur"
            disabled={!csrfToken && showActualReportButton} // Disable if token not yet fetched
          >
            <img 
              src="/icons/report.png" 
              alt="" 
              className="report-button-icon"
            />
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
                  <div className={`alert ${reportFeedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {reportFeedback.message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isSubmittingReport}>
                  Annuler
                </button>
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleReportUser} 
                    disabled={isSubmittingReport || !reportReason.trim() || !csrfToken}
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