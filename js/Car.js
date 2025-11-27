// Target frame time for physics normalization
// 16.67 = normal speed (60 FPS baseline), lower = faster gameplay
// 11.11 = 1.5X speed, 8.33 = 2X speed
const TARGET_FRAME_TIME = 5;

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

        // Tyre wear (0 = fresh, 1 = completely worn)
        this.tireWear = 0;
        this.tireLifeLaps = null; // will be set based on compound the first time we need it

        this.width = 20;
        this.height = 40;
    }

    update(input, deltaTime, track, cars, weather, raceActive = true) {
        // Lateral grip (steering) based on tire, weather and wear.
        // This should NOT affect straight-line acceleration/top speed.
        let gripMultiplier = 1.0;

        if (weather === 'RAIN') {
            // In the wet: wets best, inters decent, slicks much worse.
            if (this.tire === 'WET') gripMultiplier = 1.0;
            else if (this.tire === 'INTER') gripMultiplier = 0.85;
            else gripMultiplier = 0.4; // slicks in rain
        } else {
            // Dry conditions: softer = more agile, harder = more understeer.
            if (this.tire === 'SOFT') gripMultiplier = 1.0;
            else if (this.tire === 'MEDIUM') gripMultiplier = 0.85;
            else if (this.tire === 'HARD') gripMultiplier = 0.7;
            else if (this.tire === 'INTER') gripMultiplier = 0.6;
            else if (this.tire === 'WET') gripMultiplier = 0.5;
        }

        // Apply wear effect: as tireWear → 1, reduce effective grip but never below 40%
        const wear = this.tireWear || 0;
        let wearFactor = 1 - wear * 0.6; // at full wear, 40% of base grip
        if (wearFactor < 0.4) wearFactor = 0.4;
        this.currentGrip = gripMultiplier * wearFactor;

        // Normalized delta time for frame-rate independent physics
        const dt = deltaTime / TARGET_FRAME_TIME;

        // Check for Grass
        if (track && !track.isOnTrack(this.x, this.y)) {
            this.currentGrip *= 0.9; // less turning grip on grass
            this.speed *= Math.pow(0.99, dt); // slight straight-line slowdown on grass
        }

        // Hold cars stationary until race start (used for F1-style start lights)
        if (!raceActive) {
            this.speed = 0;
            return;
        }

        if (this.isPlayer && input) {
            // Acceleration (ArrowUp) – independent of tire compound
            if (input.keys.ArrowUp) {
                this.speed += this.acceleration * dt;
            }

            // Brake (Space) – constant effect, independent of tire compound
            if (input.keys.Space) {
                this.speed *= Math.pow(0.97, dt); // Softer braking than before (was 0.9)
            }

            // Reverse / Slow down – also independent of tire compound
            if (input.keys.ArrowDown) {
                this.speed -= this.acceleration * 0.5 * dt;
            }

            // Steering with speed-sensitive understeer
            if (Math.abs(this.speed) > 0.1) {
                const flip = this.speed > 0 ? 1 : -1;
                // Grip affects steering only; higher grip → more potential steering.
                let steerAmount = this.rotationSpeed * (0.4 + 0.6 * this.currentGrip);

                // Strong understeer at high speed:
                // at low speed, full steering; as we approach maxSpeed, steering is greatly reduced.
                const speedFactor = Math.min(1, Math.abs(this.speed) / this.maxSpeed); // 0..1
                const understeerScale = 1 / (1 + speedFactor * 4); // at top speed → ~1/5 steering
                steerAmount *= understeerScale;

                if (input.keys.ArrowLeft) {
                    this.angle -= steerAmount * flip * dt;
                }
                if (input.keys.ArrowRight) {
                    this.angle += steerAmount * flip * dt;
                }
            }
        } else if (!this.isPlayer) {
            if (!this.ai) {
                // Lazy init AI to avoid circular dependency issues or init order
                // Assuming AI class is imported or passed
            }
            if (this.ai) this.ai.update(cars, deltaTime);
        }

        // Let AI override movement if it manages its own position along the track
        if (!(this.ai && this.ai.overridesMovement && !this.isPlayer)) {
            this.move(dt);
        }
    }

    move(dt = 1) {
        // Cap speed
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;

        // Apply friction (frame-rate independent)
        this.speed *= Math.pow(this.friction, dt);

        // Stop completely if very slow
        if (Math.abs(this.speed) < 0.01) this.speed = 0;

        // Calculate velocity vector (frame-rate independent)
        this.x += Math.sin(this.angle) * this.speed * dt;
        this.y -= Math.cos(this.angle) * this.speed * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Car Body Color
        let bodyColor = this.color;
        // Special liveries:
        // - Alpine: pink body
        // - Racing Bulls (rb): white body
        if (this.teamId === 'alpine') {
            bodyColor = '#ff66cc'; // pink
        } else if (this.teamId === 'rb') {
            bodyColor = '#ffffff';
        }
        ctx.fillStyle = bodyColor;

        // Dimensions
        const w = this.width;
        const h = this.height;

        // 1. Main Body (Cockpit area)
        ctx.fillRect(-w / 2 + 5, -h / 2 + 10, w - 10, h - 20);

        // 2. Main Body (refined)
        ctx.fillRect(-w / 2 + 2, -h / 2 + 10, w - 4, h - 15);

        // Nose Cone
        // Alpine nose blue, Racing Bulls nose red,
        // McLaren/Cadillac/Aston Martin black, others white
        if (this.teamId === 'alpine') {
            ctx.fillStyle = '#0000ff'; // blue
        } else if (this.teamId === 'rb') {
            ctx.fillStyle = '#ff0000'; // red
        } else if (this.teamId === 'mclaren' || this.teamId === 'cadillac' || this.teamId === 'astonmartin') {
            ctx.fillStyle = '#000000';
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2 + 10);
        ctx.lineTo(0, -h / 2 - 5);
        ctx.lineTo(w / 4, -h / 2 + 10);
        ctx.fill();

        // Front Wing
        // Special team styling:
        // - Red Bull: red
        // - Racing Bulls (rb): red
        // - Alpine: blue
        // - McLaren/Cadillac/Aston Martin: black
        // - Others: white
        if (this.teamId === 'redbull' || this.teamId === 'rb') {
            ctx.fillStyle = '#ff0000'; // red
        } else if (this.teamId === 'alpine') {
            ctx.fillStyle = '#0000ff'; // blue
        } else if (this.teamId === 'mclaren' || this.teamId === 'cadillac' || this.teamId === 'astonmartin') {
            ctx.fillStyle = '#000000';
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillRect(-w / 2 - 2, -h / 2 - 5, w + 4, 5);

        // Rear Wing
        // Red Bull & Racing Bulls rear wing yellow, Alpine blue,
        // McLaren/Cadillac/Aston Martin black, others white
        if (this.teamId === 'redbull' || this.teamId === 'rb') {
            ctx.fillStyle = '#ffff00'; // yellow
        } else if (this.teamId === 'alpine') {
            ctx.fillStyle = '#0000ff'; // blue
        } else if (this.teamId === 'mclaren' || this.teamId === 'cadillac' || this.teamId === 'astonmartin') {
            ctx.fillStyle = '#000000';
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillRect(-w / 2 - 2, h / 2 - 5, w + 4, 5);

        // Sidepods
        ctx.fillStyle = bodyColor;
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
