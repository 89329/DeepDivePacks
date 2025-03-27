document.addEventListener('DOMContentLoaded', async () => {
    // Get username from URL path instead of query params and remove trailing slashes
    const username = window.location.pathname.split('/profile/')[1]?.replace(/\/+$/, '');
    if (!username) {
        showProfileError('invalid');
        return;
    }

    // Get current user from session
    let currentUser = null;
    try {
        currentUser = await getCurrentUser();
    } catch (error) {
        console.error('Error getting current user:', error);
        showProfileError('generic');
        return;
    }

    // Initialize UI with loading state
    showLoadingState();

    // Fetch profile data
    try {
        const response = await fetch(`/api/profile/${username}`);

        if (!response.ok) {
            if (response.status === 403) {
                showProfileError('private');
                hideLoadingState();
                return;
            } else if (response.status === 404) {
                showProfileError('not-found');
                hideLoadingState();
                return;
            }
            const errorData = await response.json();
            throw new Error(`Failed to fetch profile: ${errorData.message || 'Unknown error'}`);
        }

        const userData = await response.json();
        displayProfileData(userData, currentUser?.username === username);

        // If it's the current user's profile, setup editing capabilities
        if (currentUser?.username === username) {
            setupProfileEditing(userData);

            // Show edit profile button
            const editProfileBtn = document.getElementById('edit-profile-btn');
            if (editProfileBtn) {
                editProfileBtn.classList.remove('hidden');
                editProfileBtn.addEventListener('click', () => openProfileEditModal(userData));
            }
        }

        // Load and display card collection
        loadCardCollection(username);

        // Hide loading state
        hideLoadingState();
    } catch (error) {
        console.error('Error loading profile');
        showProfileError('generic');
        hideLoadingState();
    }
});

function showLoadingState() {
    // Add subtle loading animations or indicators if desired
    document.querySelector('.profile-content').classList.add('loading');
}

function hideLoadingState() {
    document.querySelector('.profile-content').classList.remove('loading');
}

function showProfileError(type) {
    // Hide the regular profile content and cards section
    document.querySelector('.profile-main').classList.add('hidden');
    document.querySelector('.cards-collection').classList.add('hidden');

    // Show appropriate fallback based on error type
    switch (type) {
        case 'private':
            document.querySelector('.private-profile').classList.remove('hidden');
            break;
        case 'not-found':
        case 'invalid':
            document.querySelector('.user-not-found').classList.remove('hidden');
            break;
        case 'generic':
        default:
            // For generic errors, we'll still use the popup but with a more specific message
            showError('There was a problem loading this profile. Please try again later.');
            document.querySelector('.user-not-found').classList.remove('hidden');
            break;
    }
}

