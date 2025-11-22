class AI {
    constructor(car, track) {
        this.car = car;
        this.track = track;

        // AI Personality
        this.aggression = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
        this.skill = 0.8 + Math.random() * 0.2; // 0.8 to 1.0
        this.reactionTime = 5 + Math.random() * 10; // Frames to react

        // Racing Line Offset (-1 to 1)
        this.preferredOffset = (Math.random() - 0.5) * 0.5;
        this.currentOffset = this.preferredOffset;

        // State
        this.currentSegmentIndex = 0;
        this.lookAheadPoint = { x: 0, y: 0 };
        this.targetSpeed = 0;
        this.lineIndex = 0; // progress along ideal line
        this.trackDistance = null; // scalar distance along track centerline
        this.overridesMovement = true; // tells Car not to apply its own move() for AI
    }

    // --- Vector Math Helpers ---
    add(v1, v2) { return { x: v1.x + v2.x, y: v1.y + v2.y }; }
    sub(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y }; }
    mult(v, s) { return { x: v.x * s, y: v.y * s }; }
    mag(v) { return Math.hypot(v.x, v.y); }
    normalize(v) {
        const m = this.mag(v);
        return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
    }
    dist(p1, p2) { return Math.hypot(p1.x - p2.x, p1.y - p2.y); }

    // Project point p onto line segment ab
    project(p, a, b) {
        const ap = this.sub(p, a);
        const ab = this.sub(b, a);
        const ab2 = ab.x * ab.x + ab.y * ab.y;
        const dot = ap.x * ab.x + ap.y * ab.y;
        let t = dot / ab2;
        t = Math.max(0, Math.min(1, t)); // Clamp to segment
        return {
            point: this.add(a, this.mult(ab, t)),
            t: t,
            dist: this.dist(p, this.add(a, this.mult(ab, t)))
        };
    }

    // --- Track Awareness ---
    getTrackState() {
        // Find closest segment
        let minDist = Infinity;
        let closestIndex = this.currentSegmentIndex; // Start search from last known

        // Search local neighborhood first, then full track if lost
        const searchRange = 5;
        const waypoints = this.track.waypoints;

        for (let i = -searchRange; i <= searchRange; i++) {
            let idx = (this.currentSegmentIndex + i + waypoints.length) % waypoints.length;
            let nextIdx = (idx + 1) % waypoints.length;

            const proj = this.project(this.car, waypoints[idx], waypoints[nextIdx]);
            if (proj.dist < minDist) {
                minDist = proj.dist;
                closestIndex = idx;
            }
        }

        // If we're very far, search whole track (rare)
        if (minDist > 500) {
            for (let i = 0; i < waypoints.length; i++) {
                let nextIdx = (i + 1) % waypoints.length;
                const proj = this.project(this.car, waypoints[i], waypoints[nextIdx]);
                if (proj.dist < minDist) {
                    minDist = proj.dist;
                    closestIndex = i;
                }
            }
        }

        this.currentSegmentIndex = closestIndex;

        const p1 = waypoints[closestIndex];
        const p2 = waypoints[(closestIndex + 1) % waypoints.length];
        const proj = this.project(this.car, p1, p2);

        // Calculate track direction at projection
        const trackDir = this.normalize(this.sub(p2, p1));

        // Calculate lateral position (signed distance from center)
        // Cross product 2D to determine side
        const toCar = this.sub(this.car, p1);
        const cross = trackDir.x * toCar.y - trackDir.y * toCar.x;
        const side = cross > 0 ? 1 : -1;

        return {
            segmentIndex: closestIndex,
            projectedPoint: proj.point,
            tOnSegment: proj.t,
            lateralDist: minDist * side,
            trackDir: trackDir,
            trackWidth: p1.width || 200
        };
    }

    // --- Core Update Loop ---
    // Slot-car style AI: move along track centerline with curvature-based speed
    update(cars) {
        if (!this.track || !this.track.waypoints || this.track.waypoints.length < 2) return;

        // Initialize scalar distance along track if needed
        if (this.trackDistance === null) {
            const prog = this.track.getProgress(this.car);
            this.trackDistance = prog ? prog.distance : 0;
        }

        // 1) Estimate curvature ahead using track geometry
        const lookAheadDist = 200 + Math.abs(this.car.speed) * 15;
        const pNow = this.track.getPointAtDistance(this.trackDistance);
        const pAhead = this.track.getPointAtDistance(this.trackDistance + lookAheadDist);
        let curveFactor = 0;

        if (pNow && pAhead) {
            let angDiff = pAhead.angle - pNow.angle;
            while (angDiff <= -Math.PI) angDiff += Math.PI * 2;
            while (angDiff > Math.PI) angDiff -= Math.PI * 2;
            curveFactor = Math.min(1, Math.abs(angDiff) / (Math.PI / 3)); // up to 60° change
        }

        // 2) Speed control: fast on straights, slower in heavy turns
        // Keep AI top speed below absolute max so they don't massively outpace player
        // Match internal speed scale of player: keep AI comfortably below player's
        // maximum straight-line speed so they don't feel superhuman.
        const straightMax = this.car.maxSpeed * 0.5;
        const cornerMax = straightMax * 0.4;
        const targetSpeed = straightMax - (straightMax - cornerMax) * curveFactor;

        if (this.car.speed < targetSpeed) {
            this.car.speed += this.car.acceleration * this.skill;
        } else if (this.car.speed > targetSpeed * 1.05) {
            this.car.speed *= 0.98; // gentle braking / drag
        }

        if (this.car.speed < 0) this.car.speed = 0;

        // 3) Advance along track
        this.trackDistance += this.car.speed;

        // 4) Place car on track centerline and align heading with tangent
        const pos = this.track.getPointAtDistance(this.trackDistance);
        if (pos) {
            this.car.x = pos.x;
            this.car.y = pos.y;

            // Convert track tangent angle (θ, where (cosθ, sinθ) is forward)
            // to the game/drawing angle where 0 = facing up.
            // Rotating the car by θ + π/2 aligns its nose with the tangent.
            this.car.angle = pos.angle + Math.PI / 2;
        }
    }

    drawDebug(ctx) {
        // Draw Lookahead Point
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.lookAheadPoint.x, this.lookAheadPoint.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw Projected Point
        const trackState = this.getTrackState();
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(trackState.projectedPoint.x, trackState.projectedPoint.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw Steering Vector (from car)
        // We need to recalculate or store the steering vector to draw it
        // For now, just drawing the target line
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(this.car.x, this.car.y);
        ctx.lineTo(this.lookAheadPoint.x, this.lookAheadPoint.y);
        ctx.stroke();
    }
}
