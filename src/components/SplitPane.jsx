import { useRef, useEffect, useState } from 'react';

function SplitPane({ left, right }) {
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const dividerRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const totalWidth = containerRect.width;

      // Support both mouse and touch events
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const offsetX = clientX - containerRect.left;

      // Calculate new left width as percentage
      const minPercent = 10;
      const maxPercent = 90;
      let newLeftPercent = (offsetX / totalWidth) * 100;
      newLeftPercent = Math.max(minPercent, Math.min(maxPercent, newLeftPercent));

      setLeftWidth(newLeftPercent);
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
      }
    };

    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);

      // Touch events
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);

      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleDoubleClick = () => {
    setLeftWidth(50); // Reset to 50/50
  };

  return (
    <div ref={containerRef} className="split-pane-container">
      <div
        className="split-pane-left"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      <div
        ref={dividerRef}
        className="split-divider"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onDoubleClick={handleDoubleClick}
      />

      <div
        className="split-pane-right"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>

      <style>{`
        .split-pane-container {
          display: flex;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .split-pane-left,
        .split-pane-right {
          height: 100%;
          overflow: auto;
        }

        .split-divider {
          width: 4px;
          background: var(--divider-color, #ddd);
          cursor: col-resize;
          transition: background 0.2s;
          flex-shrink: 0;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }

        .split-divider:hover {
          background: var(--divider-hover, #999);
        }

        [data-theme="dark"] .split-divider {
          --divider-color: #444;
          --divider-hover: #666;
        }

        /* Catppuccin theme divider */
        [data-theme="catppuccin"] .split-divider {
          --divider-color: #e0b8b0;
          --divider-hover: #c97a68;
        }

        /* Mobile responsive - wider touch target */
        @media (max-width: 768px) {
          .split-divider {
            width: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default SplitPane;
