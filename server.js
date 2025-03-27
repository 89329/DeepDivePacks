require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');
const csrf = require('csurf');
const { body, validationResult } = require('express-validator');

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
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
}));

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Input sanitization middleware
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .replace(/['"]/g, '') // Remove quotes
        .replace(/[;]/g, ''); // Remove semicolons to prevent SQL injection
};

app.use((req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitizeInput(req.body[key]);
        });
    }
    next();
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
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