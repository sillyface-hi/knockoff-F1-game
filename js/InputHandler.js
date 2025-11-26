class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            Shift: false, // Keep for turbo/boost maybe? Or remove if unused. User said "instead of shift", so maybe remove or keep as optional.
            S: false
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp') this.keys.ArrowUp = true;
            if (e.code === 'ArrowDown') this.keys.ArrowDown = true;
            if (e.code === 'ArrowLeft') this.keys.ArrowLeft = true;
            if (e.code === 'ArrowRight') this.keys.ArrowRight = true;
            if (e.code === 'Space') this.keys.Space = true;
            if (e.key === 'Shift') this.keys.Shift = true;
            if (e.key === 's' || e.key === 'S') this.keys.S = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp') this.keys.ArrowUp = false;
            if (e.code === 'ArrowDown') this.keys.ArrowDown = false;
            if (e.code === 'ArrowLeft') this.keys.ArrowLeft = false;
            if (e.code === 'ArrowRight') this.keys.ArrowRight = false;
            if (e.code === 'Space') this.keys.Space = false;
            if (e.key === 'Shift') this.keys.Shift = false;
            if (e.key === 's' || e.key === 'S') this.keys.S = false;
        });
    }
}
