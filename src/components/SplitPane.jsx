import { useRef, useEffect, useState } from 'react';

function SplitPane({ left, right }) {
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const dividerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const offsetX = e.clientX - containerRect.left;

      // Calculate new left width as percentage
      const minPercent = 10;
      const maxPercent = 90;
      let newLeftPercent = (offsetX / totalWidth) * 100;
      newLeftPercent = Math.max(minPercent, Math.min(maxPercent, newLeftPercent));

      setLeftWidth(newLeftPercent);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = () => {
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
        onMouseDown={handleMouseDown}
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
        }

        .split-divider:hover {
          background: var(--divider-hover, #999);
        }

        [data-theme="dark"] .split-divider {
          --divider-color: #444;
          --divider-hover: #666;
        }
      `}</style>
    </div>
  );
}

export default SplitPane;
