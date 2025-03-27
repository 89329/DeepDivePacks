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
 * Checks if a username is available (not already taken).
 * @async
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} True if username is available, false otherwise
 */
async function checkUsernameAvailability(username) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/check-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        return data.available;
    } catch (error) {
        console.error('Error checking username:', error);
        // Default to true on error to allow form submission, server will validate
        return true;
    }
}

/**
 * Checks if an email is available (not already registered).
 * @async
 * @param {string} email - The email to check
 * @returns {Promise<boolean>} True if email is available, false otherwise
 */
async function checkEmailAvailability(email) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        return data.available;
    } catch (error) {
        console.error('Error checking email:', error);
        // Default to true on error to allow form submission, server will validate
        return true;
    }
}

/**
 * Simple debounce function to prevent excessive API calls.
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Creates and displays a form error message.
 * @param {HTMLElement} element - Element to show the error in
 * @param {string} message - Error message to display
 */
function showFormError(element, message) {
    element.textContent = `✗ ${message}`;
    element.className = 'validation-feedback invalid';
    element.style.display = 'block';
}

/**
 * Creates and displays a form success message.
 * @param {HTMLElement} element - Element to show the success message in
 * @param {string} message - Success message to display
 */
function showFormSuccess(element, message) {
    element.textContent = `✓ ${message}`;
    element.className = 'validation-feedback valid';
    element.style.display = 'block';
}

