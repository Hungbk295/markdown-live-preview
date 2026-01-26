const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load users from JSON file
const usersPath = path.join(__dirname, '../data/users.json');

function getUsers() {
  try {
    const data = fs.readFileSync(usersPath, 'utf-8');
    const json = JSON.parse(data);
    return json.users || [];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

/**
 * POST /api/login
 * Login with username and password
 * Creates session on success
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Username and password are required'
    });
  }

  // Find user in users array
  const users = getUsers();
  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid username or password'
    });
  }

  // Create session
  req.session.user = {
    username: user.username
  };

  res.json({
    success: true,
    username: user.username
  });
});

/**
 * POST /api/logout
 * Destroy current session
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({
        error: 'Server Error',
        message: 'Failed to logout'
      });
    }

    res.json({ success: true });
  });
});

/**
 * GET /api/session
 * Check if user is authenticated
 * Returns user info if session exists, 401 otherwise
 */
router.get('/session', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      authenticated: false
    });
  }

  res.json({
    authenticated: true,
    username: req.session.user.username
  });
});

module.exports = router;
