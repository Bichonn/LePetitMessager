import React, { useState, useEffect } from 'react';
import '../../../styles/app.css';
import '../../../styles/UpdatePost.css';

export default function UpdatePost({ postId, initialContent, initialMediaUrl, initialMediaFilename, onClose, onUpdated }) {
  const [content, setContent] = useState(initialContent || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [currentMediaFilename, setCurrentMediaFilename] = useState(initialMediaFilename);

  useEffect(() => {
    // Initialize preview if initialMediaUrl exists
    if (initialMediaUrl) {
      const isVideo = ['mp4', 'webm', 'ogg'].some(ext => initialMediaUrl.toLowerCase().endsWith(ext));
      setPreview({ type: isVideo ? 'video' : 'image', url: initialMediaUrl });
    } else {
      setPreview(null);
    }
  }, [initialMediaUrl]);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCurrentMediaFilename(null); // New file will replace old one if saved

      const reader = new FileReader();
      if (selectedFile.type.startsWith('image/')) {
        reader.onloadend = () => setPreview({ type: 'image', url: reader.result });
        reader.readAsDataURL(selectedFile);
      } else if (['video/mp4', 'video/webm', 'video/ogg'].includes(selectedFile.type)) {
        setPreview({ type: 'video', url: URL.createObjectURL(selectedFile) });
      } else {
        setPreview(null);
      }
    } else {
      setFile(null);
      // Revert to initial preview if file is deselected
      if (initialMediaUrl) {
        const isVideo = ['mp4', 'webm', 'ogg'].some(ext => initialMediaUrl.toLowerCase().endsWith(ext));
        setPreview({ type: isVideo ? 'video' : 'image', url: initialMediaUrl });
        setCurrentMediaFilename(initialMediaFilename);
      } else {
        setPreview(null);
        setCurrentMediaFilename(null);
      }
    }
  };

  const removeMedia = () => {
    if (preview && preview.url && preview.url.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url);
    }
    setFile(null);
    setPreview(null);
    setCurrentMediaFilename(null); // Mark media for removal
  };

  useEffect(() => {
    return () => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !file && !currentMediaFilename) {
      setFeedback({ type: 'error', message: 'Veuillez ajouter du texte ou un média.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    const formData = new FormData();
    formData.append('content_text', content);
    if (file) {
      formData.append('media', file);
    } else if (!currentMediaFilename && initialMediaFilename) {
      // If currentMediaFilename is null (due to removeMedia) and there was an initialMediaFilename
      formData.append('remove_media', '1');
    }

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    try {
      const response = await fetch(`/post/${postId}/update`, {
        method: 'POST', // Using POST for FormData, backend can treat as PUT
        body: formData,
        headers: token ? { 'X-CSRF-TOKEN': token } : {},
      });

      if (response.ok) {
        const responseData = await response.json(); // Expect { post: { ... } }
        setFeedback({ type: 'success', message: 'Post mis à jour avec succès!' });
        if (onUpdated) {
          setTimeout(() => {
            onUpdated(responseData.post); // Pass the updated post data
            onClose(); 
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        setFeedback({ type: 'error', message: errorData.message || 'Erreur lors de la mise à jour.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erreur de connexion au serveur.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block update-post-modal-backdrop" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header rounded-0">
            <h5 className="modal-title">Modifier le Post</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder="Modifier votre message..."
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={1000}
                />
              </div>

              {preview && (
                <div className="mb-3 text-center">
                  {preview.type === 'image' ? (
                    <img src={preview.url} alt="Aperçu" className="img-fluid mb-2 media-preview-item" />
                  ) : preview.type === 'video' ? (
                    <video src={preview.url} className="img-fluid mb-2 media-preview-item" controls />
                  ) : null}
                  <button type="button" className="btn btn-sm btn-outline-danger d-block mx-auto" onClick={removeMedia}>
                    Supprimer le média
                  </button>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor={`media-update-upload-${postId}`} className="form-label">
                  {initialMediaFilename || file ? 'Changer le média' : 'Ajouter un média'}
                </label>
                <input
                  type="file"
                  id={`media-update-upload-${postId}`}
                  className="form-control"
                  accept="image/*,video/mp4,video/webm,video/ogg"
                  onChange={handleFileChange}
                />
              </div>

              {feedback.message && (
                <div className={`custom-alert alert-${feedback.type === 'error' ? 'danger' : 'success'} mt-3`}>
                  {feedback.message}
                </div>
              )}

              <hr />
              <div className="d-flex justify-content-end">
                <button type="button" className="btn custom-cancel-button me-2" onClick={onClose} disabled={isSubmitting}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || (!content && !file && !currentMediaFilename)}>
                  {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}