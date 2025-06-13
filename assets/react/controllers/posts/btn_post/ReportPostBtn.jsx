import React, { useState, useEffect } from 'react';

// Component for reporting a post
export default function ReportPostBtn({ postId, postAuthorUsername }) {
  const [showReportModal, setShowReportModal] = useState(false); // State to control the visibility of the report modal
  const [reportReason, setReportReason] = useState(''); // State for the reason of the report
  const [reportFeedback, setReportFeedback] = useState({ type: '', message: '' }); // State for feedback messages (success/error) during report submission
  const [isSubmittingReport, setIsSubmittingReport] = useState(false); // State to track if the report is currently being submitted
  const [showOptionsButton, setShowOptionsButton] = useState(false); // Controls visibility of the 3-dots options icon
  const [showActualReportButton, setShowActualReportButton] = useState(false); // Controls visibility of the "Report" button
  const [currentUserId, setCurrentUserId] = useState(null); // State for the current logged-in user's ID
  // const [postAuthorId, setPostAuthorId] = useState(null); // State for the post author's ID (currently unused, but kept for potential future use like preventing self-reporting)

  useEffect(() => {
    // Fetch current user ID to determine if the options button should be shown
    fetch('/user') // API endpoint to get current user data
      .then(res => res.ok ? res.json() : null) // Parse JSON if response is OK
      .then(userData => {
        if (userData && userData.id) {
          setCurrentUserId(userData.id); // Set current user ID
        }
        if (userData && userData.id) {
            setShowOptionsButton(true); // Show 3-dots if user is logged in
        } else {
            setShowOptionsButton(false); // Hide 3-dots if user is not logged in
        }
      })
      .catch(() => {
        setShowOptionsButton(false); // Hide options button on error (e.g., user not logged in)
      });
  }, [postId]); // Dependency: postId (though current user data is not directly dependent on postId, it's a common pattern to re-evaluate on context change)

  // Toggles the visibility of the "Report" button
  const toggleActualReportButton = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowActualReportButton(prev => !prev);
  };

  // Opens the report modal and hides the "Report" button
  const openModalAndHideButton = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowReportModal(true);
    setShowActualReportButton(false); // Hide the "Report" button itself when modal opens
  };

  // Closes the report modal and resets related states
  const closeModal = () => {
    setShowReportModal(false);
    setReportReason(''); // Clear the report reason
    setReportFeedback({ type: '', message: '' }); // Clear any feedback messages
    // Do not hide the three-dots button here, only the modal
  };

  // Handles the submission of the post report
  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      setReportFeedback({ message: 'Veuillez fournir une raison pour le signalement.', type: 'error' }); // "Please provide a reason for the report."
      return;
    }

    setIsSubmittingReport(true);
    setReportFeedback({ message: '', type: '' }); // Clear previous feedback

    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); // Get CSRF token
      const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Indicate AJAX request
      };
      if (token) {
        headers['X-CSRF-TOKEN'] = token; // Add CSRF token to headers if found
      }

      const response = await fetch(`/post/${postId}/report`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ reason: reportReason }),
      });

      // Check if the response is not OK (status outside 200-299)
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText || 'Erreur inconnue'}`; // "HTTP Error X: Status Text or Unknown error"
        try {
          // Try to read a JSON error message from the server
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // The error response was not JSON, use the HTTP message
          console.error('Failed to parse error response as JSON:', e);
        }
        setReportFeedback({ message: errorMessage, type: 'error' });
        return; // Stop here because the response is not OK
      }

      // If the response is OK, then valid JSON is expected
      const data = await response.json();

      // The success message comes from data.message or is a default message
      setReportFeedback({ message: data.message || 'Post signalé avec succès.', type: 'success' }); // "Post reported successfully."
      setTimeout(() => {
        closeModal(); // Close modal after a delay
      }, 2000);

    } catch (error) {
      // This catch block is for network errors or programming errors in the try block
      console.error('Erreur lors de la requête de signalement:', error); // "Error during report request:"
      setReportFeedback({ message: 'Erreur de connexion lors du signalement. Vérifiez la console pour les détails.', type: 'error' }); // "Connection error during report. Check console for details."
    } finally {
      setIsSubmittingReport(false); // Reset submitting state
    }
  };

  // Do not render the options button if the user is not authenticated
  if (!showOptionsButton) {
    return null; 
  }

  return (
    <div className="report-post-btn-container ms-2" style={{ position: 'relative' }}>
      {/* Button to toggle the actual report button (3-dots icon) */}
      <button
        type="button"
        className="btn btn-sm p-0 report-options-btn" 
        onClick={toggleActualReportButton}
        title="Options pour ce post" // "Options for this post"
      >
        <img src="/icons/3-points.png" alt="Options" className="report-options-icon" style={{ filter: 'var(--icon-filter, none)' }} />
      </button>

      {/* Actual "Report" button, shown when toggled */}
      {showActualReportButton && (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm position-absolute report-action-button" 
          onClick={openModalAndHideButton}
          title="Signaler ce post" // "Report this post"
          style={{
            bottom: '20%', 
            right: '100%',  
            marginBottom: '1px', 
            marginRight: '2px', 
            zIndex: 10
            // whiteSpace: 'nowrap' // Ensures the button text stays on one line, can be inherited or set here
          }}
        >
          Signaler {/* "Report" */}
        </button>
      )}

      {/* Report modal, shown when showReportModal is true */}
      {showReportModal && (
        <div className="modal fade show d-block report-modal-custom" tabIndex="-1" onClick={closeModal}> {/* Modal backdrop click closes modal */}
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}> {/* Prevent modal content click from closing modal */}
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Signaler le post de : {postAuthorUsername}</h5> {/* "Report post by: " */}
                <button type="button" className="btn-close" onClick={closeModal} disabled={isSubmittingReport}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor={`reportReasonPost-${postId}`} className="form-label">Raison du signalement:</label> {/* "Reason for reporting:" */}
                  <textarea
                    className="form-control"
                    id={`reportReasonPost-${postId}`}
                    rows="3"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    disabled={isSubmittingReport}
                    placeholder="Expliquez pourquoi vous signalez ce post..." // "Explain why you are reporting this post..."
                  ></textarea>
                </div>
                {/* Feedback message display */}
                {reportFeedback.message && (
                  <div className={`custom-alert alert-${reportFeedback.type === 'success' ? 'success' : 'danger'}`}>
                    {reportFeedback.message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn custom-cancel-button" onClick={closeModal} disabled={isSubmittingReport}>
                  Annuler {/* "Cancel" */}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleReportPost}
                  disabled={isSubmittingReport || !reportReason.trim()} // Disable if submitting or reason is empty
                >
                  {isSubmittingReport ? 'Envoi...' : 'Signaler'} {/* "Sending..." : "Report" */}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}