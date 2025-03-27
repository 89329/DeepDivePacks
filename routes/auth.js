const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

/**
 * Validation rules for user registration.
 * Enforces username format, email validity, and password strength.
 * @type {import('express-validator').ValidationChain[]}
 */
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation rules for user login.
 * Validates input as email or username and ensures password is not empty.
 * @type {import('express-validator').ValidationChain[]}
 */
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Username or email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Creates and configures authentication routes.
 * @param {Object} db - Database interface object
 * @param {Function} db.all - Function to execute SELECT queries
 * @param {Function} db.run - Function to execute INSERT/UPDATE/DELETE queries
 * @returns {express.Router} Configured Express router with auth routes
 */
module.exports = (db) => {
    /**
     * POST /api/check-username
     * Checks if a username is available (not already taken).
     * @route POST /api/check-username
     * @param {Object} req.body - Request body
     * @param {string} req.body.username - Username to check
     * @returns {Object} JSON response with availability status
     */
    router.post('/check-username', async (req, res) => {
        try {
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }

            const existingUser = await db.all(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            res.json({ available: existingUser.length === 0 });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    /**
     * POST /api/check-email
     * Checks if an email address is available (not already registered).
     * @route POST /api/check-email
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - Email to check
     * @returns {Object} JSON response with availability status
     */
    router.post('/check-email', async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            const existingUser = await db.all(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            res.json({ available: existingUser.length === 0 });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    /**
     * POST /api/register
     * Registers a new user with validation and password hashing.
     * @route POST /api/register
     * @param {Object} req.body - Request body
     * @param {string} req.body.username - User's desired username
     * @param {string} req.body.email - User's email address
     * @param {string} req.body.password - User's password
     * @returns {Object} JSON response with success message or error
     */
    router.post('/register', registerValidation, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, email, password } = req.body;

            // Check if user already exists with more specific error messages
            const existingUserByEmail = await db.all(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            const existingUserByUsername = await db.all(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            if (existingUserByEmail.length > 0 && existingUserByUsername.length > 0) {
                return res.status(400).json({ error: 'Both username and email are already taken' });
            } else if (existingUserByEmail.length > 0) {
                return res.status(400).json({ error: 'Email address is already registered' });
            } else if (existingUserByUsername.length > 0) {
                return res.status(400).json({ error: 'Username is already taken' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            await db.run(
                'INSERT INTO users (username, email, password, currency) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, 1000]
            );

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    /**
     * POST /api/login
     * Authenticates a user with username or email and creates a session.
     * @route POST /api/login
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - User's email address or username
     * @param {string} req.body.password - User's password
     * @returns {Object} JSON response with user data or error
     */
    router.post('/login', loginValidation, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;
            const isEmail = email.includes('@');

            // Find user by email or username
            const users = await db.all(
                isEmail
                    ? 'SELECT * FROM users WHERE email = ?'
                    : 'SELECT * FROM users WHERE username = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = users[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Set session
            req.session.userId = user.user_Id;
            req.session.username = user.username;

            res.json({
                message: 'Login successful',
                user: {
                    id: user.user_Id,
                    username: user.username,
                    email: user.email,
                    currency: user.currency
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}; 