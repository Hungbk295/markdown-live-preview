const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3003;

// Trust proxy - IMPORTANT for HTTPS behind nginx/apache
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' })); // Allow larger markdown files
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for development
if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: 'http://localhost:5174', // Vite dev server
      credentials: true
    })
  );
}

// Session configuration with file store for persistence
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, 'sessions'), // Store sessions in backend/sessions
      ttl: 86400, // 24 hours in seconds
      retries: 0
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS required in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    proxy: true // Trust the reverse proxy
  })
);

// Import routes
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const uploadRoutes = require('./routes/upload');
const foldersRoutes = require('./routes/folders');

// Mount API routes
app.use('/api', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/folders', foldersRoutes);

// Serve static files from dist in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(
      'Stop the other process (or change PORT) and retry. ' +
      'Tip: `lsof -nP -iTCP:3003 -sTCP:LISTEN` then `kill <PID>`.'
    );
    process.exit(1);
  }
  throw err;
});

const shutdown = (signal) => {
  server.close(() => process.exit(0));
  // Fallback: force exit if server doesn't close promptly
  setTimeout(() => process.exit(1), 5000).unref();
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
// Nodemon restart signal
process.once('SIGUSR2', () => server.close(() => process.kill(process.pid, 'SIGUSR2')));
