const userManager = require('./userManager');

/**
 * Initialize Socket.IO event handlers
 * @param {import('socket.io').Socket} socket - Socket instance
 */
const handleSocket = (socket) => {
    // At this point, only authenticated users can reach here
    console.log(`User connected - ID: ${socket.userId}, Username: ${socket.username}, Socket: ${socket.id}`);

    // Store socket association
    userManager.addSocket(socket.userId, socket.id);

    // Emit welcome event to authenticated user
    socket.emit('authenticated', {
        message: `Welcome ${socket.username}!`,
        userId: socket.userId
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected - ID: ${socket.userId}, Username: ${socket.username}, Socket: ${socket.id}`);
        userManager.removeSocket(socket.userId, socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.username}:`, error);
    });
};

module.exports = handleSocket; 