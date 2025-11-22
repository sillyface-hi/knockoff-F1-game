class Track {
    constructor(trackData) {
        this.data = trackData;
        this.waypoints = trackData.waypoints;
        this.laps = trackData.laps;
        this.racingLine = trackData.racingLine;

        // Pre-compute segment lengths so we can measure continuous progress
        this.precomputeLengths();
        // Pre-compute an ideal racing line polyline based on waypoints + offsets
        this.buildIdealLine();
    }

    precomputeLengths() {
        const wps = this.waypoints || [];
        const n = wps.length;
        this.segmentLengths = [];
        this.cumulativeLengths = [];
        let total = 0;

        for (let i = 0; i < n; i++) {
            const p1 = wps[i];
            const p2 = wps[(i + 1) % n];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy);
            this.segmentLengths[i] = len;
            this.cumulativeLengths[i] = total;
            total += len;
        }

        this.totalLength = total || 1; // avoid divide-by-zero
    }

    // Build an ideal line to follow (centerline + optional racingLine offsets)
    buildIdealLine() {
        const wps = this.waypoints || [];
        const n = wps.length;
        this.idealLine = [];
        if (n < 2) return;

        // For robustness, AI follows the centerline (raw waypoints).
        // Racing line offsets can be reintroduced later once boundary tests pass.
        for (let i = 0; i < n; i++) {
            const p = wps[i];
            this.idealLine.push({ x: p.x, y: p.y });
        }
    }

    /**
     * Returns a car's continuous progress along the loop:
     * { distance, normalized (0–1), segmentIndex }
     */
    getProgress(car) {
        if (!this.waypoints || this.waypoints.length === 0) return null;
        const wps = this.waypoints;
        const n = wps.length;

        let bestIndex = 0;
        let bestDistSq = Infinity;
        let bestT = 0;
        let bestPoint = null;

        const x = car.x;
        const y = car.y;

        for (let i = 0; i < n; i++) {
            const p1 = wps[i];
            const p2 = wps[(i + 1) % n];

            const x1 = p1.x;
            const y1 = p1.y;
            const x2 = p2.x;
            const y2 = p2.y;

            const A = x - x1;
            const B = y - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const lenSq = C * C + D * D;
            if (lenSq === 0) continue;

            let t = (A * C + B * D) / lenSq;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            const xx = x1 + t * C;
            const yy = y1 + t * D;
            const dx = x - xx;
            const dy = y - yy;
            const distSq = dx * dx + dy * dy;

            if (distSq < bestDistSq) {
                bestDistSq = distSq;
                bestIndex = i;
                bestT = t;
                bestPoint = { x: xx, y: yy };
            }
        }

        const segLen = this.segmentLengths[bestIndex] || 0;
        const base = this.cumulativeLengths[bestIndex] || 0;
        const distance = base + bestT * segLen;
        const normalized = distance / this.totalLength;

        return { distance, normalized, segmentIndex: bestIndex, point: bestPoint };
    }

    /**
     * Returns a point and heading on the track centerline at a given distance
     * along the loop.
     */
    getPointAtDistance(distance) {
        if (!this.waypoints || this.waypoints.length === 0) return null;
        const total = this.totalLength || 1;
        let d = distance % total;
        if (d < 0) d += total;

        const wps = this.waypoints;
        const n = wps.length;

        let segIndex = 0;
        for (let i = 0; i < n; i++) {
            const base = this.cumulativeLengths[i];
            const segLen = this.segmentLengths[i] || 0;
            if (d >= base && d <= base + segLen) {
                segIndex = i;
                break;
            }
        }

        const base = this.cumulativeLengths[segIndex];
        const segLen = this.segmentLengths[segIndex] || 1;
        const t = (d - base) / segLen;

        const p1 = wps[segIndex];
        const p2 = wps[(segIndex + 1) % n];
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        return { x, y, angle, segmentIndex: segIndex, t, distance: d };
    }

    // Draw the track and optional debug overlays
    draw(ctx) {
        // Draw Track Surface
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // 1. Draw Kerbs/Edge
        ctx.beginPath();
        this.waypoints.forEach((wp, i) => {
            if (i === 0) ctx.moveTo(wp.x, wp.y);
            else ctx.lineTo(wp.x, wp.y);
        });
        ctx.closePath();
        ctx.lineWidth = this.waypoints[0].width + 40; // Kerbs width
        ctx.strokeStyle = '#cc0000'; // Red kerb base
        ctx.stroke();

        ctx.setLineDash([20, 20]);
        ctx.strokeStyle = '#ffffff'; // White kerb dashes
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Draw Tarmac
        ctx.beginPath();
        this.waypoints.forEach((wp, i) => {
            if (i === 0) ctx.moveTo(wp.x, wp.y);
            else ctx.lineTo(wp.x, wp.y);
        });
        ctx.closePath();
        ctx.lineWidth = this.waypoints[0].width;
        ctx.strokeStyle = '#333'; // Dark Tarmac
        ctx.stroke();

        // 3. Draw Start/Finish Line
        const start = this.waypoints[0];
        const next = this.waypoints[1];
        const angle = Math.atan2(next.y - start.y, next.x - start.x);
        ctx.save();
        ctx.translate(start.x, start.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#fff';
        const checkSize = 20;
        const width = start.width;
        for (let i = -width / 2; i < width / 2; i += checkSize) {
            if ((i / checkSize) % 2 === 0) ctx.fillRect(0, i, checkSize, checkSize);
            else ctx.fillRect(checkSize, i, checkSize, checkSize);
        }
        ctx.restore();

        // Optional debug start marker (controlled via a flag on the context)
        if (ctx.debugStart) {
            this.drawDebugStart(ctx);
        }
    }

    // Helper to get spawn position on grid
    getGridPosition(index) {
        // Approx. one car length between rows (cars are ~40px long)
        const rowSpacing = 50;
        const colSpacing = 30;
        const row = Math.floor(index / 2);
        const col = index % 2 === 0 ? -1 : 1; // Left or Right side
        let distBack = 200 + row * rowSpacing;
        // Walk backwards from start node
        let currentWpIdx = 0;
        let prevWpIdx = this.waypoints.length - 2; // last before duplicate start
        let p1 = this.waypoints[currentWpIdx];
        let p2 = this.waypoints[prevWpIdx];
        let segmentLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        while (distBack > segmentLen) {
            distBack -= segmentLen;
            currentWpIdx = prevWpIdx;
            prevWpIdx = (prevWpIdx - 1 + this.waypoints.length - 1) % (this.waypoints.length - 1);
            p1 = this.waypoints[currentWpIdx];
            p2 = this.waypoints[prevWpIdx];
            segmentLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        }
        const angleBack = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const centerX = p1.x + Math.cos(angleBack) * distBack;
        const centerY = p1.y + Math.sin(angleBack) * distBack;
        const carAngle = angleBack + Math.PI;
        const x = centerX + Math.cos(carAngle + Math.PI / 2) * (col * colSpacing);
        const y = centerY + Math.sin(carAngle + Math.PI / 2) * (col * colSpacing);
        return { x, y, angle: carAngle };
    }

    // Check if a point is on the track
    isOnTrack(x, y) {
        let minDst = Infinity;
        const r = this.waypoints[0].width / 2; // Half width
        for (let i = 0; i < this.waypoints.length; i++) {
            const p1 = this.waypoints[i];
            const p2 = this.waypoints[(i + 1) % this.waypoints.length];
            const dst = this.distToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (dst < minDst) minDst = dst;
        }
        return minDst <= r;
    }

    // Distance from point to segment
    distToSegment(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Helper to check if a car is near the start/finish line
    isNearStartLine(car, threshold = 30) {
        const start = this.waypoints[0];
        const next = this.waypoints[1];
        const dist = this.distToSegment(car.x, car.y, start.x, start.y, next.x, next.y);
        return dist <= threshold;
    }

    // Debug draw start line marker (optional)
    drawDebugStart(ctx) {
        const start = this.waypoints[0];
        ctx.save();
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(start.x, start.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
