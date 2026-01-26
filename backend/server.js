const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' })); // Allow larger markdown files
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for development
if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: 'http://localhost:5173', // Vite dev server
      credentials: true
    })
  );
}

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Import routes
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const uploadRoutes = require('./routes/upload');

// Mount API routes
app.use('/api', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/upload', uploadRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