function displayProfileData(userData, isOwner) {
    // Ensure main profile section is visible (not a fallback state)
    document.querySelector('.profile-main').classList.remove('hidden');
    document.querySelector('.cards-collection').classList.remove('hidden');
    document.querySelector('.private-profile').classList.add('hidden');
    document.querySelector('.user-not-found').classList.add('hidden');

    // Set user identity
    const username = document.querySelector('.username');
    username.textContent = userData.username;

    // Handle profile image
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');
    if (userData.profile_image_url) {
        // Create or get existing image element
        let avatarImg = avatarPlaceholder.querySelector('img');
        if (!avatarImg) {
            avatarImg = document.createElement('img');
            avatarImg.className = 'avatar-image';
            avatarPlaceholder.innerHTML = ''; // Clear placeholder content
            avatarPlaceholder.appendChild(avatarImg);
        }
        avatarImg.src = userData.profile_image_url;
        avatarImg.alt = `${userData.username}'s profile picture`;
        avatarPlaceholder.classList.add('has-image'); // Add class when image is present
    } else {
        // Show first letter of username in avatar placeholder if no image
        avatarPlaceholder.innerHTML = userData.username.charAt(0).toUpperCase();
        avatarPlaceholder.classList.remove('has-image'); // Remove class when no image
    }

    // Email - only visible to owner
    const email = document.querySelector('.email');
    if (userData.email && isOwner) {
        email.textContent = userData.email;
        email.classList.remove('hidden');
    } else {
        email.classList.add('hidden');
    }

    // Stats
    document.querySelector('.join-date').textContent = formatDate(userData.created_at);
    document.querySelector('.currency').textContent = `${userData.currency || 0} coins`;

    // Visibility indicator
    const isPublic = userData.is_public !== false; // Default to public if not specified
    const visibilityIndicator = document.querySelector('.visibility-indicator');
    const visibilityText = document.querySelector('.visibility-text');

    visibilityIndicator.classList.toggle('private', !isPublic);
    visibilityText.textContent = isPublic ? 'Public Profile' : 'Private Profile';

    // Show settings section if owner and elements exist
    const profileSettings = document.getElementById('profile-settings');
    const visibilitySetting = document.getElementById('visibility-setting');
    if (isOwner && profileSettings && visibilitySetting) {
        profileSettings.classList.remove('hidden');
        visibilitySetting.value = isPublic ? 'public' : 'private';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function setupProfileEditing(userData) {
    const visibilitySelect = document.getElementById('visibility-setting');

    // Handle visibility changes
    if (visibilitySelect) {
        visibilitySelect.addEventListener('change', async (e) => {
            // Show loading state on select
            visibilitySelect.disabled = true;
            visibilitySelect.style.opacity = '0.7';

            try {
                const isPublic = e.target.value === 'public';
                const csrfToken = await getCsrfToken(); // Get CSRF token
                const response = await fetch('/api/profile/update-visibility', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({
                        is_public: isPublic
                    })
                });

                if (!response.ok) throw new Error('Failed to update visibility');

                // Update UI
                const visibilityIndicator = document.querySelector('.visibility-indicator');
                const visibilityText = document.querySelector('.visibility-text');

                visibilityIndicator.classList.toggle('private', !isPublic);
                visibilityText.textContent = isPublic ? 'Public Profile' : 'Private Profile';

                showSuccess('Profile visibility updated');
            } catch (error) {
                showError('Failed to update profile visibility');
                // Revert selection on error
                visibilitySelect.value = userData.is_public ? 'public' : 'private';
            } finally {
                // Remove loading state
                visibilitySelect.disabled = false;
                visibilitySelect.style.opacity = '1';
            }
        });
    }

    // Setup modal event listeners
    setupProfileEditModal();
}

function openProfileEditModal(userData) {
    const modal = document.getElementById('profile-edit-modal');
    if (!modal) return;

    // Populate form fields with current user data
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');

    usernameInput.value = userData.username || '';
    emailInput.value = userData.email || '';

    // Store original values for comparison
    usernameInput.dataset.originalValue = userData.username || '';
    emailInput.dataset.originalValue = userData.email || '';

    // Set visibility radio button
    const isPublic = userData.is_public !== false;
    document.getElementById(isPublic ? 'visibility-public' : 'visibility-private').checked = true;

    // Update profile image preview
    updateImagePreview(userData.profile_image_url);

    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('change-password').checked = false;
    document.getElementById('password-change-fields').classList.add('hidden');

    // Show modal
    modal.classList.remove('hidden');
}

function setupProfileEditModal() {
    const modal = document.getElementById('profile-edit-modal');
    if (!modal) return;

    // Create feedback elements
    const createFeedback = (id) => {
        const feedback = document.createElement('div');
        feedback.id = id;
        feedback.className = 'validation-feedback';
        feedback.style.display = 'none';
        return feedback;
    };

    const usernameFeedback = createFeedback('username-feedback');
    const emailFeedback = createFeedback('email-feedback');

    // Add feedback elements after their respective inputs
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    usernameInput.parentNode.appendChild(usernameFeedback);
    emailInput.parentNode.appendChild(emailFeedback);

    // No need to create feedback for image URL as it's already in the HTML

    // Add real-time validation
    let currentUsername = usernameInput.value;
    let currentEmail = emailInput.value;

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
            const available = await checkUsernameAvailability(username, currentUsername);
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
            const available = await checkEmailAvailability(email, currentEmail);
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

    // Add input listeners
    usernameInput.addEventListener('input', (e) => validateUsername(e.target.value));
    emailInput.addEventListener('input', (e) => validateEmail(e.target.value));

    // Close modal handlers
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileEditModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProfileEditModal);
    }

    // Image source toggle
    const sourceButtons = modal.querySelectorAll('.image-source-btn');
    if (sourceButtons.length) {
        sourceButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                sourceButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                // Hide all options
                document.querySelectorAll('.image-option').forEach(opt => {
                    opt.classList.add('hidden');
                });

                // Show selected option
                const source = this.dataset.source;
                document.getElementById(`${source}-option`).classList.remove('hidden');
            });
        });
    }

    // Password change toggle
    const passwordToggle = document.getElementById('change-password');
    if (passwordToggle) {
        passwordToggle.addEventListener('change', function () {
            const passwordFields = document.getElementById('password-change-fields');
            if (passwordFields) {
                passwordFields.classList.toggle('hidden', !this.checked);

                // If showing password fields, make them required
                const newPassword = document.getElementById('new-password');
                const confirmPassword = document.getElementById('confirm-password');

                if (newPassword && confirmPassword) {
                    newPassword.required = this.checked;
                    confirmPassword.required = this.checked;
                }
            }
        });
    }

    // Profile image upload
    const imageUploadInput = document.getElementById('profile-image-upload');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const applyImageUrlBtn = document.getElementById('apply-image-url');

    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', handleImageUpload);
    }

    if (applyImageUrlBtn) {
        applyImageUrlBtn.addEventListener('click', handleImageUrl);
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function () {
            // Clear image preview
            updateImagePreview(null);
            // Clear hidden input value
            document.getElementById('profile-image').value = '';
        });
    }

    // Form submission
    const form = document.getElementById('profile-edit-form');
    if (form) {
        form.addEventListener('submit', handleProfileUpdate);
    }
}

