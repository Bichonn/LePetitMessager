import React, { useState, useEffect } from 'react';
import HashtagInput from "./post_tool/HashtagInput";

/**
 * Component for creating new posts with text, media, and hashtags
 */
export default function CreatePost() {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [hashtags, setHashtags] = useState([]);

  // Fetch user premium status on component mount
  useEffect(() => {
    fetch('/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user_premium) setIsUserPremium(true);
      });
  }, []);

  // Handle file selection and preview generation
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
      // Reset preview when no file selected
      if (preview && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
      setFile(null);
      setPreview(null);
    }
  };

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that user has entered content or file
    if (!content && !file) {
      setFeedback({ type: 'error', message: 'Veuillez ajouter du texte ou une image' });
      return;
    }

    setIsSubmitting(true);

    // Prepare form data for submission
    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('media', file);
    }
    formData.append('hashtags', hashtags.map(t => `#${t}`).join(' '));

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
        // Reset form on successful submission
        setContent('');
        setFile(null);
        setPreview(null);
        setHashtags([]);
        setFeedback({ type: 'success', message: 'Message posté avec succès!' });

        // Dispatch event to notify other components
        document.dispatchEvent(new CustomEvent('postCreated'));
        
        // Auto-hide success message after 2 seconds
        setTimeout(() => {
          setFeedback({ type: '', message: '' });
        }, 2000);
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
    <div className="post-creation-card border border-dark">
      <form onSubmit={handleSubmit}>
        {/* Text input area */}
        <div className="">
          <textarea
            className="form-control border-0 border-bottom border-dark bg-color-search"
            placeholder="Quoi de neuf ?"
            rows={3}
            maxLength={isUserPremium ? 180 : 140}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <HashtagInput hashtags={hashtags} setHashtags={setHashtags} />
          {/* Character counter */}
          <div className="text-start text-muted small ms-1">
            {content.length}/{isUserPremium ? 180 : 140}
          </div>
        </div>

        {/* Media preview section */}
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
            {/* Remove media button */}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-block mx-auto"
              onClick={() => { setFile(null); setPreview(null); }}
            >
              Supprimer le média
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="d-flex justify-content-between align-items-center">
          {/* Media upload button */}
          <div>
            <input
              type="file"
              id="media-upload"
              className="d-none"
              accept="image/*,video/mp4"
              onChange={handleFileChange}
            />
            <label htmlFor="media-upload" className="btn p-0 ml-5">
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
            disabled={isSubmitting || (!content && !file)}
          >
            {isSubmitting ? 'Envoi...' : 'Poster'}
          </button>
        </div>

        {/* Feedback message */}
        {feedback.message && (
          <div className={`custom-alert alert-${feedback.type === 'error' ? 'danger' : 'success'} mt-3`}>
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}