const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Public_Book storage directory
const PUBLIC_BOOK_DIR = path.join(__dirname, '../storage/Public_Book');

// Ensure Public_Book directory exists
async function ensurePublicBookDir() {
  try {
    await fs.access(PUBLIC_BOOK_DIR);
  } catch {
    await fs.mkdir(PUBLIC_BOOK_DIR, { recursive: true });
  }
}

// Generate random 6 character alphanumeric ID
function generateShareId() {
  return crypto.randomBytes(3).toString('hex'); // 6 hex characters
}

// POST /api/public/share - Create a new shared markdown
router.post('/share', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    await ensurePublicBookDir();

    // Generate unique ID
    let shareId;
    let filePath;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shareId = generateShareId();
      filePath = path.join(PUBLIC_BOOK_DIR, `${shareId}.md`);
      try {
        await fs.access(filePath);
        // File exists, try again
        attempts++;
      } catch {
        // File doesn't exist, we can use this ID
        break;
      }
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Could not generate unique share ID' });
    }

    // Save the markdown content
    await fs.writeFile(filePath, content, 'utf-8');

    res.json({
      success: true,
      shareId,
      url: `/markdownpreview/${shareId}`
    });
  } catch (error) {
    console.error('Error creating shared markdown:', error);
    res.status(500).json({ error: 'Failed to create shared markdown' });
  }
});

// GET /api/public/share/:shareId - Get shared markdown content
router.get('/share/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    // Validate shareId (only alphanumeric, 6 chars)
    if (!/^[a-f0-9]{6}$/i.test(shareId)) {
      return res.status(400).json({ error: 'Invalid share ID format' });
    }

    const filePath = path.join(PUBLIC_BOOK_DIR, `${shareId}.md`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      res.json({ content, shareId });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Shared markdown not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching shared markdown:', error);
    res.status(500).json({ error: 'Failed to fetch shared markdown' });
  }
});

// PUT /api/public/share/:shareId - Update shared markdown content
router.put('/share/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const { content } = req.body;

    // Validate shareId
    if (!/^[a-f0-9]{6}$/i.test(shareId)) {
      return res.status(400).json({ error: 'Invalid share ID format' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const filePath = path.join(PUBLIC_BOOK_DIR, `${shareId}.md`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Shared markdown not found' });
    }

    // Update the content
    await fs.writeFile(filePath, content, 'utf-8');

    res.json({ success: true, shareId });
  } catch (error) {
    console.error('Error updating shared markdown:', error);
    res.status(500).json({ error: 'Failed to update shared markdown' });
  }
});

module.exports = router;
