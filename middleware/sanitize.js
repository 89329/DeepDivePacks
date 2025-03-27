const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .replace(/['"]/g, '') // Remove quotes
        .replace(/[;]/g, ''); // Remove semicolons to prevent SQL injection
};

const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitizeInput(req.body[key]);
        });
    }
    next();
};

module.exports = sanitizeMiddleware; 