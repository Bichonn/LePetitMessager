import React, { useState } from 'react';

// Component for the message input form
export default function MessageForm({ recipientId, onMessageSent }) {
  const [content, setContent] = useState(''); // Text content of the message
  const [file, setFile] = useState(null); // Media file (image/video)
  const [preview, setPreview] = useState(null); // Media preview URL
  const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state
  const [feedback, setFeedback] = useState({ type: '', message: '' }); // Feedback message for the user

  // Handles media file selection and preview generation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Generate preview based on file type
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview({ type: 'image', url: reader.result });
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type.startsWith('video/')) {
        setPreview({ type: 'video', url: URL.createObjectURL(selectedFile) });
      } else {
        setPreview(null); // No preview for unsupported types
      }
    } else {
      // Reset file and preview if no file is selected
      if (preview && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url); // Release blob object URL
      }
      setFile(null);
      setPreview(null);
    }
  };

  // Effect to clean up the blob object URL for video previews
  React.useEffect(() => {
    return () => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  // Handles the message form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if content or a file is present
    if (!content && !file) {
      setFeedback({ type: 'error', message: 'Veuillez ajouter du texte ou un média' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' }); // Reset previous feedback

    const formData = new FormData();
    formData.append('content', content);
    formData.append('fk_user2', recipientId); // ID of the recipient user
    if (file) {
      formData.append('media', file);
    }

    try {
      // Send POST request to create the message
      const response = await fetch('/message/create', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' } // Indicate AJAX request for Symfony
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form and display success message
        setContent('');
        setFile(null);
        setPreview(null);
        setFeedback({ type: 'success', message: 'Message envoyé !' });
        if (onMessageSent) onMessageSent(); // Call callback function if provided
      } else {
        // Display error message if request fails
        setFeedback({ type: 'error', message: data.message || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      // Display error message for connection issues
      setFeedback({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  return (
    <div className="message-form border border-dark">
      <form onSubmit={handleSubmit}>
        {/* Text input field for the message */}
        <div>
          <textarea
            className="form-control border-0 border-bottom border-dark bg-color-search"
            placeholder="Votre message..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000} // Character limit
          />
        </div>

        {/* Media preview section */}
        {preview && (
          <div className="text-center">
            {preview.type === 'image' ? (
              <img src={preview.url} alt="Preview" className="img-fluid mb-1 mt-1 message-form-preview-image" />
            ) : preview.type === 'video' ? (
              <video
                src={preview.url}
                className="img-fluid message-form-preview-video"
                controls // Display video controls
              />
            ) : null}
            {/* Button to remove selected media */}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-block mx-auto"
              onClick={() => { setFile(null); setPreview(null); }}
            >
              Supprimer le média
            </button>
          </div>
        )}

        {/* Media upload and submit button section */}
        <div className="d-flex justify-content-between align-items-center mt-0">
          <div>
            {/* Hidden file input, triggered by the label */}
            <input
              type="file"
              id="media-upload-message" // Unique ID for the label
              className="d-none"
              accept="image/*,video/*" // Accepts images and videos
              onChange={handleFileChange}
            />
            {/* Label styled as a button for media upload */}
            <label htmlFor="media-upload-message" className="btn p-0 ml-5">
              <img src="/icons/image.png" alt="Ajouter média" className="img-fluid message-form-media-icon" />
            </label>
          </div>

          {/* Message submit button */}
          <button
            type="submit"
            className="custom-publish-button"
            disabled={isSubmitting || (!content && !file)} // Disabled during submission or if empty
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
        {/* Display feedback messages (success/error) - This part was missing in the original prompt but is good practice */}
        {feedback.message && (
          <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'} mt-2`}>
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}