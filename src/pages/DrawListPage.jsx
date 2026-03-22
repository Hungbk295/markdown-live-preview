import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import '../styles/library.css';

function DrawListPage() {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme, setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/draw/list');
      setDrawings(response.data);
    } catch (error) {
      console.error('Error fetching drawings:', error);
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

  const isEmpty = drawings.length === 0;

  return (
    <div className="library-page">
      <header className="library-header">
        <div className="header-left">
          <h1>Excalidraw Drawings</h1>
          <p className="welcome-text">{drawings.length} drawings</p>
        </div>
        <div className="header-right">
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
            onClick={() => navigate('/markdownpreview/all')}
            className="btn-secondary"
            style={{ marginRight: '8px' }}
          >
            Markdown Previews
          </button>
        </div>
      </header>

      <div className="library-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : isEmpty ? (
          <div className="empty-state">
            <p>No drawings yet.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
              Use <code>/jcdraw</code> in Claude Code to create and push Excalidraw drawings here.
            </p>
          </div>
        ) : (
          <div className="books-grid">
            {drawings.map((drawing) => (
              <div
                key={drawing.drawId}
                className="book-card"
                onClick={() => navigate(`/draw/${drawing.drawId}`)}
              >
                <div className="book-cover">
                  <div className="book-cover-default" style={{
                    background: `linear-gradient(135deg, ${getGradientColor(drawing.drawId)} 0%, ${getGradientColor(drawing.drawId, true)} 100%)`
                  }}>
                    <span className="book-cover-title">{drawing.title}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      opacity: 0.8,
                      marginTop: '4px'
                    }}>
                      {drawing.elementCount} elements
                    </span>
                  </div>
                </div>
                <div className="book-info">
                  <h3 className="book-title" title={drawing.title}>{drawing.title}</h3>
                  <p className="share-meta">
                    {formatDate(drawing.updatedAt)}
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
        .btn-secondary {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color, #ddd);
          background: transparent;
          color: var(--text-primary, #333);
          cursor: pointer;
          font-size: 0.9rem;
        }
        .btn-secondary:hover {
          background: var(--bg-secondary, #f5f5f5);
        }
      `}</style>
    </div>
  );
}

function getGradientColor(id, secondary = false) {
  const colors = [
    ['#6366f1', '#8b5cf6'],
    ['#ec4899', '#f43f5e'],
    ['#06b6d4', '#3b82f6'],
    ['#10b981', '#14b8a6'],
    ['#f59e0b', '#ef4444'],
    ['#8b5cf6', '#d946ef'],
    ['#84cc16', '#22c55e'],
    ['#f97316', '#eab308'],
    ['#0ea5e9', '#6366f1'],
    ['#14b8a6', '#0284c7'],
  ];

  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorPair = colors[hash % colors.length];
  return secondary ? colorPair[1] : colorPair[0];
}

export default DrawListPage;
