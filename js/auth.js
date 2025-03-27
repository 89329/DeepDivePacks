/** @type {import('socket.io-client').Socket} */
const socket = io();

/**
 * Fetches a CSRF token from the server for secure form submissions.
 * @async
 * @returns {Promise<string>} The CSRF token
 * @throws {Error} If the token fetch fails
 */
async function getCsrfToken() {
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        throw error;
    }
}

/**
 * Checks the current user's authentication status.
 * Handles redirects based on authentication state and current page.
 * @async
 * @returns {Promise<Object|null>} User object if authenticated, null otherwise
 * @property {string} user.username - The username of the authenticated user
 * @property {string} user.id - The unique identifier of the authenticated user
 */
async function checkSession() {
    try {
        const response = await fetch('/api/check-session');
        const data = await response.json();

        if (data.isAuthenticated) {
            // Redirect to home if already logged in
            if (window.location.pathname === '/login.html' || window.location.pathname === '/register.html') {
                window.location.href = '/';
            }
            return data.user;
        } else {
            // Clear any stored user data
            localStorage.removeItem('user');
            // Redirect to login if on a protected page
            if (window.location.pathname !== '/login.html' &&
                window.location.pathname !== '/register.html' &&
                window.location.pathname !== '/') {
                window.location.href = '/login.html';
            }
            return null;
        }
    } catch (error) {
        console.error('Error checking session:', error);
        return null;
    }
}

/**
 * Logs out the current user and redirects to the login page.
 * Clears local storage and invalidates the server session.
 * @async
 * @returns {Promise<void>}
 */
async function logout() {
    try {
        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken
            }
        });

        if (response.ok) {
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        } else {
            const data = await response.json();
            await customPopup.show(data.error || 'Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        await customPopup.show('An error occurred during logout');
    }
}

// Handle login form submission
const loginForm = document.querySelector('.login-form');
if (loginForm) {
    /**
     * Login form submission handler.
     * Authenticates user credentials and manages the login process.
     * @param {SubmitEvent} e - The form submission event
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store minimal user info in localStorage for UI purposes only
                localStorage.setItem('user', JSON.stringify({
                    username: data.user.username,
                    id: data.user.id
                }));
                window.location.href = '/';
            } else {
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.msg).join('\n');
                    await customPopup.show(errorMessages);
                } else {
                    await customPopup.show(data.error || 'Login failed');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            await customPopup.show('An error occurred during login');
        }
    });
}

// Handle registration form submission
const registerForm = document.querySelector('.register-form');
if (registerForm) {
    /**
     * Registration form submission handler.
     * Creates new user accounts and handles the registration process.
     * @param {SubmitEvent} e - The form submission event
     */
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            await customPopup.show('Passwords do not match');
            return;
        }

        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                await customPopup.show('Registration successful! Please login.');
                window.location.href = '/login.html';
            } else {
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.msg).join('\n');
                    await customPopup.show(errorMessages);
                } else {
                    await customPopup.show(data.error || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            await customPopup.show('An error occurred during registration');
        }
    });
}

// Check session status on page load
document.addEventListener('DOMContentLoaded', checkSession); 