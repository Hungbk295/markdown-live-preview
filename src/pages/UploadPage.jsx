import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/upload.css';

function UploadPage() {
  const [bookname, setBookname] = useState('');
  const [markdownFile, setMarkdownFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleMarkdownChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMarkdownFile(file);
      // Auto-populate book name from filename
      if (!bookname) {
        const name = file.name.replace(/\.md$/, '');
        setBookname(name);
      }
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!markdownFile) {
      setError('Please select a markdown file');
      return;
    }

    if (!bookname.trim()) {
      setError('Please enter a book name');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('markdown', markdownFile);
      formData.append('bookname', bookname.trim());
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Success - redirect to library
      navigate('/library');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload book');
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <header className="upload-header">
          <h1>Upload New Book</h1>
          <button onClick={() => navigate('/library')} className="btn-back">
            ← Back to Library
          </button>
        </header>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="bookname">Book Name</label>
            <input
              type="text"
              id="bookname"
              value={bookname}
              onChange={(e) => setBookname(e.target.value)}
              placeholder="Enter book name"
              required
            />
            <small>This will be the display name for your book</small>
          </div>

          <div className="form-group">
            <label htmlFor="markdown">Markdown File *</label>
            <input
              type="file"
              id="markdown"
              accept=".md,.markdown,text/markdown"
              onChange={handleMarkdownChange}
              required
            />
            {markdownFile && (
              <div className="file-info">
                Selected: {markdownFile.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cover">Cover Image (optional)</label>
            <input
              type="file"
              id="cover"
              accept="image/*"
              onChange={handleCoverChange}
            />
            {coverPreview && (
              <div className="cover-preview">
                <img src={coverPreview} alt="Cover preview" />
                <p>Preview</p>
              </div>
            )}
            {!coverFile && (
              <small>
                If no cover is provided, a default grey cover with the book
                title will be generated
              </small>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="btn-cancel"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadPage;
