/**
 * Socket.IO authentication middleware
 * @param {import('socket.io').Socket} socket - Socket instance
 * @param {Function} next - Next function
 */
const authMiddleware = (socket, next) => {
    const session = socket.request.session;

    // Check if user is authenticated
    if (!session || !session.userId) {
        console.log('Unauthorized socket connection attempted');
        return next(new Error('Authentication required'));
    }

    try {
        // Attach user data to socket
        socket.userId = session.userId;
        socket.username = session.username;
        console.log(`Authenticated socket connection for user: ${socket.username}`);
        next();
    } catch (error) {
        console.error('Error in socket authentication:', error);
        next(new Error('Authentication failed'));
    }
};

/**
 * Wraps Express middleware for Socket.IO
 * @param {import('express').RequestHandler} middleware - Express middleware to wrap
 * @returns {(socket: import('socket.io').Socket, next: Function) => void} Socket.IO middleware
 */
const wrapMiddleware = (middleware) => (socket, next) => {
    middleware(socket.request, {}, next);
};

module.exports = { authMiddleware, wrapMiddleware }; 