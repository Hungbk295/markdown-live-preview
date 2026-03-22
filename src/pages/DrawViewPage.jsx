import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { renderToSvg } from '../utils/drawRenderer';

function DrawViewPage() {
  const { drawId } = useParams();
  const navigate = useNavigate();
  const [drawing, setDrawing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (drawId) {
      fetchDrawing();
    }
  }, [drawId]);

  const fetchDrawing = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/draw/${drawId}`);
      setDrawing(response.data);
    } catch (err) {
      console.error('Error fetching drawing:', err);
      setError(err.response?.status === 404 ? 'Drawing not found' : 'Failed to load drawing');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1e1e1e' : '#ffffff';
  const textColor = isDark ? '#e0e0e0' : '#333';
  const headerBg = isDark ? '#252525' : '#f8f9fa';
  const borderColor = isDark ? '#333' : '#e0e0e0';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bgColor, color: textColor }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bgColor, color: textColor, gap: '16px' }}>
        <p>{error}</p>
        <button onClick={() => navigate('/draw/all')} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}>
          Back to Drawings
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: bgColor }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/draw/all')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: textColor, fontSize: '1.2rem', padding: '4px 8px'
            }}
          >
            &larr;
          </button>
          <h1 style={{ margin: 0, fontSize: '1.1rem', color: textColor }}>
            {drawing?.title || 'Drawing'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#999' }}>
            {drawing?.elements?.length || 0} elements
          </span>
          <span style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#999' }}>
            ID: {drawId}
          </span>
        </div>
      </header>

      <div
        ref={canvasRef}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          background: isDark ? '#1a1a2e' : '#fafafa'
        }}
        dangerouslySetInnerHTML={{
          __html: drawing ? renderToSvg(drawing.elements) : ''
        }}
      />
    </div>
  );
}

export default DrawViewPage;