function updateImagePreview(imageUrl) {
    const preview = document.getElementById('image-preview');
    if (!preview) return;

    if (imageUrl) {
        // Create or update image element
        let img = preview.querySelector('img');
        if (!img) {
            preview.innerHTML = ''; // Clear any icons
            img = document.createElement('img');
            preview.appendChild(img);
        }
        img.src = imageUrl;
        img.alt = 'Profile Image Preview';
    } else {
        // Show default icon if no image
        preview.innerHTML = '<i class="fas fa-user"></i>';
    }
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
        showError('Please select an image file (JPG, PNG, GIF)');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image file is too large. Maximum size is 5MB');
        return;
    }

    // Show loading state in preview
    const preview = document.getElementById('image-preview');
    const oldContent = preview.innerHTML;
    preview.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('profile_image', file);

        // Get CSRF token
        const csrfToken = await getCsrfToken();

        // Upload the image
        const response = await fetch('/api/profile/upload-image', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload image');
        }

        // Update preview with the new image URL
        updateImagePreview(data.imageUrl);

        // Update hidden input with the new URL
        document.getElementById('profile-image').value = data.imageUrl;

        showSuccess('Image uploaded successfully');
    } catch (error) {
        console.error('Upload error:', error);
        showError(error.message || 'Failed to upload image');

        // Restore original preview content
        preview.innerHTML = oldContent;
    }
}

async function handleImageUrl() {
    const imageUrlInput = document.getElementById('profile-image-url-input');
    const imageUrlFeedback = document.getElementById('image-url-feedback');

    if (!imageUrlInput || !imageUrlFeedback) return;

    const url = imageUrlInput.value.trim();

    if (!url) {
        showFormError(imageUrlFeedback, 'Please enter an image URL');
        return;
    }

    // Basic URL validation
    if (!isValidUrl(url)) {
        showFormError(imageUrlFeedback, 'Please enter a valid URL');
        return;
    }

    // Show loading state
    const applyBtn = document.getElementById('apply-image-url');
    if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading';
    }

    imageUrlFeedback.style.display = 'none';

    try {
        // Check if URL is an image by attempting to load it
        const isImage = await checkIfImageUrl(url);

        if (!isImage) {
            showFormError(imageUrlFeedback, 'URL does not point to a valid image');
            return;
        }

        // Update preview with the URL
        updateImagePreview(url);

        // Update hidden input with the URL
        document.getElementById('profile-image').value = url;

        showFormSuccess(imageUrlFeedback, 'Image URL applied successfully');
    } catch (error) {
        console.error('URL validation error:', error);
        showFormError(imageUrlFeedback, 'Failed to load image from URL');
    } finally {
        // Reset button state
        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply';
        }
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function checkIfImageUrl(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);

        img.src = url;
    });
}

