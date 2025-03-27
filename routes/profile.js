const express = require('express');
const router = express.Router();
const { authenticateApiUser } = require('../middleware/auth');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const multer = require('multer');

// Setup multer storage for profile images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store all profile images in a single directory
        const dir = path.join(__dirname, '..', 'public', 'profile', 'images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const username = req.session.username;
        const timestamp = Date.now();
        const fileExt = path.extname(file.originalname).toLowerCase();
        // Use timestamp to ensure unique filenames
        cb(null, `${username}_${timestamp}${fileExt}`);
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

/**
 * Creates and configures profile routes.
 * @param {Object} db - Database interface object
 * @param {Function} db.all - Function to execute SELECT queries
 * @param {Function} db.run - Function to execute INSERT/UPDATE/DELETE queries
 * @returns {express.Router} Configured Express router with profile routes
 */
module.exports = (db) => {
    // Public route - Get user profile
    router.get('/:username', async (req, res) => {
        const username = req.params.username;
        const isAuthenticated = !!req.session.userId;

        try {
            // Query user data from SQLite
            const user = await db.all(
                'SELECT user_Id, username, email, created_at, currency, is_public, profile_image_url FROM users WHERE username = ?',
                [username]
            );

            if (!user || user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check visibility permissions
            const isOwner = isAuthenticated && req.session.userId === user[0].user_Id;
            if (!user[0].is_public && !isOwner) {
                return res.status(403).json({ message: 'This profile is private' });
            }

            // Send user data (excluding sensitive information)
            const userData = {
                username: user[0].username,
                email: isOwner ? user[0].email : undefined,
                created_at: user[0].created_at,
                currency: user[0].currency,
                is_public: user[0].is_public,
                profile_image_url: user[0].profile_image_url
            };

            res.json(userData);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Protected route - Update profile visibility
    router.post('/update-visibility', authenticateApiUser, async (req, res) => {
        const userId = req.session.userId;
        const { is_public } = req.body;

        if (typeof is_public !== 'boolean') {
            return res.status(400).json({ message: 'Invalid visibility setting' });
        }

        try {
            await db.run(
                'UPDATE users SET is_public = ? WHERE user_Id = ?',
                [is_public, userId]
            );

            res.json({ message: 'Profile visibility updated successfully' });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Protected route - Upload profile image
    router.post('/upload-image', authenticateApiUser, upload.single('profile_image'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const userId = req.session.userId;
            const username = req.session.username;

            // Generate the URL to the uploaded image
            const imageUrl = `/profile/images/${path.basename(req.file.path)}`;

            // Update the profile_image_url in the database
            await db.run(
                'UPDATE users SET profile_image_url = ? WHERE user_Id = ?',
                [imageUrl, userId]
            );

            res.json({
                message: 'Profile image uploaded successfully',
                imageUrl: imageUrl
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ message: 'Failed to upload image' });
        }
    });

    // Protected route - Update user profile
    router.post('/update', authenticateApiUser, async (req, res) => {
        const userId = req.session.userId;
        const {
            username,
            email,
            profile_image_url,
            is_public,
            current_password,
            new_password
        } = req.body;

        if (!current_password) {
            return res.status(400).json({ message: 'Current password is required to update profile' });
        }

        try {
            // Verify current password first
            const users = await db.all(
                'SELECT password, username FROM users WHERE user_Id = ?',
                [userId]
            );

            if (!users || users.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPasswordValid = await bcrypt.compare(current_password, users[0].password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            // Get the old username for potential directory renaming
            const oldUsername = users[0].username;

            // Check if username is already taken (if changing)
            if (username && username !== oldUsername) {
                const existingUser = await db.all(
                    'SELECT username FROM users WHERE username = ? AND user_Id != ?',
                    [username, userId]
                );

                if (existingUser && existingUser.length > 0) {
                    return res.status(409).json({ message: 'Username is already taken' });
                }

                // Update profile image URL if it's a local path (but not for external URLs)
                let updatedProfileImageUrl = profile_image_url;
                if (profile_image_url &&
                    profile_image_url.startsWith('/profile/') &&
                    profile_image_url.includes(`/profile/${oldUsername}/`)) {
                    updatedProfileImageUrl = profile_image_url.replace(
                        `/profile/${oldUsername}/`,
                        `/profile/${username}/`
                    );
                }

                // Add profile_image_url to the update if it was modified
                if (updatedProfileImageUrl !== profile_image_url) {
                    updateFields.push('profile_image_url = ?');
                    queryParams.push(updatedProfileImageUrl);
                }
            }

            // Validate profile image URL if provided
            let finalProfileImageUrl = profile_image_url;
            if (profile_image_url && !profile_image_url.startsWith('/profile/')) {
                // Check if it's a valid URL
                try {
                    new URL(profile_image_url);
                    // URL is valid, keep as is
                } catch (error) {
                    // Not a valid URL, reject
                    return res.status(400).json({ message: 'Invalid profile image URL format' });
                }
            }

            // Build update query
            let updateFields = [];
            let queryParams = [];

            if (username) {
                updateFields.push('username = ?');
                queryParams.push(username);
            }

            if (email) {
                updateFields.push('email = ?');
                queryParams.push(email);
            }

            if (finalProfileImageUrl !== undefined) {
                updateFields.push('profile_image_url = ?');
                queryParams.push(finalProfileImageUrl || null); // Allow clearing the URL
            }

            if (typeof is_public === 'boolean') {
                updateFields.push('is_public = ?');
                queryParams.push(is_public);
            }

            // Handle password update if provided
            if (new_password) {
                const hashedPassword = await bcrypt.hash(new_password, 10);
                updateFields.push('password = ?');
                queryParams.push(hashedPassword);
            }

            // Add user ID to query params
            queryParams.push(userId);

            // Execute update
            if (updateFields.length > 0) {
                const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_Id = ?`;
                await db.run(updateQuery, queryParams);

                // Update session if username changed
                if (username) {
                    req.session.username = username;
                }

                res.json({ message: 'Profile updated successfully' });
            } else {
                res.json({ message: 'No changes to update' });
            }
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Public route - Get user's card collection
    router.get('/:username/cards', async (req, res) => {
        const username = req.params.username;
        const isAuthenticated = !!req.session.userId;

        try {
            // First get the user to check visibility
            const users = await db.all(
                'SELECT user_Id, is_public FROM users WHERE username = ?',
                [username]
            );

            if (!users || users.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const user = users[0];

            // Check visibility permissions
            const isOwner = isAuthenticated && req.session.userId === user.user_Id;
            if (!user.is_public && !isOwner) {
                return res.status(403).json({ message: 'This profile is private' });
            }

            // For now, return empty array as cards feature isn't implemented yet
            res.json([]);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    return router;
}; 