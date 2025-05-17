import React, { useState } from 'react';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

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
        
        // Optional: reload the page or update the post list
        window.location.reload();
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

  return (
    <div className="post-creation-card">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Quoi de neuf ?"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
          />
        </div>
        
        {preview && (
          <div className="mb-3 text-center">
            <img src={preview} alt="Preview" className="img-fluid mb-2" style={{ maxHeight: '200px' }} />
            <button 
              type="button" 
              className="btn btn-sm btn-outline-danger d-block mx-auto"
              onClick={() => { setFile(null); setPreview(null); }}
            >
              Supprimer l'image
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
            <label htmlFor="media-upload" className="btn btn-outline-secondary mb-0">
              <img src="/icons/image.png" alt="Ajouter média" className="img-fluid" style={{ width: '20px' }} />
            </label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary rounded-pill px-4"
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