async function handleProfileUpdate(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());

    // Check if changing password
    const isChangingPassword = formValues.change_password === 'on';
    if (!isChangingPassword) {
        // Remove password fields if not changing password
        delete formValues.new_password;
        delete formValues.confirm_password;
    } else {
        // Validate passwords match
        if (formValues.new_password !== formValues.confirm_password) {
            showError('New passwords do not match');
            return;
        }
    }

    // Convert is_public to boolean
    formValues.is_public = formValues.is_public === 'public';

    // Show loading state
    form.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.7';
    });

    try {
        // Check username and email availability before submitting
        const currentUsername = document.getElementById('username').dataset.originalValue;
        const currentEmail = document.getElementById('email').dataset.originalValue;

        if (formValues.username !== currentUsername) {
            const isUsernameAvailable = await checkUsernameAvailability(formValues.username, currentUsername);
            if (!isUsernameAvailable) {
                showError('Username is already taken');
                return;
            }
        }

        if (formValues.email !== currentEmail) {
            const isEmailAvailable = await checkEmailAvailability(formValues.email, currentEmail);
            if (!isEmailAvailable) {
                showError('Email is already registered');
                return;
            }
        }

        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify(formValues)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        showSuccess('Profile updated successfully');
        closeProfileEditModal();

        // If username was changed, redirect to the new profile URL
        if (formValues.username !== currentUsername) {
            setTimeout(() => {
                window.location.href = `/profile/${formValues.username}`;
            }, 1500);
        } else {
            // Just reload the current page if no username change
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    } catch (error) {
        showError(error.message || 'Failed to update profile');
    } finally {
        // Remove loading state
        form.querySelectorAll('button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
}

async function loadCardCollection(username) {
    if (!username) return;

    try {
        // Ensure there's no trailing slash in the username
        const cleanUsername = username.replace(/\/+$/, '');
        const response = await fetch(`/api/profile/${cleanUsername}/cards`);

        if (!response.ok) {
            if (response.status === 403) {
                return;
            }
            throw new Error('Failed to fetch cards');
        }

        const cards = await response.json();
        const cardsGrid = document.querySelector('.cards-grid');
        const emptyCollection = document.querySelector('.empty-collection');
        const cardsCount = document.querySelector('.cards-count');

        // Update card count display
        cardsCount.textContent = `${cards.length} card${cards.length !== 1 ? 's' : ''}`;

        if (!cards || cards.length === 0) {
            cardsGrid.classList.add('hidden');
            emptyCollection.classList.remove('hidden');
            return;
        }

        cardsGrid.classList.remove('hidden');
        emptyCollection.classList.add('hidden');

        // Generate card elements
        cards.forEach(card => {
            const cardElement = createCardElement(card);
            cardsGrid.appendChild(cardElement);
        });
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load card collection');
    }
}

function createCardElement(card) {
    // This is a placeholder for future card implementation
    // Will be enhanced when the card system is implemented
    const cardElement = document.createElement('div');
    cardElement.className = 'card-item';
    cardElement.innerHTML = '<div class="card-placeholder">Card will be displayed here</div>';

    return cardElement;
}

function showError(message) {
    if (window.showPopup) {
        window.showPopup('error', message);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    if (window.showPopup) {
        window.showPopup('success', message);
    }
}

function showInfo(message) {
    if (window.showPopup) {
        window.showPopup('info', message);
    }
}

// Helper function to get current user data
async function getCurrentUser() {
    try {
        const response = await fetch('/api/check-session');
        if (!response.ok) return null;
        const data = await response.json();
        return data.isAuthenticated ? data.user : null;
    } catch (error) {
        return null;
    }
}

// Helper function to get CSRF token
async function getCsrfToken() {
    try {
        const response = await fetch('/api/csrf-token');
        if (!response.ok) throw new Error('Failed to get CSRF token');
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        throw error;
    }
}

function closeProfileEditModal() {
    const modal = document.getElementById('profile-edit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Add these functions at the top level, after the existing imports
async function checkUsernameAvailability(username, currentUsername) {
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
        // Username is available if it's the current user's username or if it's unclaimed
        return username === currentUsername || data.available;
    } catch (error) {
        console.error('Error checking username:', error);
        return true; // Default to true on error to allow form submission
    }
}

async function checkEmailAvailability(email, currentEmail) {
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
        // Email is available if it's the current user's email or if it's unclaimed
        return email === currentEmail || data.available;
    } catch (error) {
        console.error('Error checking email:', error);
        return true; // Default to true on error to allow form submission
    }
}

// Add these helper functions if they don't exist
function showFormError(element, message) {
    element.textContent = `✗ ${message}`;
    element.className = 'validation-feedback invalid';
    element.style.display = 'block';
}

function showFormSuccess(element, message) {
    element.textContent = `✓ ${message}`;
    element.className = 'validation-feedback valid';
    element.style.display = 'block';
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
} 