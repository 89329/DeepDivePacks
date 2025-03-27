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
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation rules for user login.
 * Validates email format and ensures password is not empty.
 * @type {import('express-validator').ValidationChain[]}
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
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

            // Check if user already exists
            const existingUser = await db.all(
                'SELECT * FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
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
     * Authenticates a user and creates a session.
     * @route POST /api/login
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - User's email address
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

            // Find user
            const users = await db.all(
                'SELECT * FROM users WHERE email = ?',
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