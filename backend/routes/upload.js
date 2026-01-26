const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const { createBook, saveBookCover } = require('../utils/fileSystem');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory temporarily
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 2 // markdown + cover
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    if (file.fieldname === 'markdown') {
      // Accept markdown files or text files
      const allowedMimeTypes = [
        'text/markdown',
        'text/plain',
        'application/octet-stream'
      ];
      if (
        allowedMimeTypes.includes(file.mimetype) ||
        file.originalname.endsWith('.md')
      ) {
        cb(null, true);
      } else {
        cb(new Error('Only markdown files (.md) are allowed'));
      }
    } else if (file.fieldname === 'cover') {
      // Accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for cover'));
      }
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`));
    }
  }
});

// Require authentication
router.use(requireAuth);

/**
 * POST /api/upload
 * Upload a new book with markdown content and optional cover image
 * Expects multipart/form-data with:
 * - markdown: markdown file
 * - cover: image file (optional)
 * - bookname: string (optional, defaults to markdown filename)
 */
router.post(
  '/',
  upload.fields([
    { name: 'markdown', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const username = req.session.user.username;

      // Check if markdown file was uploaded
      if (!req.files || !req.files.markdown || !req.files.markdown[0]) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Markdown file is required'
        });
      }

      const markdownFile = req.files.markdown[0];
      const coverFile = req.files.cover ? req.files.cover[0] : null;

      // Get book name from request body or use markdown filename
      let bookname = req.body.bookname;
      if (!bookname) {
        // Extract name from markdown filename (remove .md extension)
        bookname = path.basename(
          markdownFile.originalname,
          path.extname(markdownFile.originalname)
        );
      }

      // Read markdown content
      const content = markdownFile.buffer.toString('utf-8');

      // Prepare cover data if provided
      let coverBuffer = null;
      let coverExt = null;
      if (coverFile) {
        coverBuffer = coverFile.buffer;
        // Get extension from mimetype (e.g., image/jpeg -> jpg)
        const mimeMap = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp'
        };
        coverExt = mimeMap[coverFile.mimetype] || 'jpg';
      }

      // Create the book
      const result = await createBook(
        username,
        bookname,
        content,
        coverBuffer,
        coverExt
      );

      res.json({
        success: true,
        bookname: result.name,
        message: 'Book uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading book:', error);

      // Handle multer errors
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'File size too large (max 10MB)'
          });
        }
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Server Error',
        message: error.message || 'Failed to upload book'
      });
    }
  }
);

/**
 * POST /api/upload/cover/:bookname
 * Upload/update cover image for an existing book
 */
router.post(
  '/cover/:bookname',
  upload.single('cover'),
  async (req, res) => {
    try {
      const username = req.session.user.username;
      const { bookname } = req.params;

      if (!req.file) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Cover image is required'
        });
      }

      const coverFile = req.file;
      const mimeMap = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
      };
      const coverExt = mimeMap[coverFile.mimetype] || 'jpg';

      const result = await saveBookCover(
        username,
        bookname,
        coverFile.buffer,
        coverExt
      );

      res.json(result);
    } catch (error) {
      console.error('Error uploading cover:', error);
      res.status(500).json({
        error: 'Server Error',
        message: error.message || 'Failed to upload cover'
      });
    }
  }
);

module.exports = router;
