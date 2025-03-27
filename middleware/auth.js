/**
 * Authentication middleware to protect routes that require user authentication.
 * Checks if a user is logged in by verifying the presence of userId in the session.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 * @throws {Object} Returns 401 status with error message if authentication fails
 */
const authenticateUser = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

module.exports = authenticateUser; 