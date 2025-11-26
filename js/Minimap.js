class Minimap {
    constructor(track) {
        this.canvas = document.getElementById('minimap');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.track = track;
        this.size = 200;

        // Set canvas size
        this.canvas.width = this.size;
        this.canvas.height = this.size;

        // Calculate track bounds for scaling
        this.calculateBounds();
    }

    calculateBounds() {
        if (!this.track || !this.track.waypoints || this.track.waypoints.length === 0) {
            this.bounds = { minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 };
            return;
        }

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        this.track.waypoints.forEach(wp => {
            minX = Math.min(minX, wp.x);
            maxX = Math.max(maxX, wp.x);
            minY = Math.min(minY, wp.y);
            maxY = Math.max(maxY, wp.y);
        });

        // Add padding
        const padding = 200;
        this.bounds = {
            minX: minX - padding,
            maxX: maxX + padding,
            minY: minY - padding,
            maxY: maxY + padding
        };

        // Calculate scale
        const trackWidth = this.bounds.maxX - this.bounds.minX;
        const trackHeight = this.bounds.maxY - this.bounds.minY;
        this.scale = Math.min(this.size / trackWidth, this.size / trackHeight) * 0.9;
    }

    worldToMinimap(x, y) {
        const mapX = (x - this.bounds.minX) * this.scale;
        const mapY = (y - this.bounds.minY) * this.scale;
        return { x: mapX, y: mapY };
    }

    render(cars, playerCar, ghostPos) {
        if (!this.canvas || !this.ctx) return;

        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.size, this.size);

        // Draw track outline
        if (this.track && this.track.waypoints && this.track.waypoints.length > 0) {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            this.track.waypoints.forEach((wp, i) => {
                const pos = this.worldToMinimap(wp.x, wp.y);
                if (i === 0) {
                    this.ctx.moveTo(pos.x, pos.y);
                } else {
                    this.ctx.lineTo(pos.x, pos.y);
                }
            });

            this.ctx.closePath();
            this.ctx.stroke();

            // Draw start/finish line
            const startPos = this.worldToMinimap(this.track.waypoints[0].x, this.track.waypoints[0].y);
            this.ctx.fillStyle = '#ff2800';
            this.ctx.fillRect(startPos.x - 2, startPos.y - 2, 4, 4);
        }

        // Draw cars
        if (cars && cars.length > 0) {
            cars.forEach(car => {
                const pos = this.worldToMinimap(car.x, car.y);

                // Determine if this is the player
                const isPlayer = car === playerCar;

                if (isPlayer) {
                    // Player car - larger and with white outline
                    this.ctx.fillStyle = car.color;
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                } else {
                    // AI cars - smaller dots
                    this.ctx.fillStyle = car.color;
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        }

        // Draw ghost in time trials (if provided)
        if (ghostPos) {
            const gpos = this.worldToMinimap(ghostPos.x, ghostPos.y);
            this.ctx.fillStyle = '#a855f7'; // same purple as main ghost
            this.ctx.beginPath();
            this.ctx.arc(gpos.x, gpos.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    updateTrack(track) {
        this.track = track;
        this.calculateBounds();
    }
}
