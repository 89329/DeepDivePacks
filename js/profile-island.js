/**
 * profile-island.js
 * 
 * This script handles the profile island UI component displayed in the top-right corner
 * of the main index page. It is NOT used for the profile.html page functionality.
 * 
 * The profile island shows either:
 * - For logged-in users: username, avatar, and logout button
 * - For guests: login and register buttons
 */
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Check if user is logged in
        const user = await checkSession();
        const profileIsland = document.getElementById('profile-island');
        const logoutBtn = document.getElementById('logout-btn');
        const authButtons = document.getElementById('auth-buttons');

        if (user) {
            // User is logged in, show profile island and logout button
            const usernameDisplay = document.querySelector('.username-display');
            usernameDisplay.textContent = user.username;
            profileIsland.href = `/profile/${user.username}`;
            profileIsland.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            authButtons.classList.add('hidden');

            // Get additional user data including profile image
            try {
                const response = await fetch(`/api/profile/${user.username}`);
                if (response.ok) {
                    const userData = await response.json();

                    // Handle profile image
                    const avatarPlaceholder = document.querySelector('.avatar-placeholder');
                    if (avatarPlaceholder) {
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
                            avatarPlaceholder.innerHTML = user.username.charAt(0).toUpperCase();
                            avatarPlaceholder.classList.remove('has-image');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user profile data:', error);
                // If error, just use default avatar (first letter of username)
                const avatarPlaceholder = document.querySelector('.avatar-placeholder');
                if (avatarPlaceholder) {
                    avatarPlaceholder.innerHTML = user.username.charAt(0).toUpperCase();
                    avatarPlaceholder.classList.remove('has-image');
                }
            }

            // Add logout functionality
            logoutBtn.addEventListener('click', async () => {
                try {
                    await logout();
                } catch (error) {
                    console.error('Error during logout:', error);
                }
            });
        } else {
            // User is not logged in, show auth buttons
            profileIsland.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            authButtons.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading profile island:', error);
    }
}); 