class CustomPopup {
    constructor() {
        this.createPopupElement();
    }

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

    hide() {
        this.overlay.classList.remove('active');
    }
}

// Create a single instance for the entire application
const popup = new CustomPopup();

// Export the instance
window.customPopup = popup; 