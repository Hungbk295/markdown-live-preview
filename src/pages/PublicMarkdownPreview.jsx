import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useTheme } from '../contexts/ThemeContext';
import MarkdownEditor from '../components/MarkdownEditor';
import SplitPane from '../components/SplitPane';
import api from '../services/api';
import { extractDrawIds, embedDrawings } from '../utils/drawRenderer';

function PublicMarkdownPreview() {
  const { shareId } = useParams();
  const { theme, setTheme, availableThemes } = useTheme();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [readingMode, setReadingMode] = useState(false); // Default: editing mode
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [shareStatus, setShareStatus] = useState(''); // '' | 'sharing' | 'shared' | 'error'
  const [sharedUrl, setSharedUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareId, setCurrentShareId] = useState(null); // Track current share ID
  const [headerVisible, setHeaderVisible] = useState(true);
  const [contentCopyStatus, setContentCopyStatus] = useState('');
  const [drawingsMap, setDrawingsMap] = useState({});

  // Fetch referenced drawings when content changes
  const fetchDrawings = useCallback(async (markdown) => {
    const drawIds = extractDrawIds(markdown);
    if (drawIds.length === 0) return;

    const newMap = {};
    await Promise.all(
      drawIds.map(async (id) => {
        try {
          const res = await api.get(`/draw/${id}`);
          newMap[id] = res.data;
        } catch {
          newMap[id] = null;
        }
      })
    );
    setDrawingsMap(prev => ({ ...prev, ...newMap }));
  }, []);

  useEffect(() => {
    if (content) fetchDrawings(content);
  }, [content, fetchDrawings]);

  // Đơn giản: scroll > 100 thì ẩn header
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setHeaderVisible(scrollTop < 100);
  };

  // Load shared content if shareId exists
  useEffect(() => {
    if (shareId) {
      loadSharedContent();
    }
  }, [shareId]);

  const loadSharedContent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/share/${shareId}`);
      setContent(response.data.content);
      setCurrentShareId(shareId); // Remember the share ID
      setSharedUrl(`${window.location.origin}/markdownpreview/${shareId}`);
      setReadingMode(true); // Show reading mode for shared content
    } catch (error) {
      console.error('Error loading shared content:', error);
      if (error.response?.status === 404) {
        setContent('# Content Not Found\n\nThis shared markdown does not exist or has been removed.');
      } else {
        setContent('# Error\n\nFailed to load shared content.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setIsSharedContent(false); // Mark as modified
  };

  const handleShare = async () => {
    if (!content.trim()) {
      alert('Please enter some markdown content first');
      return;
    }

    try {
      setShareStatus('sharing');

      let fullUrl;
      if (currentShareId) {
        // Update existing share
        await api.put(`/public/share/${currentShareId}`, { content });
        fullUrl = `${window.location.origin}/markdownpreview/${currentShareId}`;
      } else {
        // Create new share
        const response = await api.post('/public/share', { content });
        fullUrl = `${window.location.origin}${response.data.url}`;
        setCurrentShareId(response.data.shareId);
      }

      setSharedUrl(fullUrl);
      setShareStatus('shared');
      setShowShareModal(true);
    } catch (error) {
      console.error('Error sharing:', error);
      setShareStatus('error');
      setTimeout(() => setShareStatus(''), 3000);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl);
      alert('Link copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = sharedUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setContentCopyStatus('copied');
      setTimeout(() => setContentCopyStatus(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setContentCopyStatus('error');
      setTimeout(() => setContentCopyStatus(''), 2000);
    }
  };

  const renderPreview = () => {
    if (!content) {
      return <div className="preview-empty">Start typing to see preview...</div>;
    }

    let html = marked.parse(content);

    // Embed draw diagrams inline (before sanitization)
    if (Object.keys(drawingsMap).length > 0) {
      html = embedDrawings(html, drawingsMap);
    }

    // Allow SVG elements through DOMPurify for inline drawings
    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ['svg', 'rect', 'ellipse', 'polygon', 'polyline', 'path', 'text', 'style', 'line', 'circle', 'g', 'defs'],
      ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'opacity', 'cx', 'cy', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'd', 'points', 'font-size', 'font-family', 'text-anchor', 'transform', 'r'],
    });

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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`editor-page ${readingMode ? 'reading-mode-active' : ''}`}>
      <header className={`editor-header ${!headerVisible && readingMode ? 'header-hidden' : ''}`}>
        <div className="header-left">
          <h1>Markdown Preview</h1>
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
          {/* Copy Content Button */}
          <button
            onClick={handleCopyContent}
            className="btn-copy-content"
            title="Copy markdown content"
          >
            {contentCopyStatus === 'copied' ? '✓ Copied' : '📋 Copy'}
          </button>

          {/* Reading Mode Toggle */}
          <button
            onClick={() => setReadingMode(!readingMode)}
            className="btn-toggle-mode"
            title={readingMode ? 'Show Editor' : 'Hide Editor'}
          >
            {readingMode ? '📖 Reading' : '✏️ Editing'}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="btn-share"
            disabled={shareStatus === 'sharing'}
            title="Share this markdown"
          >
            {shareStatus === 'sharing' ? '⏳ Sharing...' : '🔗 Share'}
          </button>
        </div>
      </header>

      <div className="editor-container">
        {readingMode ? (
          // Reading Mode - only show preview
          <div className="reading-mode-container" onScroll={handleScroll}>
            <div className="reading-preview">{renderPreview()}</div>
          </div>
        ) : (
          // Edit Mode - show split pane
          <SplitPane
            left={<MarkdownEditor value={content} onChange={handleContentChange} />}
            right={<div className="preview-pane">{renderPreview()}</div>}
          />
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Share Link Created!</h2>
            <p>Your markdown has been saved. Share this link:</p>
            <div className="share-url-container">
              <input
                type="text"
                value={sharedUrl}
                readOnly
                className="share-url-input"
              />
              <button onClick={copyToClipboard} className="btn-copy">
                Copy
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="btn-close-modal">
              Close
            </button>
          </div>
        </div>
      )}

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
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        /* Fixed header in reading mode */
        .reading-mode-active .editor-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .editor-header.header-hidden {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
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

        .btn-toggle-mode, .btn-theme, .btn-share, .btn-copy-content {
          padding: 0.5rem 1rem;
          background: var(--button-bg, #fff);
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-color, #333);
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-toggle-mode:hover, .btn-theme:hover, .btn-share:hover, .btn-copy-content:hover {
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

        .btn-share {
          background: var(--share-btn-bg, #28a745);
          color: var(--share-btn-color, white);
          border-color: var(--share-btn-border, #28a745);
        }

        .btn-share:hover {
          background: var(--share-btn-hover, #218838);
        }

        .btn-share:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          position: relative;
        }

        /* Reading Mode */
        .reading-mode-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--preview-bg, #fff);
        }

        .reading-mode-active .reading-mode-container {
          padding-top: 60px; /* Space for fixed header */
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

        /* Share Modal */
        .share-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .share-modal {
          background: var(--surface-color, white);
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .share-modal h2 {
          margin: 0 0 1rem 0;
          color: var(--text-color, #333);
        }

        .share-modal p {
          margin: 0 0 1rem 0;
          color: var(--text-secondary, #666);
        }

        .share-url-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .share-url-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          font-size: 0.9rem;
          background: var(--background-color, #fff);
          color: var(--text-color, #333);
        }

        .btn-copy {
          padding: 0.75rem 1rem;
          background: var(--primary-color, #007bff);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .btn-copy:hover {
          background: var(--primary-hover, #0056b3);
        }

        .btn-close-modal {
          width: 100%;
          padding: 0.75rem;
          background: var(--button-bg, #f5f5f5);
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-color, #333);
          transition: background 0.2s;
        }

        .btn-close-modal:hover {
          background: var(--button-hover, #e9ecef);
        }

        /* Draw Embeds */
        .draw-embed {
          margin: 1.5rem 0;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 8px;
          overflow: hidden;
          background: #fafafa;
        }

        .draw-embed-content {
          padding: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        .draw-embed-content svg {
          max-width: 100%;
          height: auto;
        }

        .draw-embed-caption {
          padding: 8px 16px;
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
          border-top: 1px solid var(--border-color, #e0e0e0);
          background: var(--header-bg, #f5f5f5);
          text-align: center;
          font-style: italic;
        }

        .draw-embed.draw-error {
          border-color: #e03131;
          background: #fff5f5;
        }

        .draw-embed.draw-error p {
          color: #e03131;
          text-align: center;
          padding: 1rem;
          margin: 0;
        }

        [data-theme="dark"] .draw-embed {
          background: #252525;
          border-color: #444;
        }

        [data-theme="dark"] .draw-embed-caption {
          background: #2d2d2d;
          border-color: #444;
        }

        [data-theme="dark"] .draw-embed-content svg text {
          fill: #e0e0e0;
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
          --share-btn-bg: #28a745;
          --share-btn-color: white;
          --share-btn-border: #28a745;
          --share-btn-hover: #218838;
        }

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
          --share-btn-bg: #238636;
          --share-btn-color: white;
          --share-btn-border: #238636;
          --share-btn-hover: #2ea043;
        }

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
          --share-btn-bg: #6b8e4e;
          --share-btn-color: white;
          --share-btn-border: #6b8e4e;
          --share-btn-hover: #5a7a40;
        }

        /* Catppuccin Pink Theme (Rosewater Background) */
        [data-theme="catppuccin"] .editor-page {
          --background-color: #dc8a78;
          --header-bg: #f5e9e6;
          --text-color: #2d2a2e;
          --text-secondary: #5c4f4d;
          --border-color: #c97a68;
          --button-bg: #f5e9e6;
          --button-hover: #edd5d0;
          --preview-bg: #faf3f1;
          --surface-color: #f5e9e6;
          --primary-color: #8839ef;
          --primary-hover: #7c3aed;
          --share-btn-bg: #40a02b;
          --share-btn-color: white;
          --share-btn-border: #40a02b;
          --share-btn-hover: #369923;
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
          background-color: #faf3f1 !important;
          color: #2d2a2e !important;
        }

        [data-theme="catppuccin"] .markdown-body h1 {
          color: #d20f39 !important;
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h2 {
          color: #8839ef !important;
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h3 {
          color: #179299 !important;
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h4 {
          color: #40a02b !important;
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h5 {
          color: #209fb5 !important;
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body h6 {
          color: #7287fd !important;
          border-bottom-color: #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body a {
          color: #1e66f5 !important;
          text-decoration: none;
        }

        [data-theme="catppuccin"] .markdown-body a:hover {
          color: #04a5e5 !important;
          text-decoration: underline;
        }

        [data-theme="catppuccin"] .markdown-body code {
          background: #f5e9e6 !important;
          color: #fe640b !important;
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

        [data-theme="catppuccin"] .markdown-body blockquote {
          color: #5c4f4d !important;
          border-left: 4px solid #8839ef !important;
          background-color: #f5e9e6 !important;
          padding: 0.5em 1em !important;
        }

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

        [data-theme="catppuccin"] .markdown-body hr {
          background-color: #179299 !important;
          height: 3px !important;
          border: none !important;
          opacity: 0.6;
        }

        [data-theme="catppuccin"] .markdown-body strong {
          color: #d20f39 !important;
          font-weight: 700 !important;
        }

        [data-theme="catppuccin"] .markdown-body em {
          color: #8839ef !important;
          font-style: italic;
        }

        [data-theme="catppuccin"] .markdown-body ul,
        [data-theme="catppuccin"] .markdown-body ol {
          color: #2d2a2e !important;
        }

        [data-theme="catppuccin"] .markdown-body li::marker {
          color: #179299 !important;
        }

        [data-theme="catppuccin"] .markdown-body .task-list-item input[type="checkbox"] {
          accent-color: #40a02b !important;
        }

        [data-theme="catppuccin"] .markdown-body img {
          border-radius: 8px !important;
          border: 2px solid #e0b8b0 !important;
          box-shadow: 0 2px 8px rgba(220, 138, 120, 0.2) !important;
        }

        [data-theme="catppuccin"] .markdown-body kbd {
          background-color: #f5e9e6 !important;
          color: #2d2a2e !important;
          border: 1px solid #e0b8b0 !important;
          border-radius: 3px !important;
          padding: 0.2em 0.4em !important;
          box-shadow: 0 2px 0 #e0b8b0 !important;
        }

        [data-theme="catppuccin"] .markdown-body mark {
          background-color: #df8e1d !important;
          color: #2d2a2e !important;
          padding: 0.2em 0.4em !important;
          border-radius: 2px !important;
        }

        [data-theme="catppuccin"] .markdown-body details summary {
          color: #1e66f5 !important;
          cursor: pointer;
          font-weight: 600;
        }

        [data-theme="catppuccin"] .markdown-body details summary:hover {
          color: #04a5e5 !important;
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

          .btn-toggle-mode,
          .btn-share {
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
          }

          .btn-theme {
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
          }

          .btn-theme .theme-name {
            display: none;
          }

          .theme-menu {
            min-width: 160px;
            right: 0;
          }

          .theme-menu button {
            padding: 0.65rem 0.85rem;
            font-size: 0.9rem;
          }

          .reading-preview {
            padding: 2rem 1rem;
          }

          .preview-pane {
            padding: 1rem;
          }

          .share-modal {
            padding: 1.5rem;
          }

          .share-url-container {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .editor-header {
            padding: 0.5rem;
          }

          .header-left h1 {
            font-size: 0.9rem;
          }

          .btn-toggle-mode,
          .btn-share,
          .btn-theme,
          .btn-copy-content {
            padding: 0.35rem 0.5rem;
            font-size: 0.8rem;
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

export default PublicMarkdownPreview;
