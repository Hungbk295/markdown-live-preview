import { useNavigate } from 'react-router-dom';

function BookCard({ book, editMode, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!editMode) {
      navigate(`/editor/${book.name}`);
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

  // Generate default cover if no cover image
  const renderCover = () => {
    if (book.coverUrl) {
      return (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="book-cover-image"
        />
      );
    } else {
      // Default grey cover with title
      return (
        <div className="book-cover-default">
          <span className="book-cover-title">{book.title}</span>
        </div>
      );
    }
  };

  return (
    <div className="book-card" onClick={handleCardClick}>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCard;
