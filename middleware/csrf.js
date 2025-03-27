const csrf = require('csurf');
const cookieParser = require('cookie-parser');

/**
 * Cookie parser middleware required for CSRF protection.
 * Must be applied before CSRF middleware.
 * @type {import('express').RequestHandler}
 */
const cookieParserMiddleware = cookieParser();

/**
 * CSRF protection middleware configuration.
 * Sets up CSRF token validation with secure cookie settings.
 * @type {import('express').RequestHandler}
 */
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
});

/**
 * Endpoint middleware that provides CSRF token to the client.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
const csrfTokenEndpoint = (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
};

module.exports = {
    cookieParserMiddleware,
    csrfProtection,
    csrfTokenEndpoint
}; 