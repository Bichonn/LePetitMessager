// filepath: assets/react/controllers/userProfil/btn_user/ReportUserButton.jsx
import React, { useState, useEffect } from 'react';

export default function ReportBtn({ userId, username }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportFeedback, setReportFeedback] = useState({ message: '', type: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  // const [csrfToken, setCsrfToken] = useState(''); // Décommentez si vous utilisez CSRF

  // Décommentez et adaptez si vous utilisez CSRF
  // useEffect(() => {
  //   fetch('/get-csrf-token') 
  //       .then(res => res.json())
  //       .then(data => {
  //           if (data.token) {
  //               setCsrfToken(data.token);
  //           }
  //       })
  //       .catch(err => console.error("Failed to fetch CSRF token for reporting", err));
  // }, []);

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      setReportFeedback({ message: 'Veuillez fournir une raison pour le signalement.', type: 'error' });
      return;
    }
    // Décommentez et adaptez si vous utilisez CSRF
    // if (!csrfToken && document.querySelector('meta[name="csrf-token"]')) { 
    //     setCsrfToken(document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'));
    // }
    // if (!csrfToken) {
    //   setReportFeedback({ message: 'Action non autorisée (token manquant). Veuillez rafraîchir.', type: 'error' });
    //   return;
    // }

    setIsSubmittingReport(true);
    setReportFeedback({ message: '', type: '' });

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      // Décommentez et adaptez si vous utilisez CSRF
      // if (csrfToken) {
      //   headers['X-CSRF-TOKEN'] = csrfToken;
      // }

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
        setReportFeedback({ message: data.message || 'Erreur lors du signalement.', type: 'error' });
      }
    } catch (error) {
      setReportFeedback({ message: 'Erreur de connexion lors du signalement.', type: 'error' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-outline-danger mt-2"
        onClick={() => {
          setReportFeedback({ message: '', type: '' });
          setShowReportModal(true);
        }}
        title="Signaler cet utilisateur"
      >
        <img src="/icons/report.png" alt="Signaler" style={{ width: '20px', height: '20px', marginRight: '5px' }} />
        Signaler
      </button>

      {showReportModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Signaler {username}</h5>
                <button type="button" className="btn-close" onClick={() => setShowReportModal(false)} disabled={isSubmittingReport}></button>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)} disabled={isSubmittingReport}>
                  Annuler
                </button>
                <button type="button" className="btn btn-danger" onClick={handleReportUser} disabled={isSubmittingReport || !reportReason.trim()}>
                  {isSubmittingReport ? 'Envoi...' : 'Signaler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}