import { useState } from 'react';

function FolderCard({ folder, editMode, onEdit, onDelete, onClick, onDrop }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleCardClick = () => {
        if (!editMode) {
            onClick(folder.name);
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        const newName = prompt('Enter new folder name:', folder.title);
        if (newName && newName.trim()) {
            onEdit(folder.name, newName.trim());
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        const bookCount = folder.bookCount || 0;
        const message = bookCount > 0
            ? `Are you sure you want to delete "${folder.title}"? This will also delete ${bookCount} book(s) inside.`
            : `Are you sure you want to delete "${folder.title}"?`;

        if (confirm(message)) {
            onDelete(folder.name);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        if (editMode) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (editMode) {
            const bookName = e.dataTransfer.getData('text/book-name');
            const fromFolder = e.dataTransfer.getData('text/from-folder');

            if (bookName && onDrop) {
                onDrop(bookName, folder.name, fromFolder);
            }
        }
    };

    return (
        <div
            className={`folder-card ${isDragOver ? 'drop-target' : ''}`}
            onClick={handleCardClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="folder-icon-wrapper">
                <div className="folder-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                    </svg>
                </div>
                <span className="folder-book-count">{folder.bookCount || 0}</span>
            </div>
            <div className="folder-info">
                <h3 className="folder-title">{folder.title}</h3>
                {editMode && (
                    <div className="folder-actions">
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

export default FolderCard;
