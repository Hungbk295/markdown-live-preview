import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BookCard from '../components/BookCard';
import api from '../services/api';
import '../styles/library.css';

function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (bookName, newName) => {
    try {
      await api.put(`/books/${bookName}/rename`, { newName });
      // Refresh books list
      await fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to rename book');
    }
  };

  const handleDelete = async (bookName) => {
    try {
      await api.delete(`/books/${bookName}`);
      // Refresh books list
      await fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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

      <div className="library-controls">
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary"
        >
          Upload New Book
        </button>
        <button
          onClick={() => setEditMode(!editMode)}
          className={editMode ? 'btn-secondary active' : 'btn-secondary'}
        >
          {editMode ? 'Done Editing' : 'Update Books'}
        </button>
      </div>

      <div className="library-content">
        {loading ? (
          <div className="loading">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <p>No books yet. Upload your first book to get started!</p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary"
            >
              Upload Book
            </button>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard
                key={book.name}
                book={book}
                editMode={editMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
