const { Server } = require('socket.io');
const { authMiddleware, wrapMiddleware } = require('./middleware');
const handleSocket = require('./handler');

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} server - HTTP server instance
 * @param {import('express').RequestHandler} sessionMiddleware - Express session middleware
 * @returns {import('socket.io').Server} Socket.IO server instance
 */
const initializeSocket = (server, sessionMiddleware) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }
    });

    // Apply session middleware
    io.use(wrapMiddleware(sessionMiddleware));

    // Apply authentication middleware
    io.use(authMiddleware);

    // Handle socket connections
    io.on('connection', handleSocket);

    return io;
};

module.exports = initializeSocket; 