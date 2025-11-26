class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            Shift: false,
            S: false,
            P: false
        };

        // Track active touches for multi-touch support
        this.activeTouches = new Map();

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp') this.keys.ArrowUp = true;
            if (e.code === 'ArrowDown') this.keys.ArrowDown = true;
            if (e.code === 'ArrowLeft') this.keys.ArrowLeft = true;
            if (e.code === 'ArrowRight') this.keys.ArrowRight = true;
            if (e.code === 'Space') this.keys.Space = true;
            if (e.key === 'Shift') this.keys.Shift = true;
            if (e.key === 's' || e.key === 'S') this.keys.S = true;
            if (e.key === 'p' || e.key === 'P') this.keys.P = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp') this.keys.ArrowUp = false;
            if (e.code === 'ArrowDown') this.keys.ArrowDown = false;
            if (e.code === 'ArrowLeft') this.keys.ArrowLeft = false;
            if (e.code === 'ArrowRight') this.keys.ArrowRight = false;
            if (e.code === 'Space') this.keys.Space = false;
            if (e.key === 'Shift') this.keys.Shift = false;
            if (e.key === 's' || e.key === 'S') this.keys.S = false;
            if (e.key === 'p' || e.key === 'P') this.keys.P = false;
        });

        // Initialize touch controls
        this.initTouchControls();
    }

    initTouchControls() {
        // Get touch control elements
        const steerLeft = document.getElementById('steer-left');
        const steerRight = document.getElementById('steer-right');
        const pedalGas = document.getElementById('pedal-gas');
        const pedalBrake = document.getElementById('pedal-brake');

        // Prevent default touch behaviors (scrolling, zooming)
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.touch-controls')) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.touch-controls')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Setup touch handlers for each control
        if (steerLeft) this.setupTouchElement(steerLeft, 'ArrowLeft');
        if (steerRight) this.setupTouchElement(steerRight, 'ArrowRight');
        if (pedalGas) this.setupTouchElement(pedalGas, 'ArrowUp');
        if (pedalBrake) this.setupTouchElement(pedalBrake, 'ArrowDown');
    }

    setupTouchElement(element, keyName) {
        // Touch start - activate
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                this.activeTouches.set(touch.identifier, { element, keyName });
            }
            this.keys[keyName] = true;
            element.classList.add('active');
        }, { passive: false });

        // Touch end - deactivate
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                this.activeTouches.delete(touch.identifier);
            }
            // Only release key if no other touch is activating it
            let stillActive = false;
            for (const [, data] of this.activeTouches) {
                if (data.keyName === keyName) {
                    stillActive = true;
                    break;
                }
            }
            if (!stillActive) {
                this.keys[keyName] = false;
                element.classList.remove('active');
            }
        }, { passive: false });

        // Touch cancel - same as end
        element.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                this.activeTouches.delete(touch.identifier);
            }
            let stillActive = false;
            for (const [, data] of this.activeTouches) {
                if (data.keyName === keyName) {
                    stillActive = true;
                    break;
                }
            }
            if (!stillActive) {
                this.keys[keyName] = false;
                element.classList.remove('active');
            }
        }, { passive: false });

        // Handle touch moving off the element
        element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                const touchData = this.activeTouches.get(touch.identifier);
                if (touchData && touchData.element === element) {
                    // Check if touch moved outside element bounds
                    const rect = element.getBoundingClientRect();
                    const isInside = (
                        touch.clientX >= rect.left &&
                        touch.clientX <= rect.right &&
                        touch.clientY >= rect.top &&
                        touch.clientY <= rect.bottom
                    );
                    
                    if (!isInside) {
                        this.activeTouches.delete(touch.identifier);
                        let stillActive = false;
                        for (const [, data] of this.activeTouches) {
                            if (data.keyName === keyName) {
                                stillActive = true;
                                break;
                            }
                        }
                        if (!stillActive) {
                            this.keys[keyName] = false;
                            element.classList.remove('active');
                        }
                    }
                }
            }
        }, { passive: false });
    }

    // Check if device supports touch
    static isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
}
