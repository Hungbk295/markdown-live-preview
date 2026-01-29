import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BookCard from '../components/BookCard';
import FolderCard from '../components/FolderCard';
import api from '../services/api';
import '../styles/library.css';

function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentFolder) {
      fetchFolderBooks(currentFolder);
    } else {
      fetchBooksAndFolders();
    }
  }, [currentFolder]);

  const fetchBooksAndFolders = async () => {
    try {
      setLoading(true);
      const [booksRes, foldersRes] = await Promise.all([
        api.get('/books'),
        api.get('/folders')
      ]);
      setBooks(booksRes.data);
      setFolders(foldersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderBooks = async (folderName) => {
    try {
      setLoading(true);
      const response = await api.get(`/folders/${folderName}/books`);
      setBooks(response.data);
      setFolders([]); // No folders inside folders
    } catch (error) {
      console.error('Error fetching folder books:', error);
    } finally {
      setLoading(false);
    }
  };

  // Book handlers
  const handleEditBook = async (bookName, newName) => {
    try {
      await api.put(`/books/${bookName}/rename`, { newName });
      currentFolder ? fetchFolderBooks(currentFolder) : fetchBooksAndFolders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to rename book');
    }
  };

  const handleDeleteBook = async (bookName) => {
    try {
      await api.delete(`/books/${bookName}`);
      currentFolder ? fetchFolderBooks(currentFolder) : fetchBooksAndFolders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  // Folder handlers
  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name && name.trim()) {
      try {
        await api.post('/folders', { name: name.trim() });
        fetchBooksAndFolders();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to create folder');
      }
    }
  };

  const handleEditFolder = async (folderName, newName) => {
    try {
      await api.put(`/folders/${folderName}/rename`, { newName });
      fetchBooksAndFolders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (folderName) => {
    try {
      await api.delete(`/folders/${folderName}`);
      fetchBooksAndFolders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete folder');
    }
  };

  const handleFolderClick = (folderName) => {
    setCurrentFolder(folderName);
  };

  // Drag and drop handlers
  const handleDropOnFolder = async (bookName, folderName, fromFolder) => {
    try {
      if (fromFolder) {
        // Moving from one folder - first remove from old folder
        await api.put(`/folders/${fromFolder}/remove-book`, { bookName });
      }
      // Then add to new folder
      await api.put(`/folders/${folderName}/move-book`, { bookName });
      currentFolder ? fetchFolderBooks(currentFolder) : fetchBooksAndFolders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to move book');
    }
  };

  const handleMoveToRoot = async (bookName, fromFolder) => {
    try {
      await api.put(`/folders/${fromFolder}/remove-book`, { bookName });
      setCurrentFolder(null);
      fetchBooksAndFolders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to move book to root');
    }
  };

  // Drop zone for breadcrumb (moving to root)
  const handleDropOnRoot = async (e) => {
    e.preventDefault();
    const bookName = e.dataTransfer.getData('text/book-name');
    const fromFolder = e.dataTransfer.getData('text/from-folder');

    if (bookName && fromFolder) {
      await handleMoveToRoot(bookName, fromFolder);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isEmpty = books.length === 0 && folders.length === 0;

  return (
    <div className="library-page">
      <header className="library-header">
        <div className="header-left">
          <h1>My Book Library</h1>
          <p className="welcome-text">Welcome, {user}!</p>
        </div>
        <div className="header-right">
          {/* Theme Selector */}
          <div className="theme-selector">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="btn-theme"
            >
              {availableThemes[theme].icon} {availableThemes[theme].name}
            </button>
            {showThemeMenu && (
              <div className="theme-menu">
                {Object.entries(availableThemes).map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      setShowThemeMenu(false);
                    }}
                    className={theme === key ? 'active' : ''}
                  >
                    {themeData.icon} {themeData.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      {currentFolder && (
        <div className="breadcrumb">
          <span
            className="breadcrumb-item breadcrumb-root"
            onClick={() => setCurrentFolder(null)}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drop-target'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('drop-target'); }}
            onDrop={(e) => { e.currentTarget.classList.remove('drop-target'); handleDropOnRoot(e); }}
          >
            📚 Library
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item breadcrumb-current">
            📁 {currentFolder.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </span>
        </div>
      )}

      <div className="library-controls">
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary"
        >
          Upload New Book
        </button>
        {!currentFolder && editMode && (
          <button
            onClick={handleCreateFolder}
            className="btn-create-folder"
          >
            + New Folder
          </button>
        )}
        <button
          onClick={() => setEditMode(!editMode)}
          className={editMode ? 'btn-secondary active' : 'btn-secondary'}
        >
          {editMode ? 'Done Editing' : 'Update Books'}
        </button>
      </div>

      <div className="library-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : isEmpty ? (
          <div className="empty-state">
            <p>{currentFolder ? 'This folder is empty.' : 'No books yet. Upload your first book to get started!'}</p>
            {!currentFolder && (
              <button
                onClick={() => navigate('/upload')}
                className="btn-primary"
              >
                Upload Book
              </button>
            )}
          </div>
        ) : (
          <div className="books-grid">
            {/* Folders first */}
            {folders.map((folder) => (
              <FolderCard
                key={folder.name}
                folder={folder}
                editMode={editMode}
                onEdit={handleEditFolder}
                onDelete={handleDeleteFolder}
                onClick={handleFolderClick}
                onDrop={handleDropOnFolder}
              />
            ))}
            {/* Then books */}
            {books.map((book) => (
              <BookCard
                key={book.name}
                book={book}
                editMode={editMode}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
                onMoveToRoot={handleMoveToRoot}
                currentFolder={currentFolder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
