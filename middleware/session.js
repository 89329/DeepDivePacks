const session = require('express-session');

/**
 * Express session middleware configuration.
 * Configures secure session handling with the following features:
 * - Secure cookie settings in production
 * - Strict same-site policy
 * - 24-hour session duration
 * - HTTP-only cookies to prevent XSS
 * 
 * @type {import('express').RequestHandler}
 */
const sessionConfig = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true // Prevents JavaScript access to the cookie
    }
});

module.exports = sessionConfig; 