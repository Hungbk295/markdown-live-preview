/**
 * Shared Excalidraw SVG renderer.
 * Used by DrawViewPage and inline draw embeds in markdown preview.
 */

export function renderElement(el) {
  const stroke = el.strokeColor || '#1e1e1e';
  const fill = el.backgroundColor || 'transparent';
  const strokeWidth = el.strokeWidth || 1;
  const opacity = el.opacity != null ? el.opacity / 100 : 1;

  const style = `stroke="${stroke}" fill="${fill === 'transparent' ? 'none' : fill}" stroke-width="${strokeWidth}" opacity="${opacity}"`;

  switch (el.type) {
    case 'rectangle':
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.roundness?.value || 0}" ${style} />`;

    case 'ellipse':
      return `<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" ${style} />`;

    case 'diamond': {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const points = `${cx},${el.y} ${el.x + el.width},${cy} ${cx},${el.y + el.height} ${el.x},${cy}`;
      return `<polygon points="${points}" ${style} />`;
    }

    case 'line':
    case 'arrow': {
      if (!el.points || el.points.length < 2) return '';
      const pts = el.points.map(p => `${el.x + p[0]},${el.y + p[1]}`).join(' ');
      let marker = '';
      if (el.type === 'arrow') {
        const lastPt = el.points[el.points.length - 1];
        const prevPt = el.points[el.points.length - 2] || el.points[0];
        const angle = Math.atan2(lastPt[1] - prevPt[1], lastPt[0] - prevPt[0]);
        const tipX = el.x + lastPt[0];
        const tipY = el.y + lastPt[1];
        const arrowLen = 10;
        const a1x = tipX - arrowLen * Math.cos(angle - 0.4);
        const a1y = tipY - arrowLen * Math.sin(angle - 0.4);
        const a2x = tipX - arrowLen * Math.cos(angle + 0.4);
        const a2y = tipY - arrowLen * Math.sin(angle + 0.4);
        marker = `<polygon points="${tipX},${tipY} ${a1x},${a1y} ${a2x},${a2y}" fill="${stroke}" stroke="none" opacity="${opacity}" />`;
      }
      return `<polyline points="${pts}" ${style} fill="none" />${marker}`;
    }

    case 'freedraw': {
      if (!el.points || el.points.length < 2) return '';
      const d = el.points.map((p, i) =>
        i === 0 ? `M ${el.x + p[0]} ${el.y + p[1]}` : `L ${el.x + p[0]} ${el.y + p[1]}`
      ).join(' ');
      return `<path d="${d}" ${style} fill="none" />`;
    }

    case 'text': {
      const fontSize = el.fontSize || 20;
      const textColor = el.strokeColor || '#1e1e1e';
      const textAlign = el.textAlign || 'left';
      const lines = (el.text || '').split('\n');
      const lineHeight = fontSize * 1.25;
      return lines.map((line, i) => {
        const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let anchor = 'start';
        let xPos = el.x;
        if (textAlign === 'center') { anchor = 'middle'; xPos = el.x + (el.width || 0) / 2; }
        else if (textAlign === 'right') { anchor = 'end'; xPos = el.x + (el.width || 0); }
        return `<text x="${xPos}" y="${el.y + fontSize + i * lineHeight}" font-size="${fontSize}" fill="${textColor}" text-anchor="${anchor}" opacity="${opacity}">${escaped}</text>`;
      }).join('\n');
    }

    default:
      return '';
  }
}

export function renderToSvg(elements) {
  if (!elements || elements.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="100%"><text x="100" y="25" text-anchor="middle" fill="#999" font-size="14">Empty drawing</text></svg>';
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    if (el.isDeleted) continue;
    if (el.points) {
      for (const p of el.points) {
        minX = Math.min(minX, el.x + p[0]);
        minY = Math.min(minY, el.y + p[1]);
        maxX = Math.max(maxX, el.x + p[0]);
        maxY = Math.max(maxY, el.y + p[1]);
      }
    } else {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.width || 0));
      maxY = Math.max(maxY, el.y + (el.height || 0));
    }
  }

  if (!isFinite(minX)) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="100%"><text x="100" y="25" text-anchor="middle" fill="#999" font-size="14">Empty drawing</text></svg>';
  }

  const padding = 40;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  const width = maxX - minX;
  const height = maxY - minY;

  const svgElements = elements
    .filter(el => !el.isDeleted)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(el => renderElement(el))
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="100%" style="max-height:600px">
    <style>text { font-family: 'Virgil', 'Segoe Print', 'Comic Sans MS', cursive; }</style>
    ${svgElements}
  </svg>`;
}

/**
 * Scan markdown content for draw:xxx references.
 * Returns array of drawIds found.
 */
export function extractDrawIds(markdown) {
  const regex = /!\[([^\]]*)\]\(draw:([a-f0-9]+)\)/gi;
  const ids = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    ids.push(match[2]);
  }
  return [...new Set(ids)];
}

/**
 * Replace draw:xxx image references in HTML with inline SVG.
 * @param {string} html - HTML output from marked
 * @param {Object} drawingsMap - Map of drawId -> drawing data
 * @returns {string} HTML with embedded SVGs
 */
export function embedDrawings(html, drawingsMap) {
  return html.replace(
    /<img\s+src="draw:([a-f0-9]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    (match, drawId, alt) => {
      const drawing = drawingsMap[drawId];
      if (!drawing || !drawing.elements) {
        return `<div class="draw-embed draw-error"><p>Drawing not found: ${drawId}</p></div>`;
      }
      const svg = renderToSvg(drawing.elements);
      const title = alt || drawing.title || 'Drawing';
      return `<div class="draw-embed">
        <div class="draw-embed-content">${svg}</div>
        <div class="draw-embed-caption">${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>
      </div>`;
    }
  );
}
