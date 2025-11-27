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
        
        // Weather slip state
        this.isSlipping = false;
        this.slipAngle = 0;
        this.slipDuration = 0;
        this.slipRecoveryTime = 0;
    }

    update(input, deltaTime, track, cars, weather, raceActive = true, weatherSystem = null) {
        // Lateral grip (steering) based on tire, weather and wear.
        // This should NOT affect straight-line acceleration/top speed.
        let gripMultiplier = 1.0;
        
        // Get weather state (support both simple string and WeatherSystem object)
        const isRaining = weatherSystem ? weatherSystem.isWet() : (weather === 'RAIN');
        const slipFactor = weatherSystem ? weatherSystem.slipFactor : (isRaining ? 0.5 : 0);

        if (isRaining) {
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
        
        // Apply weather grip modifier
        if (weatherSystem) {
            gripMultiplier *= weatherSystem.getGripModifier();
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
        
        // Handle active slip state
        if (this.isSlipping) {
            this.updateSlip(deltaTime, track);
            return; // Skip normal controls while slipping
        }

        if (this.isPlayer && input) {
            // Acceleration (ArrowUp) – independent of tire compound
            if (input.keys.ArrowUp) {
                this.speed += this.acceleration * dt;
            }

            // Brake (Space) – with rain slip mechanics
            if (input.keys.Space) {
                const baseBrakeForce = 0.97;
                let brakeForce = baseBrakeForce;
                
                // In wet conditions, soft braking can cause slip
                if (slipFactor > 0.1 && this.speed > 2) {
                    // Calculate brake effectiveness in rain
                    const brakeModifier = weatherSystem ? weatherSystem.getBrakeModifier() : (1 - slipFactor * 0.4);
                    brakeForce = baseBrakeForce + (1 - baseBrakeForce) * (1 - brakeModifier);
                    
                    // Soft braking slip check: if braking too gently at speed in rain
                    // "Too soft" means braking but not enough - the car can aquaplane
                    const isSoftBraking = brakeForce > 0.95; // Not braking hard enough
                    const slipChance = slipFactor * 0.3; // Up to 30% chance in heavy rain
                    
                    if (isSoftBraking && Math.random() < slipChance * (deltaTime / 100)) {
                        this.triggerSlip(track, 'brake');
                    }
                }
                
                this.speed *= Math.pow(brakeForce, dt);
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
                
                // Extra slip chance when steering hard in wet conditions
                if (slipFactor > 0.2 && (input.keys.ArrowLeft || input.keys.ArrowRight)) {
                    const steeringSlipChance = slipFactor * 0.1 * speedFactor; // Higher at speed
                    if (Math.random() < steeringSlipChance * (deltaTime / 200)) {
                        this.triggerSlip(track, 'corner');
                    }
                }

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
            if (this.ai) this.ai.update(cars, deltaTime, weatherSystem);
        }

        // Let AI override movement if it manages its own position along the track
        if (!(this.ai && this.ai.overridesMovement && !this.isPlayer)) {
            this.move(dt);
        }
    }
    
    /**
     * Trigger a slip event - car loses control temporarily
     */
    triggerSlip(track, type = 'corner') {
        if (this.isSlipping) return; // Already slipping
        
        this.isSlipping = true;
        this.slipType = type;
        
        // Random slip direction
        this.slipAngle = (Math.random() - 0.5) * 0.8; // Random rotation during slip
        
        // Slip duration based on speed (faster = longer slip)
        const speedRatio = Math.abs(this.speed) / this.maxSpeed;
        this.slipDuration = 500 + speedRatio * 1000; // 0.5 to 1.5 seconds
        this.slipRecoveryTime = 0;
        
        // Store original speed for recovery
        this.preSlipSpeed = this.speed;
        
        // Reduce speed during slip
        this.speed *= 0.7;
    }
    
    /**
     * Update slip state - called during active slip
     */
    updateSlip(deltaTime, track) {
        this.slipRecoveryTime += deltaTime;
        
        // Calculate slip progress (0 to 1)
        const progress = Math.min(1, this.slipRecoveryTime / this.slipDuration);
        
        // Apply rotation during slip (fish-tailing effect)
        const slipIntensity = Math.sin(progress * Math.PI) * (1 - progress * 0.5);
        this.angle += this.slipAngle * slipIntensity * (deltaTime / 100);
        
        // Continue moving but with reduced control
        const slideDirection = this.angle + this.slipAngle * 0.5;
        this.x += Math.sin(slideDirection) * this.speed * 0.5;
        this.y -= Math.cos(slideDirection) * this.speed * 0.5;
        
        // Slow down during slip
        this.speed *= 0.98;
        
        // Apply extra slowdown if on grass during slip
        if (track && !track.isOnTrack(this.x, this.y)) {
            this.speed *= 0.95;
        }
        
        // End slip when duration is over
        if (progress >= 1) {
            this.isSlipping = false;
            this.slipAngle = 0;
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
