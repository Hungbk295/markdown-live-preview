/**
 * Authentication middleware
 * Checks if user has a valid session before allowing access to protected routes
 */

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
}

module.exports = { requireAuth };
