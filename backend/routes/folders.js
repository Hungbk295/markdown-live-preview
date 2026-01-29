const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { requireAuth } = require('../middleware/auth');
const {
    getUserFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    moveBookToFolder,
    moveBookFromFolder,
    getFolderBooks,
    getFolderPath,
    sanitizeBookName
} = require('../utils/fileSystem');

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/folders
 * List all folders for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const username = req.session.user.username;
        const folders = await getUserFolders(username);
        res.json(folders);
    } catch (error) {
        console.error('Error getting folders:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to retrieve folders'
        });
    }
});

/**
 * POST /api/folders
 * Create a new folder
 */
router.post('/', async (req, res) => {
    try {
        const username = req.session.user.username;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Folder name is required'
            });
        }

        const result = await createFolder(username, name.trim());
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({
            error: 'Server Error',
            message: error.message || 'Failed to create folder'
        });
    }
});

/**
 * GET /api/folders/:foldername/books
 * Get all books in a folder
 */
router.get('/:foldername/books', async (req, res) => {
    try {
        const username = req.session.user.username;
        const { foldername } = req.params;

        const books = await getFolderBooks(username, foldername);
        res.json(books);
    } catch (error) {
        console.error('Error getting folder books:', error);
        res.status(404).json({
            error: 'Not Found',
            message: error.message || 'Folder not found'
        });
    }
});

/**
 * GET /api/folders/:foldername/books/:bookname/cover.:ext
 * Get book cover image from a folder
 */
router.get('/:foldername/books/:bookname/cover.:ext', async (req, res) => {
    try {
        const username = req.session.user.username;
        const { foldername, bookname, ext } = req.params;
        const sanitizedFolder = sanitizeBookName(foldername);
        const sanitizedBook = sanitizeBookName(bookname);

        const coverPath = path.join(
            __dirname,
            '../storage/books',
            username,
            sanitizedFolder,
            sanitizedBook,
            `cover.${ext}`
        );

        await fs.access(coverPath);
        res.sendFile(coverPath);
    } catch (error) {
        res.status(404).json({
            error: 'Not Found',
            message: 'Cover image not found'
        });
    }
});

/**
 * DELETE /api/folders/:foldername
 * Delete a folder and all its contents
 */
router.delete('/:foldername', async (req, res) => {
    try {
        const username = req.session.user.username;
        const { foldername } = req.params;

        const result = await deleteFolder(username, foldername);
        res.json(result);
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({
            error: 'Server Error',
            message: error.message || 'Failed to delete folder'
        });
    }
});

/**
 * PUT /api/folders/:foldername/rename
 * Rename a folder
 */
router.put('/:foldername/rename', async (req, res) => {
    try {
        const username = req.session.user.username;
        const { foldername } = req.params;
        const { newName } = req.body;

        if (!newName || !newName.trim()) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'New folder name is required'
            });
        }

        const result = await renameFolder(username, foldername, newName.trim());
        res.json(result);
    } catch (error) {
        console.error('Error renaming folder:', error);
        res.status(500).json({
            error: 'Server Error',
            message: error.message || 'Failed to rename folder'
        });
    }
});

/**
 * PUT /api/folders/:foldername/move-book
 * Move a book into this folder
 */
router.put('/:foldername/move-book', async (req, res) => {
    try {
        const username = req.session.user.username;
        const { foldername } = req.params;
        const { bookName } = req.body;

        if (!bookName) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Book name is required'
            });
        }

        const result = await moveBookToFolder(username, bookName, foldername);
        res.json(result);
    } catch (error) {
        console.error('Error moving book to folder:', error);
        res.status(500).json({
            error: 'Server Error',
            message: error.message || 'Failed to move book to folder'
        });
    }
});

/**
 * PUT /api/folders/:foldername/remove-book
 * Move a book out of this folder to root
 */
router.put('/:foldername/remove-book', async (req, res) => {
    try {
        const username = req.session.user.username;
        const { foldername } = req.params;
        const { bookName } = req.body;

        if (!bookName) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Book name is required'
            });
        }

        const result = await moveBookFromFolder(username, bookName, foldername);
        res.json(result);
    } catch (error) {
        console.error('Error removing book from folder:', error);
        res.status(500).json({
            error: 'Server Error',
            message: error.message || 'Failed to remove book from folder'
        });
    }
});

module.exports = router;
