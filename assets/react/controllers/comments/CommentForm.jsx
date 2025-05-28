import React, { useState, useEffect } from 'react';

export default function CommentForm({ postId, onCommentAdded, className }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestion du preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview({ type: 'image', url: reader.result });
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type.startsWith('video/')) {
        setPreview({ type: 'video', url: URL.createObjectURL(selectedFile) });
      } else {
        setPreview(null);
      }
    } else {
      if (preview && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
      setFile(null);
      setPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  // Soumission du commentaire
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const data = await response.json();

      if (response.ok) {
        setContent('');
        setFile(null);
        setPreview(null);
        setFeedback({ type: 'success', message: 'Commentaire posté avec succès !' });
        // Dispatch event before calling onCommentAdded
        document.dispatchEvent(new CustomEvent('commentCreated', { detail: { postId: postId } }));
        if (onCommentAdded) onCommentAdded();
        setTimeout(() => {
          setFeedback({ type: '', message: '' });
        }, 2000); // Clear feedback after 2 seconds
      } else {
        setFeedback({ type: 'error', message: data.message || 'Erreur lors de la publication' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`comment-form-card border-bottom border-dark ${className || ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="">
          <textarea
            className="form-control border-0 border-top border-bottom border-dark bg-color-search"
            placeholder="Votre commentaire..."
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
          />
        </div>

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
            <input
              type="file"
              id={`media-comment-upload-${postId}`}
              className="d-none"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <label htmlFor={`media-comment-upload-${postId}`} className="btn p-0 ml-5">
              <img src="/icons/image.png" alt="Ajouter média" className="img-fluid" style={{ width: '30px' }} />
            </label>
          </div>

          <button
            type="submit"
            className="custom-publish-button"
            disabled={isSubmitting || (!content && !file)}
          >
            {isSubmitting ? 'Envoi...' : 'Commenter'}
          </button>
        </div>

        {feedback.message && (
          <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'} mt-2`}>
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}