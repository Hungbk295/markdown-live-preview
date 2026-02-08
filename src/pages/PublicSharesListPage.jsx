import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import '../styles/library.css';

function PublicSharesListPage() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme, setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const response = await api.get('/public/shares');
      setShares(response.data);
    } catch (error) {
      console.error('Error fetching shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEmpty = shares.length === 0;

  return (
    <div className="library-page">
      <header className="library-header">
        <div className="header-left">
          <h1>Public Markdown Previews</h1>
          <p className="welcome-text">{shares.length} shared documents</p>
        </div>
        <div className="header-right">
          {/* Theme Selector */}
          <div className="theme-selector">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="btn-theme"
            >
              {availableThemes[theme].icon} {availableThemes[theme].name}
            </button>
            {showThemeMenu && (
              <div className="theme-menu">
                {Object.entries(availableThemes).map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      setShowThemeMenu(false);
                    }}
                    className={theme === key ? 'active' : ''}
                  >
                    {themeData.icon} {themeData.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/markdownpreview')}
            className="btn-primary"
          >
            + New Preview
          </button>
        </div>
      </header>

      <div className="library-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : isEmpty ? (
          <div className="empty-state">
            <p>No shared previews yet.</p>
            <button
              onClick={() => navigate('/markdownpreview')}
              className="btn-primary"
            >
              Create New Preview
            </button>
          </div>
        ) : (
          <div className="books-grid">
            {shares.map((share) => (
              <div
                key={share.shareId}
                className="book-card"
                onClick={() => navigate(`/markdownpreview/${share.shareId}`)}
              >
                <div className="book-cover">
                  <div className="book-cover-default" style={{
                    background: `linear-gradient(135deg, ${getGradientColor(share.shareId)} 0%, ${getGradientColor(share.shareId, true)} 100%)`
                  }}>
                    <span className="book-cover-title">{share.title}</span>
                  </div>
                </div>
                <div className="book-info">
                  <h3 className="book-title" title={share.title}>{share.title}</h3>
                  <p className="share-meta">
                    {formatDate(share.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .share-meta {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-secondary, #666);
        }
      `}</style>
    </div>
  );
}

// Generate consistent gradient colors based on shareId
function getGradientColor(shareId, secondary = false) {
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
    ['#667eea', '#764ba2'],
    ['#30cfd0', '#330867'],
  ];

  // Use shareId to pick a consistent color
  const hash = shareId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorPair = colors[hash % colors.length];

  return secondary ? colorPair[1] : colorPair[0];
}

export default PublicSharesListPage;
