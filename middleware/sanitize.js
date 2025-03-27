/**
 * Sanitizes a single input value by removing potentially dangerous characters.
 * Prevents HTML injection, SQL injection, and other common attack vectors.
 * 
 * @param {any} input - The input value to sanitize
 * @returns {any} The sanitized input value
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .replace(/['"]/g, '') // Remove quotes
        .replace(/[;]/g, ''); // Remove semicolons to prevent SQL injection
};

/**
 * Middleware that sanitizes all request body parameters.
 * Applies sanitization to each field in the request body to prevent malicious input.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitizeInput(req.body[key]);
        });
    }
    next();
};

module.exports = sanitizeMiddleware; 