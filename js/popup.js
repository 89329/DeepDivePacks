/**
 * A custom popup component for displaying messages and alerts.
 * Creates and manages a singleton popup instance for the entire application.
 */
class CustomPopup {
    /**
     * Creates a new CustomPopup instance.
     * Initializes the popup DOM elements and event listeners.
     */
    constructor() {
        this.createPopupElement();
    }

    /**
     * Creates and initializes the popup DOM elements.
     * Sets up event listeners for closing the popup.
     * @private
     */
    createPopupElement() {
        // Create popup elements if they don't exist
        if (!document.querySelector('.popup-overlay')) {
            const popupHTML = `
                <div class="popup-overlay">
                    <div class="popup-content">
                        <div class="popup-message"></div>
                        <button class="popup-close">OK</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', popupHTML);

            // Add event listeners
            const overlay = document.querySelector('.popup-overlay');
            const closeBtn = overlay.querySelector('.popup-close');

            closeBtn.addEventListener('click', () => this.hide());
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hide();
            });
        }

        this.overlay = document.querySelector('.popup-overlay');
        this.messageEl = this.overlay.querySelector('.popup-message');
    }

    /**
     * Displays the popup with a message.
     * @param {string} message - The message to display in the popup
     * @returns {Promise<void>} Resolves when the popup is closed
     */
    show(message) {
        this.messageEl.textContent = message;
        this.overlay.classList.add('active');
        return new Promise(resolve => {
            const handleClose = () => {
                this.overlay.removeEventListener('click', handleClose);
                resolve();
            };
            this.overlay.addEventListener('click', handleClose);
        });
    }

    /**
     * Hides the popup.
     * Removes the active class from the overlay.
     */
    hide() {
        this.overlay.classList.remove('active');
    }
}

/** @type {CustomPopup} */
const popup = new CustomPopup();

// Export the instance as a global variable
/** @type {CustomPopup} */
window.customPopup = popup; 