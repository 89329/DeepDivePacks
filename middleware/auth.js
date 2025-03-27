/**
 * Authentication middleware functions for protecting routes.
 * @module middleware/auth
 */

/**
 * Middleware for API routes that require authentication.
 * Returns 401 status if user is not authenticated.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
const authenticateApiUser = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

/**
 * Middleware for page routes that require authentication.
 * Redirects to login page if user is not authenticated.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
const authenticatePageUser = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    next();
};

module.exports = { authenticateApiUser, authenticatePageUser }; 