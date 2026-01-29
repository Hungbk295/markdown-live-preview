import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useTheme } from '../contexts/ThemeContext';
import MarkdownEditor from '../components/MarkdownEditor';
import SplitPane from '../components/SplitPane';
import api from '../services/api';

function EditorPage() {
  const { bookname, folder } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme, availableThemes } = useTheme();

  const [content, setContent] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving' | 'saved' | 'error'
  const [readingMode, setReadingMode] = useState(true); // Default: reading mode (ẩn editor)
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const saveTimeoutRef = useRef(null);

  // API path depends on whether book is in folder or not
  const getApiPath = () => {
    if (folder) {
      return `/folders/${folder}/books/${bookname}`;
    }
    return `/books/${bookname}`;
  };

  useEffect(() => {
    fetchBook();
  }, [bookname, folder]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      // For folder books, use folder API endpoint
      const apiPath = folder
        ? `/folders/${folder}/books/${bookname}`
        : `/books/${bookname}`;
      const response = await api.get(apiPath);
      setContent(response.data.content);
      setBookTitle(response.data.title);
    } catch (error) {
      console.error('Error fetching book:', error);
      alert('Failed to load book');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const saveBook = async (newContent) => {
    try {
      // For folder books, we need different API path
      const apiPath = folder
        ? `/folders/${folder}/books/${bookname}`
        : `/books/${bookname}`;
      await api.put(apiPath, { content: newContent });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving book:', error);
      setSaveStatus('error');
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setSaveStatus('saving');

    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveBook(newContent);
    }, 1000);
  };

  const renderPreview = () => {
    if (!content) {
      return <div className="preview-empty">Start typing to see preview...</div>;
    }

    const html = marked.parse(content);
    const sanitized = DOMPurify.sanitize(html);

    return (
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <p>Loading book...</p>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="header-left">
          <button onClick={() => navigate('/library')} className="btn-back">
            ←
          </button>
          <h1>{bookTitle}</h1>
          {/* Theme Selector */}
          <div className="theme-selector">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="btn-theme"
            >
              {availableThemes[theme].icon}{' '}
              <span className="theme-name">{availableThemes[theme].name}</span>
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
        </div>
        <div className="header-right">
          <div className="save-indicator">
            {saveStatus === 'saving' && <span className="status-saving">Saving...</span>}
            {saveStatus === 'saved' && <span className="status-saved">✓ Saved</span>}
            {saveStatus === 'error' && <span className="status-error">Error saving</span>}
          </div>

          {/* Reading Mode Toggle */}
          <button
            onClick={() => setReadingMode(!readingMode)}
            className="btn-toggle-mode"
            title={readingMode ? 'Show Editor' : 'Hide Editor'}
          >
            {readingMode ? '📖 Reading' : '✏️ Editing'}
          </button>
        </div>
      </header>

      <div className="editor-container">
        {readingMode ? (
          // Reading Mode - chỉ hiển thị preview
          <div className="reading-mode-container">
            <div className="preview-pane reading-preview">{renderPreview()}</div>
          </div>
        ) : (
          // Edit Mode - hiển thị split pane
          <SplitPane
            left={<MarkdownEditor value={content} onChange={handleContentChange} />}
            right={<div className="preview-pane">{renderPreview()}</div>}
          />
        )}
      </div>

      <style>{`
        .editor-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--background-color, #fff);
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--header-bg, #f5f5f5);
          border-bottom: 1px solid var(--border-color, #ddd);
          flex-shrink: 0;
          gap: 0.5rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }

        .header-left h1 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-color, #333);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .btn-back {
          padding: 0.5rem 0.75rem;
          font-size: 1.1rem;
          background: var(--button-bg, #fff);
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-color, #333);
          transition: all 0.2s;
        }

        .btn-toggle-mode, .btn-theme {
          padding: 0.5rem 1rem;
          background: var(--button-bg, #fff);
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-color, #333);
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-back:hover, .btn-toggle-mode:hover, .btn-theme:hover {
          background: var(--button-hover, #e9ecef);
        }

        .btn-toggle-mode {
          background: var(--primary-color, #007bff);
          color: white;
          border-color: var(--primary-color, #007bff);
        }

        .btn-toggle-mode:hover {
          background: var(--primary-hover, #0056b3);
        }

        .save-indicator {
          font-size: 0.9rem;
          min-width: 80px;
        }

        .status-saving {
          color: #666;
        }

        .status-saved {
          color: #28a745;
        }

        .status-error {
          color: #dc3545;
        }

        /* Theme Selector */
        .theme-selector {
          position: relative;
        }

        .theme-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: var(--surface-color, white);
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 180px;
          max-width: 250px;
        }

        .theme-menu button {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          color: var(--text-color, #333);
          transition: background 0.2s;
          white-space: nowrap;
        }

        .theme-menu button:hover {
          background: var(--button-hover, #f0f0f0);
        }

        .theme-menu button.active {
          background: var(--primary-color, #007bff);
          color: white;
        }

        .editor-container {
          flex: 1;
          overflow: hidden;
        }

        /* Reading Mode */
        .reading-mode-container {
          height: 100%;
          overflow: auto;
          background: var(--preview-bg, #fff);
        }

        .reading-preview {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .preview-pane {
          height: 100%;
          overflow: auto;
          padding: 2rem;
          background: var(--preview-bg, #fff);
        }

        .preview-empty {
          color: var(--text-secondary, #999);
          font-style: italic;
          padding: 2rem;
          background: var(--preview-bg, #fff);
        }

        /* Ensure preview empty text is visible in all themes */
        [data-theme="sepia"] .preview-empty {
          color: #8b7355;
          background: #f9f4e8;
        }

        [data-theme="catppuccin"] .preview-empty {
          color: #5c4f4d;
          background: #faf3f1;
        }

        [data-theme="dark"] .preview-empty {
          color: #a0a0a0;
          background: #1e1e1e;
        }

        .editor-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: var(--text-color, #333);
        }

        /* Light Theme (Default) */
        [data-theme="light"] .editor-page {
          --background-color: #ffffff;
          --header-bg: #f5f5f5;
          --text-color: #333333;
          --text-secondary: #666666;
          --border-color: #dddddd;
          --button-bg: #ffffff;
          --button-hover: #e9ecef;
          --preview-bg: #ffffff;
          --surface-color: #ffffff;
          --primary-color: #007bff;
          --primary-hover: #0056b3;
        }

        /* Light theme uses default github-markdown-css, no override needed */
        [data-theme="light"] .markdown-body {
          background-color: #ffffff !important;
        }

        /* Dark Theme */
        [data-theme="dark"] .editor-page {
          --background-color: #1a1a1a;
          --header-bg: #2d2d2d;
          --text-color: #e0e0e0;
          --text-secondary: #a0a0a0;
          --border-color: #444444;
          --button-bg: #333333;
          --button-hover: #3a3a3a;
          --preview-bg: #1e1e1e;
          --surface-color: #2d2d2d;
          --primary-color: #0d6efd;
          --primary-hover: #0a58ca;
        }

        /* Dark theme markdown styling */
        [data-theme="dark"] .markdown-body {
          background-color: #1e1e1e !important;
          color: #e0e0e0 !important;
        }

        [data-theme="dark"] .markdown-body h1,
        [data-theme="dark"] .markdown-body h2,
        [data-theme="dark"] .markdown-body h3,
        [data-theme="dark"] .markdown-body h4,
        [data-theme="dark"] .markdown-body h5,
        [data-theme="dark"] .markdown-body h6 {
          color: #ffffff !important;
          border-bottom-color: #444444 !important;
        }

        [data-theme="dark"] .markdown-body a {
          color: #58a6ff !important;
        }

        [data-theme="dark"] .markdown-body code {
          background: #2d2d2d !important;
          color: #ff7b72 !important;
        }

        [data-theme="dark"] .markdown-body pre {
          background-color: #2d2d2d !important;
        }

        [data-theme="dark"] .markdown-body blockquote {
          color: #a0a0a0 !important;
          border-left-color: #58a6ff !important;
        }

        [data-theme="dark"] .markdown-body table tr {
          background-color: #1e1e1e !important;
          border-top-color: #444444 !important;
        }

        [data-theme="dark"] .markdown-body table tr:nth-child(2n) {
          background-color: #2d2d2d !important;
        }

        [data-theme="dark"] .markdown-body table th,
        [data-theme="dark"] .markdown-body table td {
          border-color: #444444 !important;
        }

        [data-theme="dark"] .markdown-body hr {
          background-color: #444444 !important;
        }

        /* Sepia Theme */
        [data-theme="sepia"] .editor-page {
          --background-color: #f4ecd8;
          --header-bg: #e8dcc4;
          --text-color: #5c4b37;
          --text-secondary: #8b7355;
          --border-color: #d3c4a8;
          --button-bg: #f4ecd8;
          --button-hover: #e8dcc4;
          --preview-bg: #f9f4e8;
          --surface-color: #f4ecd8;
          --primary-color: #9b6e3a;
          --primary-hover: #7d5730;
        }

        /* Catppuccin Pink Theme (Rosewater Background) */
        [data-theme="catppuccin"] .editor-page {
          --background-color: #dc8a78; /* Rosewater */
          --header-bg: #f5e9e6; /* Light tint */
          --text-color: #2d2a2e; /* Dark text for contrast */
          --text-secondary: #5c4f4d; /* Medium text */
          --border-color: #c97a68; /* Darker rosewater */
          --button-bg: #f5e9e6;
          --button-hover: #edd5d0;
          --preview-bg: #faf3f1; /* Very light rosewater tint */
          --surface-color: #f5e9e6;
          --primary-color: #8839ef; /* Mauve */
          --primary-hover: #7c3aed;
        }

        /* Sepia specific markdown styling */
        [data-theme="sepia"] .markdown-body {
          background-color: #f9f4e8 !important;
          color: #5c4b37 !important;
        }

        [data-theme="sepia"] .markdown-body h1,
        [data-theme="sepia"] .markdown-body h2,
        [data-theme="sepia"] .markdown-body h3,
        [data-theme="sepia"] .markdown-body h4,
        [data-theme="sepia"] .markdown-body h5,
        [data-theme="sepia"] .markdown-body h6 {
          color: #7d5730 !important;
          border-bottom-color: #d3c4a8 !important;
        }

        [data-theme="sepia"] .markdown-body a {
          color: #9b6e3a !important;
        }

        [data-theme="sepia"] .markdown-body a:hover {
          color: #7d5730 !important;
        }

        [data-theme="sepia"] .markdown-body code {
          background: #e8dcc4 !important;
          color: #7d5730 !important;
        }

        [data-theme="sepia"] .markdown-body pre {
          background-color: #e8dcc4 !important;
        }

        [data-theme="sepia"] .markdown-body pre code {
          background: transparent !important;
        }

        [data-theme="sepia"] .markdown-body blockquote {
          color: #8b7355 !important;
          border-left-color: #9b6e3a !important;
        }

        [data-theme="sepia"] .markdown-body table tr {
          background-color: #f9f4e8 !important;
          border-top-color: #d3c4a8 !important;
        }

        [data-theme="sepia"] .markdown-body table tr:nth-child(2n) {
          background-color: #f4ecd8 !important;
        }

        [data-theme="sepia"] .markdown-body table th,
        [data-theme="sepia"] .markdown-body table td {
          border-color: #d3c4a8 !important;
        }

        [data-theme="sepia"] .markdown-body hr {
          background-color: #d3c4a8 !important;
        }

        [data-theme="sepia"] .markdown-body img {
          background-color: #f4ecd8 !important;
        }

        /* Catppuccin - Rosewater Background with Colorful Accents */
        [data-theme="catppuccin"] .markdown-body {
          background-color: #faf3f1 !important; /* Very light rosewater tint */
          color: #2d2a2e !important; /* Dark text for contrast */
        }

        /* Colorful headings - Catppuccin palette */
        [data-theme="catppuccin"] .markdown-body h1 {
          color: #d20f39 !important; /* Red */
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h2 {
          color: #8839ef !important; /* Mauve */
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h3 {
          color: #179299 !important; /* Teal */
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h4 {
          color: #40a02b !important; /* Green */
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h5 {
          color: #209fb5 !important; /* Sapphire */
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h6 {
          color: #7287fd !important; /* Lavender */
          border-bottom-color: #e0b8b0 !important;
        }

        /* Links */
        [data-theme="catppuccin"] .markdown-body a {
          color: #1e66f5 !important; /* Blue */
          text-decoration: none;
        }

        [data-theme="catppuccin"] .markdown-body a:hover {
          color: #04a5e5 !important; /* Sky */
          text-decoration: underline;
        }

        /* Code */
        [data-theme="catppuccin"] .markdown-body code {
          background: #f5e9e6 !important;
          color: #fe640b !important; /* Peach */
          padding: 0.2em 0.4em !important;
          border-radius: 3px !important;
          border: 1px solid #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body pre {
          background-color: #f5e9e6 !important;
          border: 1px solid #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body pre code {
          background: transparent !important;
          color: #2d2a2e !important;
          padding: 0 !important;
          border: none !important;
        }

        /* Blockquotes */
        [data-theme="catppuccin"] .markdown-body blockquote {
          color: #5c4f4d !important;
          border-left: 4px solid #8839ef !important; /* Mauve */
          background-color: #f5e9e6 !important;
          padding: 0.5em 1em !important;
        }

        /* Tables */
        [data-theme="catppuccin"] .markdown-body table tr {
          background-color: #faf3f1 !important;
          border-top-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body table tr:nth-child(2n) {
          background-color: #f5e9e6 !important;
        }

        [data-theme="catppuccin"] .markdown-body table th {
          background-color: #edd5d0 !important;
          color: #2d2a2e !important;
          border-color: #e0b8b0 !important;
          font-weight: 600;
        }

        [data-theme="catppuccin"] .markdown-body table td {
          border-color: #e0b8b0 !important;
        }

        /* Horizontal rule */
        [data-theme="catppuccin"] .markdown-body hr {
          background-color: #179299 !important; /* Teal */
          height: 3px !important;
          border: none !important;
          opacity: 0.6;
        }

        /* Strong text */
        [data-theme="catppuccin"] .markdown-body strong {
          color: #d20f39 !important; /* Red */
          font-weight: 700 !important;
        }

        /* Emphasis */
        [data-theme="catppuccin"] .markdown-body em {
          color: #8839ef !important; /* Mauve */
          font-style: italic;
        }

        /* Lists */
        [data-theme="catppuccin"] .markdown-body ul,
        [data-theme="catppuccin"] .markdown-body ol {
          color: #2d2a2e !important;
        }

        /* List markers */
        [data-theme="catppuccin"] .markdown-body li::marker {
          color: #179299 !important; /* Teal */
        }

        /* Task list checkboxes */
        [data-theme="catppuccin"] .markdown-body .task-list-item input[type="checkbox"] {
          accent-color: #40a02b !important; /* Green */
        }

        /* Images */
        [data-theme="catppuccin"] .markdown-body img {
          border-radius: 8px !important;
          border: 2px solid #e0b8b0 !important;
          box-shadow: 0 2px 8px rgba(220, 138, 120, 0.2) !important;
        }

        /* Keyboard tags */
        [data-theme="catppuccin"] .markdown-body kbd {
          background-color: #f5e9e6 !important;
          color: #2d2a2e !important;
          border: 1px solid #e0b8b0 !important;
          border-radius: 3px !important;
          padding: 0.2em 0.4em !important;
          box-shadow: 0 2px 0 #e0b8b0 !important;
        }

        /* Mark/highlight */
        [data-theme="catppuccin"] .markdown-body mark {
          background-color: #df8e1d !important; /* Yellow */
          color: #2d2a2e !important;
          padding: 0.2em 0.4em !important;
          border-radius: 2px !important;
        }

        /* Details/Summary */
        [data-theme="catppuccin"] .markdown-body details summary {
          color: #1e66f5 !important; /* Blue */
          cursor: pointer;
          font-weight: 600;
        }

        [data-theme="catppuccin"] .markdown-body details summary:hover {
          color: #04a5e5 !important; /* Sky */
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .editor-header {
            padding: 0.75rem;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .header-left {
            flex: 1 1 100%;
            gap: 0.5rem;
          }

          .header-left h1 {
            font-size: 1rem;
          }

          .header-right {
            flex: 1 1 100%;
            justify-content: space-between;
            gap: 0.5rem;
          }

          .btn-back {
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
          }

          .btn-toggle-mode {
            display: none;
          }

          .btn-theme {
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
          }

          .save-indicator {
            font-size: 0.8rem;
            min-width: 60px;
          }

          /* Hide theme name on mobile, only show icon */
          .btn-theme .theme-name {
            display: none;
          }

          /* Theme menu positioning on mobile */
          .theme-menu {
            min-width: 160px;
            right: 0;
          }

          .theme-menu button {
            padding: 0.65rem 0.85rem;
            font-size: 0.9rem;
          }

          /* Reading mode preview - more padding on mobile */
          .reading-preview {
            padding: 2rem 1rem;
          }

          .preview-pane {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .editor-header {
            padding: 0.5rem;
          }

          .header-left h1 {
            font-size: 0.9rem;
          }

          .btn-back,
          .btn-toggle-mode,
          .btn-theme {
            padding: 0.35rem 0.5rem;
            font-size: 0.8rem;
          }

          .save-indicator {
            font-size: 0.75rem;
            min-width: 50px;
          }

          .theme-menu {
            min-width: 140px;
          }

          .theme-menu button {
            padding: 0.6rem 0.75rem;
            font-size: 0.85rem;
          }

          .reading-preview {
            padding: 1.5rem 0.75rem;
          }

          .preview-pane {
            padding: 0.75rem;
          }

          /* Markdown body adjustments for mobile */
          .markdown-body {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }

          .markdown-body h1 {
            font-size: 1.75rem !important;
            margin-top: 1.5rem !important;
            margin-bottom: 1rem !important;
          }

          .markdown-body h2 {
            font-size: 1.5rem !important;
            margin-top: 1.25rem !important;
            margin-bottom: 0.75rem !important;
          }

          .markdown-body h3 {
            font-size: 1.25rem !important;
            margin-top: 1rem !important;
            margin-bottom: 0.5rem !important;
          }

          .markdown-body h4,
          .markdown-body h5,
          .markdown-body h6 {
            font-size: 1.1rem !important;
            margin-top: 0.75rem !important;
            margin-bottom: 0.5rem !important;
          }

          .markdown-body pre {
            font-size: 13px !important;
            overflow-x: auto !important;
          }

          .markdown-body code {
            font-size: 13px !important;
          }

          .markdown-body table {
            font-size: 14px !important;
            overflow-x: auto !important;
            display: block !important;
          }

          .markdown-body img {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

export default EditorPage;
