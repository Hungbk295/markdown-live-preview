const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Drawings storage directory
const DRAWINGS_DIR = path.join(__dirname, '../storage/Drawings');

// Ensure Drawings directory exists
async function ensureDrawingsDir() {
  try {
    await fs.access(DRAWINGS_DIR);
  } catch {
    await fs.mkdir(DRAWINGS_DIR, { recursive: true });
  }
}

// Generate random 6 character alphanumeric ID
function generateDrawId() {
  return crypto.randomBytes(3).toString('hex');
}

// POST /api/draw - Create a new drawing
router.post('/', async (req, res) => {
  try {
    const { title, elements, appState, files } = req.body;

    if (!elements || !Array.isArray(elements)) {
      return res.status(400).json({ error: 'Elements array is required' });
    }

    await ensureDrawingsDir();

    // Generate unique ID
    let drawId;
    let filePath;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      drawId = generateDrawId();
      filePath = path.join(DRAWINGS_DIR, `${drawId}.json`);
      try {
        await fs.access(filePath);
        attempts++;
      } catch {
        break;
      }
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Could not generate unique draw ID' });
    }

    const drawing = {
      title: title || 'Untitled Drawing',
      elements,
      appState: appState || {},
      files: files || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(drawing, null, 2), 'utf-8');

    res.json({
      success: true,
      drawId,
      url: `/draw/${drawId}`
    });
  } catch (error) {
    console.error('Error creating drawing:', error);
    res.status(500).json({ error: 'Failed to create drawing' });
  }
});

// GET /api/draw/list - List all drawings
router.get('/list', async (req, res) => {
  try {
    await ensureDrawingsDir();

    const files = await fs.readdir(DRAWINGS_DIR);
    const drawings = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const drawId = file.replace('.json', '');
        const filePath = path.join(DRAWINGS_DIR, file);
        const stat = await fs.stat(filePath);

        try {
          const raw = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(raw);

          drawings.push({
            drawId,
            title: data.title || 'Untitled Drawing',
            elementCount: data.elements ? data.elements.length : 0,
            createdAt: data.createdAt || stat.birthtime,
            updatedAt: data.updatedAt || stat.mtime
          });
        } catch {
          // Skip invalid JSON files
        }
      }
    }

    drawings.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(drawings);
  } catch (error) {
    console.error('Error listing drawings:', error);
    res.status(500).json({ error: 'Failed to list drawings' });
  }
});

// GET /api/draw/:drawId - Get drawing data
router.get('/:drawId', async (req, res) => {
  try {
    const { drawId } = req.params;

    if (!/^[a-f0-9]{6}$/i.test(drawId)) {
      return res.status(400).json({ error: 'Invalid draw ID format' });
    }

    const filePath = path.join(DRAWINGS_DIR, `${drawId}.json`);

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      res.json({ ...data, drawId });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Drawing not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching drawing:', error);
    res.status(500).json({ error: 'Failed to fetch drawing' });
  }
});

// PUT /api/draw/:drawId - Update drawing
router.put('/:drawId', async (req, res) => {
  try {
    const { drawId } = req.params;
    const { title, elements, appState, files } = req.body;

    if (!/^[a-f0-9]{6}$/i.test(drawId)) {
      return res.status(400).json({ error: 'Invalid draw ID format' });
    }

    const filePath = path.join(DRAWINGS_DIR, `${drawId}.json`);

    let existing;
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      existing = JSON.parse(raw);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Drawing not found' });
      }
      throw error;
    }

    const updated = {
      ...existing,
      title: title || existing.title,
      elements: elements || existing.elements,
      appState: appState || existing.appState,
      files: files || existing.files,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    res.json({ success: true, drawId });
  } catch (error) {
    console.error('Error updating drawing:', error);
    res.status(500).json({ error: 'Failed to update drawing' });
  }
});

// DELETE /api/draw/:drawId - Delete drawing
router.delete('/:drawId', async (req, res) => {
  try {
    const { drawId } = req.params;

    if (!/^[a-f0-9]{6}$/i.test(drawId)) {
      return res.status(400).json({ error: 'Invalid draw ID format' });
    }

    const filePath = path.join(DRAWINGS_DIR, `${drawId}.json`);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Drawing not found' });
      }
      throw error;
    }

    res.json({ success: true, drawId });
  } catch (error) {
    console.error('Error deleting drawing:', error);
    res.status(500).json({ error: 'Failed to delete drawing' });
  }
});

module.exports = router;
