import { useNavigate } from 'react-router-dom';

function BookCard({ book, editMode, onEdit, onDelete, onMoveToRoot, currentFolder }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!editMode) {
      // If book is in a folder, use folder path
      if (book.folder) {
        navigate(`/editor/${book.folder}/${book.name}`);
      } else {
        navigate(`/editor/${book.name}`);
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    const newName = prompt('Enter new book name:', book.title);
    if (newName && newName.trim()) {
      onEdit(book.name, newName.trim());
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      onDelete(book.name);
    }
  };

  const handleMoveToRoot = (e) => {
    e.stopPropagation();
    if (onMoveToRoot && currentFolder) {
      onMoveToRoot(book.name, currentFolder);
    }
  };

  // Drag handlers
  const handleDragStart = (e) => {
    if (editMode) {
      e.dataTransfer.setData('text/book-name', book.name);
      e.dataTransfer.setData('text/from-folder', currentFolder || '');
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.classList.add('dragging');
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  // Render cover with title overlay
  const renderCover = () => {
    if (book.coverUrl) {
      return (
        <div className="book-cover-wrapper">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="book-cover-image"
          />
          {book.isDefaultCover && (
            <div className="book-cover-overlay">
              <span className="book-cover-title-on-image">{book.title}</span>
            </div>
          )}
        </div>
      );
    } else {
      // Default grey cover with title (legacy fallback)
      return (
        <div className="book-cover-default">
          <span className="book-cover-title">{book.title}</span>
        </div>
      );
    }
  };

  return (
    <div
      className="book-card"
      onClick={handleCardClick}
      draggable={editMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="book-cover">{renderCover()}</div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        {editMode && (
          <div className="book-actions">
            <button onClick={handleEdit} className="btn-edit">
              Edit
            </button>
            <button onClick={handleDelete} className="btn-delete">
              Delete
            </button>
            {currentFolder && onMoveToRoot && (
              <button onClick={handleMoveToRoot} className="btn-move-root">
                ↩ Root
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCard;

