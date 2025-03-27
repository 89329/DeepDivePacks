require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Import middleware
const sessionConfig = require('./middleware/session');
const authenticateUser = require('./middleware/auth');
const { cookieParserMiddleware, csrfProtection, csrfTokenEndpoint } = require('./middleware/csrf');
const sanitizeMiddleware = require('./middleware/sanitize');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Ensure the database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// Database connection
const dbPath = path.join(dbDir, 'deepdivepacks.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Initialize database schema
        const schema = fs.readFileSync(path.join(dbDir, 'database.sql'), 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing database schema:', err);
            } else {
                console.log('Database schema initialized');
            }
        });
    }
});

// Promisify database queries
const dbAll = (sql, params) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

const dbRun = (sql, params) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

// Create database interface object
const dbInterface = {
    all: dbAll,
    run: dbRun
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(cookieParserMiddleware);
app.use(sessionConfig);
app.use(csrfProtection);
app.use(sanitizeMiddleware);

// Session check endpoint
app.get('/api/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// CSRF token endpoint
app.get('/api/csrf-token', csrfTokenEndpoint);

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error during logout' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logged out successfully' });
    });
});

// Routes
const authRoutes = require('./routes/auth')(dbInterface);
app.use('/api', authRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Cleanup on server shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 