/**
 * Manager for user-socket associations
 */
class UserSocketManager {
    constructor() {
        this.userSockets = new Map();
    }

    /**
     * Add a socket connection for a user
     * @param {string} userId - User ID
     * @param {string} socketId - Socket ID
     */
    addSocket(userId, socketId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(socketId);
    }

    /**
     * Remove a socket connection for a user
     * @param {string} userId - User ID
     * @param {string} socketId - Socket ID
     */
    removeSocket(userId, socketId) {
        if (this.userSockets.has(userId)) {
            this.userSockets.get(userId).delete(socketId);
            if (this.userSockets.get(userId).size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }

    /**
     * Get all socket IDs for a user
     * @param {string} userId - User ID
     * @returns {Set<string>} Set of socket IDs
     */
    getUserSockets(userId) {
        return this.userSockets.get(userId) || new Set();
    }

    /**
     * Check if a user has any active connections
     * @param {string} userId - User ID
     * @returns {boolean} Whether the user has active connections
     */
    isUserConnected(userId) {
        return this.userSockets.has(userId);
    }
}

module.exports = new UserSocketManager(); 