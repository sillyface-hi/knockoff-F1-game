class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        // Input handling
        this.input = new InputHandler();

        // Game state
        this.state = 'MENU'; // MENU, TRACK_SELECT, RACE, FINISHED
        this.camera = { x: 0, y: 0 };
        this.lastTime = 0;

        // Track placeholder – will be replaced when a track is loaded
        this.track = null;
        this.cars = [];
        this.player = null;
        this.selectedDriverId = null;

        // Minimap
        this.minimap = null;

        // Lap timing
        this.currentLapStartTime = null;
        this.currentLapTime = 0;
        this.bestLapTime = Infinity;

        // Debug flag – set to true in main.js if you want start‑line overlay
        this.debugStart = false;

        // Audio – engine sound for player only
        this.engineSound = null;

        // Race start lights / formation
        this.raceStarted = false;
        this.startSequenceStart = null;
        this.startLightsCount = 0; // 0–5 red lights on
        this.startLightsOff = false;
        this.startRandomDelay = 0;
        this.raceStartTime = null; // timestamp when lights go out

        console.log('Game initialized');

        // Load high‑resolution tracks if the loader exists
        if (window.loadTracksFromGeoJSON) {
            window.loadTracksFromGeoJSON(() => {
                if (this.state === 'TRACK_SELECT') this.showTrackSelection();
            });
        }

        this.setupUI();
    }

    // ---------------------------------------------------------------------
    // UI setup
    // ---------------------------------------------------------------------
    setupUI() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.showTrackSelection();
            });
        }
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.resetGame();
            });
        }
    }

    showTrackSelection() {
        const menu = document.getElementById('main-menu');
        const trackSelect = document.getElementById('track-selection');
        if (menu) {
            menu.classList.remove('active');
            menu.classList.add('hidden');
        }
        if (trackSelect) {
            trackSelect.classList.remove('hidden');
            trackSelect.classList.add('active');
            this.state = 'TRACK_SELECT';
        }
        const trackList = document.getElementById('track-list');
        if (trackList) {
            trackList.innerHTML = '';
            window.TRACKS.forEach(track => {
                const card = document.createElement('div');
                card.className = 'track-card';
                card.innerHTML = `<h3>${track.name}</h3><p>${track.laps} Laps</p>`;
                card.addEventListener('click', () => this.loadTrack(track));
                trackList.appendChild(card);
            });
        }
    }

    loadTrack(trackData) {
        this.track = new Track(trackData);
        this.showDriverSelection();
    }

    showDriverSelection() {
        const trackSelect = document.getElementById('track-selection');
        const driverSelect = document.getElementById('driver-selection');
        if (trackSelect) {
            trackSelect.classList.remove('active');
            trackSelect.classList.add('hidden');
        }
        if (driverSelect) {
            driverSelect.classList.remove('hidden');
            driverSelect.classList.add('active');
            this.state = 'DRIVER_SELECT';
        }

        const driverList = document.getElementById('driver-list');
        if (driverList) {
            driverList.innerHTML = '';

            const allDrivers = [];
            window.TEAMS.forEach(team => {
                team.drivers.forEach(driver => {
                    const driverId = `${team.id}-${driver.number}`;
                    allDrivers.push({
                        id: driverId,
                        name: driver.name,
                        number: driver.number,
                        teamName: team.name,
                        teamColor: team.color
                    });
                });
            });

            allDrivers.forEach(driver => {
                const card = document.createElement('div');
                card.className = 'driver-card';
                card.innerHTML = `
                    <div class="driver-name">${driver.name}</div>
                    <div class="driver-team" style="color:${driver.teamColor}">${driver.teamName}</div>
                    <div class="driver-number">#${driver.number}</div>
                `;
                card.addEventListener('click', () => {
                    this.selectedDriverId = driver.id;
                    if (window.MenuSound) MenuSound.playClick();
                    this.startGame();
                });
                driverList.appendChild(card);
            });
        }
    }

    startGame() {
        const trackSelect = document.getElementById('track-selection');
        const driverSelect = document.getElementById('driver-selection');
        const hud = document.getElementById('hud');
        if (trackSelect) {
            trackSelect.classList.remove('active');
            trackSelect.classList.add('hidden');
        }
        if (driverSelect) {
            driverSelect.classList.remove('active');
            driverSelect.classList.add('hidden');
        }
        if (hud) {
            hud.classList.remove('hidden');
            hud.classList.add('active');
        }
        // Init engine sound & starting lights on first race (after user interaction)
        if (!this.engineSound && window.EngineSound) {
            this.engineSound = new EngineSound();
        }
        this.raceStarted = false;
        this.startSequenceStart = performance.now();
        this.startLightsCount = 0;
        this.startLightsOff = false;
        this.raceStartTime = null;
        // F1-style: 5 reds on at 1s intervals, then random delay before lights out
        this.startRandomDelay = 1000 + Math.random() * 1500; // 1.0s–2.5s after 5th light
        // Create cars for this track
        this.cars = [];
        this.createCars();
        // Ensure all cars are oriented along the local track direction at their grid slot
        if (this.track && this.track.waypoints && this.track.waypoints.length > 1) {
            this.cars.forEach(car => {
                const prog = this.track.getProgress(car);
                if (prog) {
                    const wps = this.track.waypoints;
                    const idx = prog.segmentIndex;
                    const p1 = wps[idx];
                    const p2 = wps[(idx + 1) % wps.length];
                    const segAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                    // Convert tangent angle to game/drawing angle (0 = up)
                    car.angle = segAngle + Math.PI / 2;
                }
            });
        }
        // Minimap
        this.minimap = new Minimap(this.track);
        // Reset lap timing for a fresh race
        this.currentLapStartTime = null;
        this.currentLapTime = 0;
        this.bestLapTime = Infinity;
        // Switch to race state
        this.state = 'RACE';
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    resetGame() {
        location.reload();
    }

    // ---------------------------------------------------------------------
    // Car creation
    // ---------------------------------------------------------------------
    createCars() {
        // Flatten driver list
        const allDrivers = [];
        window.TEAMS.forEach(team => {
            team.drivers.forEach(driver => {
                const driverId = `${team.id}-${driver.number}`;
                allDrivers.push({
                    ...driver,
                    teamColor: team.color,
                    teamId: team.id,
                    driverNumber: driver.number,
                    driverId: driverId
                });
            });
        });
        // Random grid order
        allDrivers.sort(() => Math.random() - 0.5);

        // Decide which driver is the player:
        // - If user selected a driver, use that
        // - Otherwise, default to the last entry (as before)
        let playerIndex = allDrivers.length - 1;
        if (this.selectedDriverId) {
            const idx = allDrivers.findIndex(d => d.driverId === this.selectedDriverId);
            if (idx !== -1) {
                playerIndex = idx;
            }
        }

        // Create car objects
        allDrivers.forEach((driver, i) => {
            const startPos = this.track.getGridPosition(i);
            const isPlayer = i === playerIndex;
            const car = new Car(startPos.x, startPos.y, driver.teamColor, isPlayer);
            car.angle = startPos.angle;
            car.driverName = driver.name;
            car.driverNumber = driver.driverNumber;
            car.teamId = driver.teamId;
            car.tire = 'SOFT';
            if (isPlayer) {
                this.player = car;
            } else {
                car.ai = new AI(car, this.track);
                car.tire = Math.random() > 0.5 ? 'SOFT' : 'HARD';
            }
            this.cars.push(car);
        });
    }

    // ---------------------------------------------------------------------
    // Weather (placeholder)
    // ---------------------------------------------------------------------
    updateWeather() {
        this.weather = 'SUNNY';
        this.rainIntensity = 0;
    }

    // ---------------------------------------------------------------------
    // Main loop
    // ---------------------------------------------------------------------
    start() {
        this.loop(0);
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.update(deltaTime);
        this.render();
        requestAnimationFrame(t => this.loop(t));
    }

    update(deltaTime) {
        if (this.state === 'MENU') {
            // nothing for now
        } else if (this.state === 'RACE') {
            this.updateWeather();

            // Handle F1-style start light sequence before allowing cars to move
            if (!this.raceStarted && this.startSequenceStart !== null) {
                const now = performance.now();
                const elapsed = now - this.startSequenceStart;
                const interval = 1000; // 1 second per light

                // Lights 1..5 come on at 1s,2s,3s,4s,5s
                const lightsOn = Math.max(0, Math.min(5, Math.floor(elapsed / interval)));
                this.startLightsCount = lightsOn;

                const allOnTime = 5 * interval;
                if (!this.startLightsOff && elapsed >= allOnTime + this.startRandomDelay) {
                    // Lights out → race start
                    this.raceStarted = true;
                    this.startLightsOff = true;
                    this.startLightsCount = 0;
                    this.raceStartTime = now;
                }
            }

            this.cars.forEach(car => {
                // Only allow movement once raceStarted is true
                const raceActive = this.raceStarted;
                car.update(this.input, deltaTime, this.track, this.cars, this.weather, raceActive);
            });
            if (this.player) {
                this.camera.x = this.player.x - this.width / 2;
                this.camera.y = this.player.y - this.height / 2;
                this.updateHUD();
            }
        }
    }

    // ---------------------------------------------------------------------
    // Lap detection, timing & position ordering
    // ---------------------------------------------------------------------
    checkLaps() {
        if (!this.track || !this.cars || this.cars.length === 0) return;

        this.cars.forEach(car => {
            const prog = this.track.getProgress(car);
            if (!prog) return;

            car.progress = prog.distance;
            const norm = prog.normalized; // 0–1 around loop

            // Detect wrap from end-of-lap to start-of-lap to count a new lap
            if (car.lastProgressNorm !== null) {
                const prev = car.lastProgressNorm;
                const crossedStartForward = prev > 0.7 && norm < 0.3;

                if (crossedStartForward) {
                    car.lap++;

                    // Player-specific timing and race end logic
                    if (car === this.player) {
                        if (this.currentLapStartTime !== null && this.player.lap > 1) {
                            this.currentLapTime = Date.now() - this.currentLapStartTime;
                            if (this.currentLapTime < this.bestLapTime) {
                                this.bestLapTime = this.currentLapTime;
                            }
                        }
                        this.currentLapStartTime = Date.now();
                        if (this.player.lap > this.track.laps) {
                            this.endRace();
                        }
                    }
                }
            }

            car.lastProgressNorm = norm;
        });

        // Position ordering: higher lap first, then further progress on that lap
        this.cars.sort((a, b) => {
            if (a.lap !== b.lap) return b.lap - a.lap;
            return (b.progress || 0) - (a.progress || 0);
        });

        if (this.player) {
            this.player.position = this.cars.indexOf(this.player) + 1;
        }
    }

    // ---------------------------------------------------------------------
    // Race finish
    // ---------------------------------------------------------------------
    endRace() {
        this.state = 'FINISHED';
        const hud = document.getElementById('hud');
        const resultsScreen = document.getElementById('results-screen');
        if (hud) hud.classList.add('hidden');
        if (resultsScreen) {
            resultsScreen.classList.remove('hidden');
            resultsScreen.classList.add('active');
            const list = document.getElementById('results-list');
            list.innerHTML = '';
            this.cars.slice(0, 10).forEach((car, i) => {
                const row = document.createElement('div');
                row.className = 'result-row';
                row.innerHTML = `
                    <span class="pos">${i + 1}</span>
                    <span class="name">${car.driverName}</span>
                    <span class="team" style="color:${car.color}">■</span>
                `;
                list.appendChild(row);
            });
        }
    }

    // ---------------------------------------------------------------------
    // HUD update – includes lap counter and timer
    // ---------------------------------------------------------------------
    updateHUD() {
        this.checkLaps();
        const posDisplay = document.getElementById('pos-display');
        if (posDisplay) posDisplay.innerHTML = `${this.player.position}<span class="total">/22</span>`;
        const lapDisplay = document.getElementById('lap-display');
        if (lapDisplay) {
            lapDisplay.innerHTML = `${Math.min(this.player.lap, this.track.laps)}<span class="total">/${this.track.laps}</span>`;
        }
        const speedDisplay = document.getElementById('speed-display');
        if (speedDisplay) {
            // Internal speed has been scaled down by ~2x; convert to MPH with a higher factor
            // so the displayed top speed remains similar to before (~230 mph).
            const speedMPH = Math.abs(Math.round(this.player.speed * 30));
            speedDisplay.innerText = speedMPH;
            document.querySelector('.unit').innerText = 'MPH';
        }
        const gearDisplay = document.getElementById('gear-display');
        if (gearDisplay) {
            const s = Math.abs(this.player.speed);
            let g = 'N';
            // Thresholds scaled for new internal speed range, now with 8 forward gears.
            if (s > 0.05) g = '1';
            if (s > 1.3) g = '2';
            if (s > 2.6) g = '3';
            if (s > 3.9) g = '4';
            if (s > 5.0) g = '5';
            if (s > 6.0) g = '6';
            if (s > 7.0) g = '7';
            if (s > 7.6) g = '8';
            gearDisplay.innerText = g;

            // Update engine sound for player only
            if (this.engineSound) {
                const throttlePressed = !!(this.input && this.input.keys && this.input.keys.ArrowUp);
                this.engineSound.setState(this.player.speed, g, throttlePressed);
            }
        }
        const tireIcon = document.getElementById('tire-icon');
        if (tireIcon) {
            tireIcon.className = `tire-${this.player.tire.toLowerCase()}`;
            tireIcon.innerText = this.player.tire[0];
        }

        // Update start lights UI
        const lightsContainer = document.getElementById('start-lights');
        if (lightsContainer) {
            // Hide the entire start light rig 5 seconds after race start
            if (this.raceStartTime && performance.now() - this.raceStartTime > 5000) {
                lightsContainer.style.display = 'none';
            } else {
                lightsContainer.style.display = 'flex';
                const lights = lightsContainer.querySelectorAll('.start-light');
                lights.forEach((light, idx) => {
                    if (!this.startLightsOff && idx < this.startLightsCount) {
                        light.classList.add('on');
                    } else {
                        light.classList.remove('on');
                    }
                });
            }
        }
        // Lap timer display
        const lapTimeDisplay = document.getElementById('lap-time-display');
        if (lapTimeDisplay && this.currentLapStartTime !== null) {
            const elapsed = Date.now() - this.currentLapStartTime;
            const m = Math.floor(elapsed / 60000);
            const s = Math.floor((elapsed % 60000) / 1000);
            const ms = Math.floor(elapsed % 1000);
            lapTimeDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        }
    }

    // ---------------------------------------------------------------------
    // Rendering
    // ---------------------------------------------------------------------
    render() {
        this.ctx.fillStyle = this.weather === 'SUNNY' ? '#056608' : '#034405';
        this.ctx.fillRect(0, 0, this.width, this.height);
        if (this.state === 'RACE') {
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            if (this.track) this.track.draw(this.ctx);
            this.cars.forEach(car => car.draw(this.ctx));

            // Driver label (number + name) above each car, aligned to screen
            this.ctx.font = '12px Outfit, Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.cars.forEach(car => {
                const label = car.driverNumber
                    ? `${car.driverNumber} ${car.driverName || ''}`
                    : (car.driverName || '');
                if (!label) return;

                const paddingX = 6;
                const paddingY = 3;
                const textWidth = this.ctx.measureText(label).width;
                const boxWidth = textWidth + paddingX * 2;
                const boxHeight = 14 + paddingY * 2;
                const boxX = car.x - boxWidth / 2;
                const boxY = car.y - car.height / 2 - boxHeight - 4;

                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(label, car.x, boxY + boxHeight - paddingY);
            });
            // Optional debug start line marker – controlled via this.debugStart
            if (this.debugStart && this.track) this.track.drawDebugStart(this.ctx);
            if (this.weather === 'RAIN') {
                this.ctx.fillStyle = 'rgba(200,200,255,0.1)';
                this.ctx.fillRect(this.camera.x, this.camera.y, this.width, this.height);
            }
            this.ctx.restore();
        }
        if (this.state === 'RACE' && this.minimap) {
            this.minimap.render(this.cars, this.player);
        }
    }
}
