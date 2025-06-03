import React, { useState } from 'react';

export default function MessageForm({ recipientId, onMessageSent }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

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

  // Nettoyage du preview vidéo
  React.useEffect(() => {
    return () => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content && !file) {
      setFeedback({ type: 'error', message: 'Veuillez ajouter du texte ou un média' });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', content);
    formData.append('fk_user2', recipientId);
    if (file) {
      formData.append('media', file);
    }

    try {
      const response = await fetch('/message/create', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const data = await response.json();

      if (response.ok) {
        setContent('');
        setFile(null);
        setPreview(null);
        setFeedback({ type: 'success', message: 'Message envoyé !' });
        if (onMessageSent) onMessageSent();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="message-form border border-dark">
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            className="form-control border-0 border-bottom border-dark bg-color-search"
            placeholder="Votre message..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
          />
        </div>

        {preview && (
          <div className="text-center">
            {preview.type === 'image' ? (
              <img src={preview.url} alt="Preview" className="img-fluid mb-1 mt-1 message-form-preview-image" />
            ) : preview.type === 'video' ? (
              <video
                src={preview.url}
                className="img-fluid message-form-preview-video"
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

        <div className="d-flex justify-content-between align-items-center mt-0">
          <div>
            <input
              type="file"
              id="media-upload-message"
              className="d-none"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <label htmlFor="media-upload-message" className="btn p-0 ml-5">
              <img src="/icons/image.png" alt="Ajouter média" className="img-fluid message-form-media-icon" />
            </label>
          </div>

          <button
            type="submit"
            className="custom-publish-button"
            disabled={isSubmitting || (!content && !file)}
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  );
}