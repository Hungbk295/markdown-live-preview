import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import UploadPage from './pages/UploadPage';
import EditorPage from './pages/EditorPage';
import PublicMarkdownPreview from './pages/PublicMarkdownPreview';
import PublicSharesListPage from './pages/PublicSharesListPage';
import DrawListPage from './pages/DrawListPage';
import DrawViewPage from './pages/DrawViewPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            {/* Public markdown preview - no auth required */}
            <Route path="/markdownpreview" element={<PublicMarkdownPreview />} />
            <Route path="/markdownpreview/all" element={<PublicSharesListPage />} />
            <Route path="/markdownpreview/:shareId" element={<PublicMarkdownPreview />} />
            {/* Excalidraw drawings - no auth required */}
            <Route path="/draw/all" element={<DrawListPage />} />
            <Route path="/draw/:drawId" element={<DrawViewPage />} />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:bookname"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            {/* Route for books inside folders */}
            <Route
              path="/editor/:folder/:bookname"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
