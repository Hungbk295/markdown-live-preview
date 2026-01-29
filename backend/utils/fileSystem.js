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
          let isDefaultCover = false;
          for (const ext of ['jpg', 'png', 'jpeg', 'webp', 'avif']) {
            const coverPath = path.join(bookPath, `cover.${ext}`);
            try {
              await fs.access(coverPath);
              coverUrl = `/api/books/${entry.name}/cover.${ext}`;
              // Heuristic: if it's avif or webp, it MIGHT be the default. 
              // To be more precise, we check if it matches the default extension we use.
              isDefaultCover = (ext === 'avif' || ext === 'webp');
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
            isDefaultCover,
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
    for (const ext of ['jpg', 'png', 'jpeg', 'webp', 'avif']) {
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
  saveBookCover,
  // Folder functions - will be added below
};

// ==================== FOLDER FUNCTIONS ====================

const STORAGE_PATH_REF = STORAGE_PATH;

/**
 * Check if a directory is a folder (has folder.json)
 */
async function isFolder(dirPath) {
  try {
    await fs.access(path.join(dirPath, 'folder.json'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory is a book (has content.md)
 */
async function isBook(dirPath) {
  try {
    await fs.access(path.join(dirPath, 'content.md'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get path to specific folder directory
 */
function getFolderPath(username, foldername) {
  const sanitized = sanitizeBookName(foldername);
  return path.join(STORAGE_PATH_REF, username, sanitized);
}

/**
 * Get all folders for a user
 */
async function getUserFolders(username) {
  await ensureUserDirectory(username);
  const userPath = getUserBooksPath(username);

  try {
    const entries = await fs.readdir(userPath, { withFileTypes: true });
    const folders = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folderPath = path.join(userPath, entry.name);

        if (await isFolder(folderPath)) {
          const folderJsonPath = path.join(folderPath, 'folder.json');
          const stats = await fs.stat(folderJsonPath);

          // Count books inside folder
          const folderEntries = await fs.readdir(folderPath, { withFileTypes: true });
          let bookCount = 0;
          for (const fe of folderEntries) {
            if (fe.isDirectory()) {
              const bookPath = path.join(folderPath, fe.name);
              if (await isBook(bookPath)) {
                bookCount++;
              }
            }
          }

          const title = entry.name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          folders.push({
            name: entry.name,
            title,
            bookCount,
            updatedAt: stats.mtime
          });
        }
      }
    }

    folders.sort((a, b) => b.updatedAt - a.updatedAt);
    return folders;
  } catch (error) {
    console.error('Error reading user folders:', error);
    return [];
  }
}

/**
 * Create a new folder
 */
async function createFolder(username, foldername) {
  const sanitized = sanitizeBookName(foldername);
  const folderPath = getFolderPath(username, foldername);

  try {
    try {
      await fs.access(folderPath);
      throw new Error(`A folder or book with name "${foldername}" already exists`);
    } catch (error) {
      if (error.message.includes('already exists')) throw error;
    }

    await fs.mkdir(folderPath, { recursive: true });

    const folderMeta = { name: sanitized, createdAt: new Date().toISOString() };
    await fs.writeFile(path.join(folderPath, 'folder.json'), JSON.stringify(folderMeta, null, 2), 'utf-8');

    return { success: true, name: sanitized };
  } catch (error) {
    throw new Error(`Failed to create folder: ${error.message}`);
  }
}

/**
 * Delete a folder
 */
async function deleteFolder(username, foldername) {
  const folderPath = getFolderPath(username, foldername);

  try {
    if (!(await isFolder(folderPath))) {
      throw new Error(`"${foldername}" is not a folder`);
    }
    await fs.rm(folderPath, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete folder: ${error.message}`);
  }
}

/**
 * Rename a folder
 */
async function renameFolder(username, oldName, newName) {
  const sanitizedNew = sanitizeBookName(newName);
  const oldPath = getFolderPath(username, oldName);
  const newPath = getFolderPath(username, newName);

  try {
    if (!(await isFolder(oldPath))) {
      throw new Error(`"${oldName}" is not a folder`);
    }

    try {
      await fs.access(newPath);
      throw new Error(`A folder or book with name "${newName}" already exists`);
    } catch (error) {
      if (error.message.includes('already exists')) throw error;
    }

    await fs.rename(oldPath, newPath);

    const folderJsonPath = path.join(newPath, 'folder.json');
    const folderMeta = JSON.parse(await fs.readFile(folderJsonPath, 'utf-8'));
    folderMeta.name = sanitizedNew;
    await fs.writeFile(folderJsonPath, JSON.stringify(folderMeta, null, 2), 'utf-8');

    return { success: true, newName: sanitizedNew };
  } catch (error) {
    throw new Error(`Failed to rename folder: ${error.message}`);
  }
}

/**
 * Move a book into a folder
 */
async function moveBookToFolder(username, bookname, foldername) {
  const sanitizedBook = sanitizeBookName(bookname);
  const sanitizedFolder = sanitizeBookName(foldername);

  const bookPath = path.join(STORAGE_PATH_REF, username, sanitizedBook);
  const folderPath = getFolderPath(username, foldername);
  const newBookPath = path.join(folderPath, sanitizedBook);

  try {
    if (!(await isBook(bookPath))) {
      throw new Error(`"${bookname}" is not a book`);
    }
    if (!(await isFolder(folderPath))) {
      throw new Error(`"${foldername}" is not a folder`);
    }

    try {
      await fs.access(newBookPath);
      throw new Error(`A book with name "${bookname}" already exists in folder "${foldername}"`);
    } catch (error) {
      if (error.message.includes('already exists')) throw error;
    }

    await fs.rename(bookPath, newBookPath);
    return { success: true, book: sanitizedBook, folder: sanitizedFolder };
  } catch (error) {
    throw new Error(`Failed to move book to folder: ${error.message}`);
  }
}

/**
 * Move a book out of a folder to root
 */
async function moveBookFromFolder(username, bookname, foldername) {
  const sanitizedBook = sanitizeBookName(bookname);
  const folderPath = getFolderPath(username, foldername);
  const bookInFolderPath = path.join(folderPath, sanitizedBook);
  const rootBookPath = path.join(STORAGE_PATH_REF, username, sanitizedBook);

  try {
    if (!(await isBook(bookInFolderPath))) {
      throw new Error(`"${bookname}" is not found in folder "${foldername}"`);
    }

    try {
      await fs.access(rootBookPath);
      throw new Error(`A book with name "${bookname}" already exists at root`);
    } catch (error) {
      if (error.message.includes('already exists')) throw error;
    }

    await fs.rename(bookInFolderPath, rootBookPath);
    return { success: true, book: sanitizedBook };
  } catch (error) {
    throw new Error(`Failed to move book from folder: ${error.message}`);
  }
}

/**
 * Get all books inside a folder
 */
async function getFolderBooks(username, foldername) {
  const sanitizedFolder = sanitizeBookName(foldername);
  const folderPath = getFolderPath(username, foldername);

  try {
    if (!(await isFolder(folderPath))) {
      throw new Error(`"${foldername}" is not a folder`);
    }

    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const books = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const bookPath = path.join(folderPath, entry.name);
        const contentPath = path.join(bookPath, 'content.md');

        try {
          const stats = await fs.stat(contentPath);

          let coverUrl = null;
          let isDefaultCover = false;
          for (const ext of ['jpg', 'png', 'jpeg', 'webp', 'avif']) {
            const coverPath = path.join(bookPath, `cover.${ext}`);
            try {
              await fs.access(coverPath);
              coverUrl = `/api/folders/${sanitizedFolder}/books/${entry.name}/cover.${ext}`;
              isDefaultCover = (ext === 'avif' || ext === 'webp');
              break;
            } catch {
              // Continue
            }
          }

          const title = entry.name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          books.push({
            name: entry.name,
            title,
            coverUrl,
            isDefaultCover,
            updatedAt: stats.mtime,
            folder: sanitizedFolder
          });
        } catch {
          // Skip
        }
      }
    }

    books.sort((a, b) => b.updatedAt - a.updatedAt);
    return books;
  } catch (error) {
    console.error('Error reading folder books:', error);
    throw error;
  }
}

// Update exports with folder functions
module.exports = {
  sanitizeBookName,
  getUserBooks,
  getBookContent,
  saveBookContent,
  deleteBook,
  renameBook,
  createBook,
  saveBookCover,
  getUserFolders,
  createFolder,
  deleteFolder,
  renameFolder,
  moveBookToFolder,
  moveBookFromFolder,
  getFolderBooks,
  getFolderPath,
  isFolder,
  isBook
};

