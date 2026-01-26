const fs = require('fs').promises;
const path = require('path');

// Base storage path for all books
const STORAGE_PATH = path.join(__dirname, '../storage/books');

/**
 * Sanitize book name to prevent path traversal attacks
 * Only allows alphanumeric characters, hyphens, and underscores
 */
function sanitizeBookName(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
}

/**
 * Get path to user's books directory
 */
function getUserBooksPath(username) {
  return path.join(STORAGE_PATH, username);
}

/**
 * Get path to specific book directory
 */
function getBookPath(username, bookname) {
  const sanitized = sanitizeBookName(bookname);
  return path.join(STORAGE_PATH, username, sanitized);
}

/**
 * Ensure user's books directory exists
 */
async function ensureUserDirectory(username) {
  const userPath = getUserBooksPath(username);
  try {
    await fs.access(userPath);
  } catch {
    await fs.mkdir(userPath, { recursive: true });
  }
}

/**
 * Get all books for a user
 * Returns array of book metadata: [{name, title, coverUrl, updatedAt}]
 */
async function getUserBooks(username) {
  await ensureUserDirectory(username);
  const userPath = getUserBooksPath(username);

  try {
    const entries = await fs.readdir(userPath, { withFileTypes: true });
    const books = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const bookPath = path.join(userPath, entry.name);
        const contentPath = path.join(bookPath, 'content.md');

        // Check if content.md exists
        try {
          const stats = await fs.stat(contentPath);

          // Check for cover image (jpg, png, or default)
          let coverUrl = null;
          for (const ext of ['jpg', 'png', 'jpeg']) {
            const coverPath = path.join(bookPath, `cover.${ext}`);
            try {
              await fs.access(coverPath);
              coverUrl = `/api/books/${entry.name}/cover.${ext}`;
              break;
            } catch {
              // Cover doesn't exist, continue
            }
          }

          // Convert folder name to title (e.g., "my-book" -> "My Book")
          const title = entry.name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          books.push({
            name: entry.name,
            title,
            coverUrl,
            updatedAt: stats.mtime
          });
        } catch {
          // content.md doesn't exist, skip this directory
        }
      }
    }

    // Sort by updated date, most recent first
    books.sort((a, b) => b.updatedAt - a.updatedAt);

    return books;
  } catch (error) {
    console.error('Error reading user books:', error);
    return [];
  }
}

/**
 * Get content of a specific book
 * Returns {name, content, title}
 */
async function getBookContent(username, bookname) {
  const sanitized = sanitizeBookName(bookname);
  const bookPath = getBookPath(username, bookname);
  const contentPath = path.join(bookPath, 'content.md');

  try {
    const content = await fs.readFile(contentPath, 'utf-8');
    const title = sanitized
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      name: sanitized,
      content,
      title
    };
  } catch (error) {
    throw new Error(`Book not found: ${bookname}`);
  }
}

/**
 * Save/update book content
 */
async function saveBookContent(username, bookname, content) {
  const sanitized = sanitizeBookName(bookname);
  const bookPath = getBookPath(username, bookname);
  const contentPath = path.join(bookPath, 'content.md');

  try {
    // Ensure book directory exists
    await fs.mkdir(bookPath, { recursive: true });

    // Write content
    await fs.writeFile(contentPath, content, 'utf-8');

    return { success: true, name: sanitized };
  } catch (error) {
    throw new Error(`Failed to save book: ${error.message}`);
  }
}

/**
 * Delete a book (remove entire directory)
 */
async function deleteBook(username, bookname) {
  const sanitized = sanitizeBookName(bookname);
  const bookPath = getBookPath(username, bookname);

  try {
    await fs.rm(bookPath, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete book: ${error.message}`);
  }
}

/**
 * Rename a book (rename directory)
 */
async function renameBook(username, oldName, newName) {
  const sanitizedOld = sanitizeBookName(oldName);
  const sanitizedNew = sanitizeBookName(newName);

  const oldPath = getBookPath(username, oldName);
  const newPath = getBookPath(username, newName);

  try {
    // Check if old book exists
    await fs.access(oldPath);

    // Check if new name already exists
    try {
      await fs.access(newPath);
      throw new Error(`Book with name "${newName}" already exists`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw error;
      }
      // New name doesn't exist, proceed with rename
    }

    // Rename directory
    await fs.rename(oldPath, newPath);

    return { success: true, newName: sanitizedNew };
  } catch (error) {
    throw new Error(`Failed to rename book: ${error.message}`);
  }
}

/**
 * Create a new book with content and optional cover
 */
async function createBook(username, bookname, content, coverBuffer, coverExt) {
  const sanitized = sanitizeBookName(bookname);
  const bookPath = getBookPath(username, bookname);
  const contentPath = path.join(bookPath, 'content.md');

  try {
    // Check if book already exists
    try {
      await fs.access(bookPath);
      throw new Error(`Book with name "${bookname}" already exists`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw error;
      }
      // Book doesn't exist, proceed with creation
    }

    // Create book directory
    await fs.mkdir(bookPath, { recursive: true });

    // Write content
    await fs.writeFile(contentPath, content, 'utf-8');

    // Write cover if provided
    if (coverBuffer && coverExt) {
      const coverPath = path.join(bookPath, `cover.${coverExt}`);
      await fs.writeFile(coverPath, coverBuffer);
    }

    return { success: true, name: sanitized };
  } catch (error) {
    // Clean up if creation failed
    try {
      await fs.rm(bookPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to create book: ${error.message}`);
  }
}

/**
 * Save cover image for a book
 */
async function saveBookCover(username, bookname, coverBuffer, coverExt) {
  const sanitized = sanitizeBookName(bookname);
  const bookPath = getBookPath(username, bookname);
  const coverPath = path.join(bookPath, `cover.${coverExt}`);

  try {
    // Ensure book directory exists
    await fs.mkdir(bookPath, { recursive: true });

    // Remove old cover images
    for (const ext of ['jpg', 'png', 'jpeg']) {
      const oldCoverPath = path.join(bookPath, `cover.${ext}`);
      try {
        await fs.unlink(oldCoverPath);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    // Write new cover
    await fs.writeFile(coverPath, coverBuffer);

    return { success: true, coverUrl: `/api/books/${sanitized}/cover.${coverExt}` };
  } catch (error) {
    throw new Error(`Failed to save cover: ${error.message}`);
  }
}

module.exports = {
  sanitizeBookName,
  getUserBooks,
  getBookContent,
  saveBookContent,
  deleteBook,
  renameBook,
  createBook,
  saveBookCover
};
