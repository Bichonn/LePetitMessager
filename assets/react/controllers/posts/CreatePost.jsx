import React, { useState, useEffect } from 'react';

export default function CreatePost() {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Listen for the custom event to toggle visibility
  // and reset the form
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsVisible(prevIsVisible => {
        const newVisibility = !prevIsVisible;
        if (newVisibility) {
          // Reset form only when opening
          setContent('');
          setFile(null);
          setPreview(null);
          setFeedback({ type: '', message: '' });
          setIsSubmitting(false);
        }
        return newVisibility;
      });
    };
    document.addEventListener('openCreatePostSection', handleOpenEvent);
    return () => {
      document.removeEventListener('openCreatePostSection', handleOpenEvent);
    };
  }, []);

  // Handle file selection and preview
  // This function is called when the user selects a file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview for images or videos
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview({
            type: 'image',
            url: reader.result
          });
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'video/mp4') {
        setPreview({
          type: 'video',
          url: URL.createObjectURL(selectedFile)
        });
      } else {
        setPreview(null);
      }
    } else {
      // If no file is selected, reset the preview
      if (preview && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
      setFile(null);
      setPreview(null);
    }
  };

  // Clean up the object URL when the component unmounts
  // or when the preview changes
  useEffect(() => {
    return () => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  // Handle form submission
  // This function is called when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content && !file) {
      setFeedback({ type: 'error', message: 'Veuillez ajouter du texte ou une image' });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('media', file);
    }

    // Get CSRF token from meta tag
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    try {
      const response = await fetch('/post/create', {
        method: 'POST',
        body: formData,
        headers: token ? {
          'X-CSRF-TOKEN': token
        } : {},
      });

      if (response.ok) {
        setContent('');
        setFile(null);
        setPreview(null);
        setFeedback({ type: 'success', message: 'Message posté avec succès!' });

        document.dispatchEvent(new CustomEvent('postCreated'));
        setTimeout(() => setIsVisible(false), 1000);
      } else {
        const error = await response.json();
        setFeedback({ type: 'error', message: error.message || 'Erreur lors de la publication' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close the post creation card when the user clicks outside of it
  if (!isVisible) {
    return null;
  }

  return (
    <div className="post-creation-card border border-dark">
      <form onSubmit={handleSubmit}>
        <div className="">
          <textarea
            className="form-control border-0 border-bottom border-dark bg-color-search"
            placeholder="Quoi de neuf ?"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={180}
          />
          <div className="text-start text-muted small ms-1">
            {content.length}/180
          </div>
        </div>

        {preview && (
          <div className="text-center">
            {preview.type === 'image' ? (
              <img src={preview.url} alt="Preview" className="img-fluid mb-1 mt-1" style={{ maxHeight: '200px' }} />
            ) : preview.type === 'video' ? (
              <video
                src={preview.url}
                className="img-fluid"
                style={{ maxHeight: '200px' }}
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
              id="media-upload"
              className="d-none"
              accept="image/*,video/mp4"
              onChange={handleFileChange}
            />
            <label htmlFor="media-upload" className="btn p-0 ml-5">
              <img src="/icons/image.png" alt="Ajouter média" className="img-fluid" style={{ width: '30px' }} />
            </label>
          </div>

          <button
            type="submit"
            className="custom-publish-button"
            disabled={isSubmitting || (!content && !file)}
          >
            {isSubmitting ? 'Envoi...' : 'Poster'}
          </button>
        </div>

        {feedback.message && (
          <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'} mt-3`}>
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}