// Socket.io connection
const socket = io();

// Function to get CSRF token
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

// Handle login form submission
const loginForm = document.querySelector('.login-form');
if (loginForm) {
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
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to game page
                window.location.href = '/game.html';
            } else {
                if (data.errors) {
                    // Display validation errors
                    const errorMessages = data.errors.map(err => err.msg).join('\n');
                    alert(errorMessages);
                } else {
                    alert(data.error || 'Login failed');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    });
}

// Handle registration form submission
const registerForm = document.querySelector('.register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
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
                alert('Registration successful! Please login.');
                window.location.href = '/login.html';
            } else {
                if (data.errors) {
                    // Display validation errors
                    const errorMessages = data.errors.map(err => err.msg).join('\n');
                    alert(errorMessages);
                } else {
                    alert(data.error || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration');
        }
    });
} 