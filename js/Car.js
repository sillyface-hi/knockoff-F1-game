class Car {
    constructor(x, y, color = '#ff0000', isPlayer = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isPlayer = isPlayer;

        // Physics properties
        this.speed = 0;
        this.maxSpeed = 16; // Top speed (internal units)
        // Internal acceleration/friction tuned so that:
        // - Top speed stays around the same (~230 mph on HUD)
        // - Acceleration is a bit slower so cars don't reach Vmax instantly.
        this.acceleration = 0.056; // Longitudinal acceleration (slower than before)
        this.friction = 0.9925; // Slightly lower drag to preserve similar top speed
        this.angle = 0; // Radians
        // Base steering rate – kept fairly low; high-speed steering is further reduced below.
        this.rotationSpeed = 0.03;

        // Race State
        this.lap = 0;                  // start on lap 0 until first crossing
        this.lastLapTime = 0;
        this.lastDistToStart = 1000;
        this.currentWaypointIndex = 0;
        this.finished = false;
        this.crossedLine = false;      // used by lap logic
        this.position = 0;             // race position
        this.progress = 0;             // distance along current lap
        this.lastProgressNorm = null;  // previous normalized progress (0–1) for wrap detection

        // Drifting/Traction
        this.driftFactor = 0.95; // 1 = no drift, lower = more drift
        this.currentGrip = 1.0;

        this.width = 20;
        this.height = 40;
    }

    update(input, deltaTime, track, cars, weather, raceActive = true) {
        // Calculate Grip based on Tire and Weather
        let gripMultiplier = 1.0;

        if (weather === 'RAIN') {
            if (this.tire === 'WET') gripMultiplier = 0.9;
            else if (this.tire === 'INTER') gripMultiplier = 0.7;
            else gripMultiplier = 0.3; // Slicks in rain = ice
        } else {
            // Sunny
            if (this.tire === 'SOFT') gripMultiplier = 1.0;
            else if (this.tire === 'HARD') gripMultiplier = 0.95;
            else gripMultiplier = 0.8; // Wets in dry = bad
        }

        this.currentGrip = gripMultiplier;

        // Check for Grass
        if (track && !track.isOnTrack(this.x, this.y)) {
            this.currentGrip *= 0.9; // 90% Grip
            this.speed *= 0.99; // Slight slowdown
        }

        // Hold cars stationary until race start (used for F1-style start lights)
        if (!raceActive) {
            this.speed = 0;
            return;
        }

        if (this.isPlayer && input) {
            // Acceleration (ArrowUp)
            if (input.keys.ArrowUp) {
                this.speed += this.acceleration * this.currentGrip;
            }

            // Brake (Space) – make braking noticeable but not too aggressive
            if (input.keys.Space) {
                this.speed *= 0.97; // Softer braking than before (was 0.9)
            }

            // Reverse / Slow down
            if (input.keys.ArrowDown) {
                this.speed -= this.acceleration * 0.5 * this.currentGrip;
            }

            // Steering with speed-sensitive understeer
            if (Math.abs(this.speed) > 0.1) {
                const flip = this.speed > 0 ? 1 : -1;
                // Grip affects steering too; higher grip → more potential steering.
                let steerAmount = this.rotationSpeed * (0.4 + 0.6 * this.currentGrip);

                // Strong understeer at high speed:
                // at low speed, full steering; as we approach maxSpeed, steering is greatly reduced.
                const speedFactor = Math.min(1, Math.abs(this.speed) / this.maxSpeed); // 0..1
                const understeerScale = 1 / (1 + speedFactor * 4); // at top speed → ~1/5 steering
                steerAmount *= understeerScale;

                if (input.keys.ArrowLeft) {
                    this.angle -= steerAmount * flip;
                }
                if (input.keys.ArrowRight) {
                    this.angle += steerAmount * flip;
                }
            }
        } else if (!this.isPlayer) {
            if (!this.ai) {
                // Lazy init AI to avoid circular dependency issues or init order
                // Assuming AI class is imported or passed
            }
            if (this.ai) this.ai.update(cars);
        }

        // Let AI override movement if it manages its own position along the track
        if (!(this.ai && this.ai.overridesMovement && !this.isPlayer)) {
            this.move();
        }
    }

    move() {
        // Cap speed
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;

        // Apply friction
        this.speed *= this.friction;

        // Stop completely if very slow
        if (Math.abs(this.speed) < 0.01) this.speed = 0;

        // Calculate velocity vector
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Car Body Color
        ctx.fillStyle = this.color;

        // Dimensions
        const w = this.width;
        const h = this.height;

        // 1. Main Body (Cockpit area)
        ctx.fillRect(-w / 2 + 5, -h / 2 + 10, w - 10, h - 20);

        // 2. Main Body (refined)
        ctx.fillRect(-w / 2 + 2, -h / 2 + 10, w - 4, h - 15);

        // Nose Cone
        ctx.fillStyle = (this.teamId === 'mclaren') ? '#000000' : '#FFFFFF'; // McLaren front in black
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2 + 10);
        ctx.lineTo(0, -h / 2 - 5);
        ctx.lineTo(w / 4, -h / 2 + 10);
        ctx.fill();

        // Front Wing
        ctx.fillStyle = (this.teamId === 'mclaren') ? '#000000' : '#FFFFFF'; // McLaren front wing in black
        ctx.fillRect(-w / 2 - 2, -h / 2 - 5, w + 4, 5);

        // Rear Wing
        ctx.fillRect(-w / 2 - 2, h / 2 - 5, w + 4, 5);

        // Sidepods
        ctx.fillStyle = this.color;
        ctx.fillRect(-w / 2, -h / 4, 4, h / 2); // Left
        ctx.fillRect(w / 2 - 4, -h / 4, 4, h / 2); // Right

        // Tires
        ctx.fillStyle = '#111';
        // Front Left
        ctx.fillRect(-w / 2 - 4, -h / 2 + 2, 5, 10);
        // Front Right
        ctx.fillRect(w / 2 - 1, -h / 2 + 2, 5, 10);
        // Rear Left
        ctx.fillRect(-w / 2 - 4, h / 2 - 12, 5, 10);
        // Rear Right
        ctx.fillRect(w / 2 - 1, h / 2 - 12, 5, 10);

        // Driver Helmet
        ctx.fillStyle = '#ffeb3b'; // Yellow helmet default
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Halo
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-3, -2);
        ctx.lineTo(3, -2);
        ctx.stroke();

        ctx.restore();
    }
}
