// Socket.io connection
const socket = io();

// Handle login form submission
const loginForm = document.querySelector('.login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
                await customPopup.show(data.error || 'Login failed');
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
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                await customPopup.show('Registration successful! Please login.');
                window.location.href = '/login.html';
            } else {
                await customPopup.show(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            await customPopup.show('An error occurred during registration');
        }
    });
} 