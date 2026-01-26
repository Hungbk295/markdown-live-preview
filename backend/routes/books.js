const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { requireAuth } = require('../middleware/auth');
const {
  getUserBooks,
  getBookContent,
  saveBookContent,
  deleteBook,
  renameBook,
  sanitizeBookName
} = require('../utils/fileSystem');

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/books
 * List all books for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const username = req.session.user.username;
    const books = await getUserBooks(username);

    res.json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve books'
    });
  }
});

/**
 * GET /api/books/:bookname
 * Get content of a specific book
 */
router.get('/:bookname', async (req, res) => {
  try {
    const username = req.session.user.username;
    const { bookname } = req.params;

    const book = await getBookContent(username, bookname);

    res.json(book);
  } catch (error) {
    console.error('Error getting book content:', error);
    res.status(404).json({
      error: 'Not Found',
      message: error.message || 'Book not found'
    });
  }
});

/**
 * GET /api/books/:bookname/cover.:ext
 * Get book cover image
 */
router.get('/:bookname/cover.:ext', async (req, res) => {
  try {
    const username = req.session.user.username;
    const { bookname, ext } = req.params;
    const sanitized = sanitizeBookName(bookname);

    const coverPath = path.join(
      __dirname,
      '../storage/books',
      username,
      sanitized,
      `cover.${ext}`
    );

    // Check if file exists
    await fs.access(coverPath);

    // Send file
    res.sendFile(coverPath);
  } catch (error) {
    res.status(404).json({
      error: 'Not Found',
      message: 'Cover image not found'
    });
  }
});

/**
 * PUT /api/books/:bookname
 * Update book content
 */
router.put('/:bookname', async (req, res) => {
  try {
    const username = req.session.user.username;
    const { bookname } = req.params;
    const { content } = req.body;

    if (content === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content is required'
      });
    }

    const result = await saveBookContent(username, bookname, content);

    res.json(result);
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to save book'
    });
  }
});

/**
 * DELETE /api/books/:bookname
 * Delete a book
 */
router.delete('/:bookname', async (req, res) => {
  try {
    const username = req.session.user.username;
    const { bookname } = req.params;

    const result = await deleteBook(username, bookname);

    res.json(result);
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to delete book'
    });
  }
});

/**
 * PUT /api/books/:bookname/rename
 * Rename a book
 */
router.put('/:bookname/rename', async (req, res) => {
  try {
    const username = req.session.user.username;
    const { bookname } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'New name is required'
      });
    }

    const result = await renameBook(username, bookname, newName);

    res.json(result);
  } catch (error) {
    console.error('Error renaming book:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to rename book'
    });
  }
});

module.exports = router;
