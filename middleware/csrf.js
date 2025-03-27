const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Cookie parser middleware is required before csrf
const cookieParserMiddleware = cookieParser();

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
});

// CSRF token endpoint middleware
const csrfTokenEndpoint = (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
};

module.exports = {
    cookieParserMiddleware,
    csrfProtection,
    csrfTokenEndpoint
}; 