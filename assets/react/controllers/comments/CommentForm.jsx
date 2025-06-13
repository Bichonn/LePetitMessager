import React, { useState, useEffect } from 'react';

export default function CommentForm({ postId, onCommentAdded, className }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // State for media preview (image or video)
  const [feedback, setFeedback] = useState({ type: '', message: '' }); // State for user feedback (success/error messages)
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status

  // Handle file selection and preview generation
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
        setPreview(null); // No preview for other file types
      }
    } else {
      // Clean up blob URL if a file was previously selected and then removed
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
      setFile(null);
      setPreview(null);
    }
  };

  // Effect to clean up blob URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url); // Revoke object URL to free resources
      }
    };
  }, [preview]);

  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if both content and file are empty
    if (!content && !file) {
      setFeedback({ type: 'error', message: 'Veuillez ajouter du texte ou un média' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' }); // Clear previous feedback

    const formData = new FormData();
    formData.append('content', content);
    formData.append('post_id', postId);
    if (file) {
      formData.append('media', file);
    }

    try {
      const response = await fetch('/comments/add', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' } // Important for Symfony to recognize AJAX request
      });

      const data = await response.json(); // Expect JSON response

      if (response.ok) {
        // Reset form fields and state on successful submission
        setContent('');
        setFile(null);
        setPreview(null);
        setFeedback({ type: 'success', message: 'Commentaire posté avec succès !' });
        // Dispatch a custom event to notify other components (e.g., comment list)
        document.dispatchEvent(new CustomEvent('commentCreated', { detail: { postId: postId } }));
        if (onCommentAdded) onCommentAdded(); // Callback function after comment is added
        // Clear success feedback after a delay
        setTimeout(() => {
          setFeedback({ type: '', message: '' });
        }, 2000);
      } else {
        // Set error feedback from server response
        setFeedback({ type: 'error', message: data.message || 'Erreur lors de la publication' });
      }
    } catch (error) {
      // Set feedback for network or other errors
      setFeedback({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setIsSubmitting(false); // Reset submission status
    }
  };

  return (
    <div className={`comment-form-card border-bottom border-dark ${className || ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="">
          {/* Textarea for comment content */}
          <textarea
            className="form-control border-0 border-top border-bottom border-dark bg-color-search"
            placeholder="Votre commentaire..."
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={180}
          />
          {/* Character count display */}
          <div className="text-start text-muted small ms-1">
            {content.length}/180
          </div>
        </div>

        {/* Media preview section */}
        {preview && (
          <div className="mb-2 text-center">
            {preview.type === 'image' ? (
              <img src={preview.url} alt="Preview" className="img-fluid mb-2" style={{ maxHeight: '120px' }} />
            ) : preview.type === 'video' ? (
              <video
                src={preview.url}
                className="img-fluid mb-2"
                style={{ maxHeight: '120px' }}
                controls
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

        <div className="d-flex justify-content-between align-items-center">
          <div>
            {/* Hidden file input for media upload */}
            <input
              type="file"
              id={`media-comment-upload-${postId}`} // Unique ID for the file input
              className="d-none"
              accept="image/*,video/*" // Accept only image and video files
              onChange={handleFileChange}
            />
            {/* Label styled as a button to trigger file input */}
            <label htmlFor={`media-comment-upload-${postId}`} className="btn p-0 ml-5">
              <img
                src="/icons/image.png"
                alt="Ajouter média"
                className="img-fluid media-upload-icon"
                style={{ width: '30px' }}
              />
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="custom-publish-button"
            disabled={isSubmitting || (!content && !file)} // Disable if submitting or no content/file
          >
            {isSubmitting ? 'Envoi...' : 'Commenter'}
          </button>
        </div>

        {/* Feedback message display */}
        {feedback.message && (
          <div className={`custom-alert alert-${feedback.type === 'error' ? 'danger' : 'success'} mt-2`}>
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}