/**
 * Checks the current user's authentication status.
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
            return data.user;
        } else {
            // Clear any stored user data
            localStorage.removeItem('user');
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
            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-feedback';
            document.body.appendChild(errorMessage);
            showFormError(errorMessage, data.error || 'Logout failed');
            setTimeout(() => errorMessage.remove(), 3000);
        }
    } catch (error) {
        console.error('Error during logout:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-feedback';
        document.body.appendChild(errorMessage);
        showFormError(errorMessage, 'An error occurred during logout');
        setTimeout(() => errorMessage.remove(), 3000);
    }
}

// Handle login form submission
const loginForm = document.querySelector('.login-form');
if (loginForm) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Create feedback element for general form errors
    const loginFeedback = document.createElement('div');
    loginFeedback.id = 'login-feedback';
    loginFeedback.className = 'validation-feedback';
    loginFeedback.style.display = 'none';

    // Create individual field error elements
    const emailFeedback = document.createElement('div');
    emailFeedback.id = 'email-feedback';
    emailFeedback.className = 'validation-feedback';
    emailFeedback.style.display = 'none';

    const passwordFeedback = document.createElement('div');
    passwordFeedback.id = 'password-feedback';
    passwordFeedback.className = 'validation-feedback';
    passwordFeedback.style.display = 'none';

    // Add feedback elements to the DOM
    emailInput.parentNode.appendChild(emailFeedback);
    passwordInput.parentNode.appendChild(passwordFeedback);

    // Add general form feedback before the submit button
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.before(loginFeedback);

    /**
     * Login form submission handler.
     * Authenticates user credentials and manages the login process.
     * @param {SubmitEvent} e - The form submission event
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Reset all error messages and classes
        emailInput.classList.remove('valid-input', 'invalid-input');
        passwordInput.classList.remove('valid-input', 'invalid-input');
        loginFeedback.style.display = 'none';
        emailFeedback.style.display = 'none';
        passwordFeedback.style.display = 'none';

        // Basic validation
        let hasErrors = false;

        if (!email) {
            showFormError(emailFeedback, 'Please enter your username or email');
            emailInput.classList.add('invalid-input');
            hasErrors = true;
        }

        if (!password) {
            showFormError(passwordFeedback, 'Please enter your password');
            passwordInput.classList.add('invalid-input');
            hasErrors = true;
        }

        if (hasErrors) return;

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
                // Indicate success visually before redirect
                emailInput.classList.add('valid-input');
                passwordInput.classList.add('valid-input');

                // Show success message
                showFormSuccess(loginFeedback, 'Login successful! Redirecting...');

                // Store minimal user info in localStorage for UI purposes only
                localStorage.setItem('user', JSON.stringify({
                    username: data.user.username,
                    id: data.user.id
                }));

                // Delay redirect slightly to show success message
                setTimeout(() => {
                    window.location.href = '/';
                }, 800);
            } else {
                // Reset any valid classes
                emailInput.classList.remove('valid-input');
                passwordInput.classList.remove('valid-input');

                // Add invalid classes
                emailInput.classList.add('invalid-input');
                passwordInput.classList.add('invalid-input');

                // Display specific error messages if available
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.msg).join('\n');
                    showFormError(loginFeedback, errorMessages);
                } else {
                    showFormError(loginFeedback, data.error || 'Login failed. Please check your credentials and try again.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showFormError(loginFeedback, 'An error occurred during login. Please try again later.');
        }
    });
}

// Handle registration form submission
const registerForm = document.querySelector('.register-form');
if (registerForm) {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // Create general form feedback element
    const formFeedback = document.createElement('div');
    formFeedback.id = 'form-feedback';
    formFeedback.className = 'validation-feedback';
    formFeedback.style.display = 'none';

    // Add form feedback before submit button
    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.before(formFeedback);

    // Create password match feedback
    const passwordMatchFeedback = document.createElement('div');
    passwordMatchFeedback.id = 'password-match-feedback';
    passwordMatchFeedback.className = 'validation-feedback';
    passwordMatchFeedback.style.display = 'none';
    confirmPasswordInput.parentNode.appendChild(passwordMatchFeedback);

    // Create individual feedback elements for fields
    const createFeedbackElement = (id) => {
        const feedbackElement = document.createElement('div');
        feedbackElement.id = id;
        feedbackElement.className = 'validation-feedback';
        feedbackElement.style.display = 'none';
        return feedbackElement;
    };

    const usernameFeedback = createFeedbackElement('username-feedback');
    const emailFeedback = createFeedbackElement('email-feedback');

    // Insert field feedback elements after inputs
    usernameInput.parentNode.appendChild(usernameFeedback);
    emailInput.parentNode.appendChild(emailFeedback);

    // Add password match validation
    confirmPasswordInput.addEventListener('input', () => {
        if (passwordInput.value && confirmPasswordInput.value) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                showFormError(passwordMatchFeedback, 'Passwords do not match');
                confirmPasswordInput.classList.add('invalid-input');
                confirmPasswordInput.classList.remove('valid-input');
            } else {
                showFormSuccess(passwordMatchFeedback, 'Passwords match');
                confirmPasswordInput.classList.add('valid-input');
                confirmPasswordInput.classList.remove('invalid-input');
            }
        } else {
            passwordMatchFeedback.style.display = 'none';
            confirmPasswordInput.classList.remove('valid-input', 'invalid-input');
        }
    });

    // Debounced validation functions
    const validateUsername = debounce(async (username) => {
        if (username.length < 3) {
            usernameFeedback.style.display = 'none';
            usernameInput.classList.remove('valid-input', 'invalid-input');
            return;
        }

        usernameFeedback.style.display = 'block';
        usernameFeedback.textContent = '⟳ Checking availability...';
        usernameFeedback.className = 'validation-feedback checking';

        try {
            const available = await checkUsernameAvailability(username);
            if (available) {
                showFormSuccess(usernameFeedback, 'Username is available');
                usernameInput.classList.add('valid-input');
                usernameInput.classList.remove('invalid-input');
            } else {
                showFormError(usernameFeedback, 'Username is already taken');
                usernameInput.classList.add('invalid-input');
                usernameInput.classList.remove('valid-input');
            }
        } catch (error) {
            usernameFeedback.style.display = 'none';
            usernameInput.classList.remove('valid-input', 'invalid-input');
        }
    }, 500);

    const validateEmail = debounce(async (email) => {
        if (!email.includes('@')) {
            emailFeedback.style.display = 'none';
            emailInput.classList.remove('valid-input', 'invalid-input');
            return;
        }

        emailFeedback.style.display = 'block';
        emailFeedback.textContent = '⟳ Checking availability...';
        emailFeedback.className = 'validation-feedback checking';

        try {
            const available = await checkEmailAvailability(email);
            if (available) {
                showFormSuccess(emailFeedback, 'Email is available');
                emailInput.classList.add('valid-input');
                emailInput.classList.remove('invalid-input');
            } else {
                showFormError(emailFeedback, 'Email is already registered');
                emailInput.classList.add('invalid-input');
                emailInput.classList.remove('valid-input');
            }
        } catch (error) {
            emailFeedback.style.display = 'none';
            emailInput.classList.remove('valid-input', 'invalid-input');
        }
    }, 500);

    // Add event listeners for real-time validation
    usernameInput.addEventListener('input', (e) => validateUsername(e.target.value));
    emailInput.addEventListener('input', (e) => validateEmail(e.target.value));

    /**
     * Registration form submission handler.
     * Creates new user accounts and handles the registration process.
     * @param {SubmitEvent} e - The form submission event
     */
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Reset general form error
        formFeedback.style.display = 'none';

        // Validate password match
        if (password !== confirmPassword) {
            showFormError(passwordMatchFeedback, 'Passwords do not match');
            confirmPasswordInput.classList.add('invalid-input');
            return;
        }

        try {
            // Check if username and email are available before submitting
            const isUsernameAvailable = await checkUsernameAvailability(username);
            const isEmailAvailable = await checkEmailAvailability(email);

            let hasErrors = false;

            if (!isUsernameAvailable && !isEmailAvailable) {
                showFormError(formFeedback, 'Both username and email are already taken');
                hasErrors = true;
            } else if (!isEmailAvailable) {
                showFormError(emailFeedback, 'Email address is already registered');
                emailInput.classList.add('invalid-input');
                hasErrors = true;
            } else if (!isUsernameAvailable) {
                showFormError(usernameFeedback, 'Username is already taken');
                usernameInput.classList.add('invalid-input');
                hasErrors = true;
            }

            if (hasErrors) return;

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
                // Show success message
                showFormSuccess(formFeedback, 'Registration successful! Redirecting to login...');

                // Apply success styling to all inputs
                usernameInput.classList.add('valid-input');
                emailInput.classList.add('valid-input');
                passwordInput.classList.add('valid-input');
                confirmPasswordInput.classList.add('valid-input');

                // Delay redirect to show success message
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.msg).join(' ');
                    showFormError(formFeedback, errorMessages);
                } else {
                    showFormError(formFeedback, data.error || 'Registration failed');
                }
                formFeedback.className = 'validation-feedback invalid';
                formFeedback.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            showFormError(formFeedback, 'An error occurred during registration');
            formFeedback.className = 'validation-feedback invalid';
            formFeedback.style.display = 'block';
        }
    });
}

// Check session status on page load
document.addEventListener('DOMContentLoaded', checkSession); 