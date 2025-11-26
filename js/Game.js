class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        // Input handling
        this.input = new InputHandler();

        // Game state
        this.state = 'MENU'; // MENU, TRACK_SELECT, DRIVER_SELECT, TYRE_SELECT, RACE, FINISHED
        this.camera = { x: 0, y: 0 };
        this.lastTime = 0;

        // Track placeholder – will be replaced when a track is loaded
        this.track = null;
        this.cars = [];
        this.player = null;
        this.selectedDriverId = null;
        this.selectedTire = 'SOFT';
        this.gameMode = 'race'; // 'race', 'time_trials', or 'leaderboard'
        this.sharePromptOpen = false;
        this.saveKeyHandled = false;

        // Minimap
        this.minimap = null;

        // Lap timing
        this.currentLapStartTime = null;
        this.currentLapTime = 0;
        this.bestLapTime = Infinity;
        this.lapHistory = []; // Array of completed lap times

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
        const raceBtn = document.getElementById('race-btn');
        if (raceBtn) {
            raceBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.gameMode = 'race';
                this.showTrackSelection();
            });
        }
        const timeTrialsBtn = document.getElementById('time-trials-btn');
        if (timeTrialsBtn) {
            timeTrialsBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.gameMode = 'time_trials';
                this.showTrackSelection();
            });
        }
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.gameMode = 'leaderboard';
                this.showTrackSelection();
            });
        }
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.goToMainMenu();
            });
        }

        // Back / main menu buttons for selection screens
        const trackBackBtn = document.getElementById('track-back-btn');
        if (trackBackBtn) {
            trackBackBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.backFromTrack();
            });
        }
        const trackMainBtn = document.getElementById('track-main-btn');
        if (trackMainBtn) {
            trackMainBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.goToMainMenu();
            });
        }

        const driverBackBtn = document.getElementById('driver-back-btn');
        if (driverBackBtn) {
            driverBackBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.backFromDriver();
            });
        }
        const driverMainBtn = document.getElementById('driver-main-btn');
        if (driverMainBtn) {
            driverMainBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.goToMainMenu();
            });
        }

        const tyreBackBtn = document.getElementById('tyre-back-btn');
        if (tyreBackBtn) {
            tyreBackBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.backFromTyre();
            });
        }
        const tyreMainBtn = document.getElementById('tyre-main-btn');
        if (tyreMainBtn) {
            tyreMainBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.goToMainMenu();
            });
        }

        const shareCancelBtn = document.getElementById('share-cancel-btn');
        if (shareCancelBtn) {
            shareCancelBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.hideShareTimePrompt();
            });
        }
        const shareOkBtn = document.getElementById('share-ok-btn');
        if (shareOkBtn) {
            shareOkBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.confirmShareTime();
            });
        }
    }

    backFromTrack() {
        const menu = document.getElementById('main-menu');
        const trackSelect = document.getElementById('track-selection');
        if (trackSelect) {
            trackSelect.classList.remove('active');
            trackSelect.classList.add('hidden');
        }
        if (menu) {
            menu.classList.remove('hidden');
            menu.classList.add('active');
        }
        this.state = 'MENU';
        this.track = null;
    }

    backFromDriver() {
        const trackSelect = document.getElementById('track-selection');
        const driverSelect = document.getElementById('driver-selection');
        if (driverSelect) {
            driverSelect.classList.remove('active');
            driverSelect.classList.add('hidden');
        }
        if (trackSelect) {
            trackSelect.classList.remove('hidden');
            trackSelect.classList.add('active');
        }
        this.state = 'TRACK_SELECT';
        this.selectedDriverId = null;
    }

    backFromTyre() {
        const driverSelect = document.getElementById('driver-selection');
        const tyreSelect = document.getElementById('tyre-selection');
        if (tyreSelect) {
            tyreSelect.classList.remove('active');
            tyreSelect.classList.add('hidden');
        }
        if (driverSelect) {
            driverSelect.classList.remove('hidden');
            driverSelect.classList.add('active');
        }
        this.state = 'DRIVER_SELECT';
        this.selectedTire = 'SOFT';
    }

    goToMainMenu() {
        const menu = document.getElementById('main-menu');
        const trackSelect = document.getElementById('track-selection');
        const driverSelect = document.getElementById('driver-selection');
        const tyreSelect = document.getElementById('tyre-selection');
        const leaderboardScreen = document.getElementById('leaderboard-screen');
        const shareScreen = document.getElementById('share-time-screen');
        const hud = document.getElementById('hud');
        const results = document.getElementById('results-screen');

        [trackSelect, driverSelect, tyreSelect, leaderboardScreen, shareScreen, hud, results].forEach(el => {
            if (!el) return;
            el.classList.remove('active');
            el.classList.add('hidden');
        });
        if (menu) {
            menu.classList.remove('hidden');
            menu.classList.add('active');
        }

        // Reset basic game state
        this.state = 'MENU';
        this.track = null;
        this.cars = [];
        this.player = null;
        this.selectedDriverId = null;
        this.selectedTire = 'SOFT';
        this.gameMode = 'race';
        this.sharePromptOpen = false;
        this.saveKeyHandled = false;
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
                // In time trials and leaderboard, don't show lap count
                if (this.gameMode === 'time_trials' || this.gameMode === 'leaderboard') {
                    card.innerHTML = `<h3>${track.name}</h3>`;
                } else {
                    card.innerHTML = `<h3>${track.name}</h3><p>${track.laps} Laps</p>`;
                }
                card.addEventListener('click', () => {
                    if (this.gameMode === 'leaderboard') {
                        this.showLeaderboardForTrack(track);
                    } else {
                        this.loadTrack(track);
                    }
                });
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
                    // In time trials, skip tire selection and use soft tires
                    if (this.gameMode === 'time_trials') {
                        this.selectedTire = 'SOFT';
                        this.startGame();
                    } else {
                        this.showTyreSelection();
                    }
                });
                driverList.appendChild(card);
            });
        }
    }

    showTyreSelection() {
        const driverSelect = document.getElementById('driver-selection');
        const tyreSelect = document.getElementById('tyre-selection');

        if (driverSelect) {
            driverSelect.classList.remove('active');
            driverSelect.classList.add('hidden');
        }
        if (tyreSelect) {
            tyreSelect.classList.remove('hidden');
            tyreSelect.classList.add('active');
            this.state = 'TYRE_SELECT';
        }

        const tyreList = document.getElementById('tyre-list');
        if (tyreList) {
            tyreList.innerHTML = '';

            const tyres = [
                { id: 'SOFT', label: 'Soft', colorClass: 'tire-soft', description: 'Fastest, most grip, wears quickly', short: 'S' },
                { id: 'MEDIUM', label: 'Medium', colorClass: 'tire-medium', description: 'Balanced pace and durability', short: 'M' },
                { id: 'HARD', label: 'Hard', colorClass: 'tire-hard', description: 'Slower, high durability', short: 'H' },
                { id: 'INTER', label: 'Intermediate', colorClass: 'tire-inter', description: 'For light rain / damp track', short: 'I' },
                { id: 'WET', label: 'Wet', colorClass: 'tire-wet', description: 'For heavy rain conditions', short: 'W' }
            ];

            tyres.forEach(tire => {
                const card = document.createElement('div');
                card.className = 'tyre-card';
                card.innerHTML = `
                    <div class="tyre-circle ${tire.colorClass}">${tire.short}</div>
                    <div class="tyre-info">
                        <div class="tyre-label">${tire.label}</div>
                        <div class="tyre-description">${tire.description}</div>
                    </div>
                `;
                card.addEventListener('click', () => {
                    this.selectedTire = tire.id;
                    if (window.MenuSound) MenuSound.playClick();
                    this.startGame();
                });
                tyreList.appendChild(card);
            });
        }
    }

    startGame() {
        const trackSelect = document.getElementById('track-selection');
        const driverSelect = document.getElementById('driver-selection');
        const tyreSelect = document.getElementById('tyre-selection');
        const hud = document.getElementById('hud');
        if (trackSelect) {
            trackSelect.classList.remove('active');
            trackSelect.classList.add('hidden');
        }
        if (driverSelect) {
            driverSelect.classList.remove('active');
            driverSelect.classList.add('hidden');
        }
        if (tyreSelect) {
            tyreSelect.classList.remove('active');
            tyreSelect.classList.add('hidden');
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
        this.lastLapWasPB = false; // Track if last completed lap was a personal best
        this.lapHistory = []; // Reset lap history
        this.currentLapInvalid = false; // Track if current lap exceeded track limits
        this.offTrackTime = 0; // Cumulative time spent off track this lap (ms)
        // Ghost car recording for time trials
        this.currentLapRecording = []; // Array of {x, y, angle, time} for current lap
        this.bestLapRecording = null; // Recording from best lap
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

        // In time trials mode, only create the player car
        if (this.gameMode === 'time_trials') {
            const playerDriver = allDrivers[playerIndex];
            const startPos = this.track.getGridPosition(0); // Pole position for time trials
            const car = new Car(startPos.x, startPos.y, playerDriver.teamColor, true);
            car.angle = startPos.angle;
            car.driverName = playerDriver.name;
            car.driverNumber = playerDriver.driverNumber;
            car.teamId = playerDriver.teamId;
            car.tire = this.selectedTire || 'SOFT';
            this.player = car;
            this.cars.push(car);
            return;
        }

        // Create car objects (race mode with AI)
        allDrivers.forEach((driver, i) => {
            const startPos = this.track.getGridPosition(i);
            const isPlayer = i === playerIndex;
            const car = new Car(startPos.x, startPos.y, driver.teamColor, isPlayer);
            car.angle = startPos.angle;
            car.driverName = driver.name;
            car.driverNumber = driver.driverNumber;
            car.teamId = driver.teamId;
            // Player gets the selected tire; AI get a simple random strategy
            if (isPlayer) {
                car.tire = this.selectedTire || 'SOFT';
                this.player = car;
            } else {
                car.ai = new AI(car, this.track);
                const aiTyres = ['SOFT', 'MEDIUM', 'HARD', 'INTER', 'WET'];
                car.tire = aiTyres[Math.floor(Math.random() * aiTyres.length)];
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

            // Check track limits for time trials
            if (this.gameMode === 'time_trials' && this.player && this.track && this.raceStarted) {
                if (!this.track.isOnTrack(this.player.x, this.player.y)) {
                    this.offTrackTime += deltaTime;
                    // Invalidate lap if off track for more than 0.5 seconds
                    if (this.offTrackTime >= 500) {
                        this.currentLapInvalid = true;
                    }
                }
                
                // Record player position for ghost car
                if (this.currentLapStartTime !== null) {
                    const elapsed = Date.now() - this.currentLapStartTime;
                    this.currentLapRecording.push({
                        x: this.player.x,
                        y: this.player.y,
                        angle: this.player.angle,
                        time: elapsed
                    });
                }
            }

            // Handle Save (S) key in time trials to open share prompt
            if (this.gameMode === 'time_trials' && this.input && this.input.keys) {
                if (this.input.keys.S) {
                    if (!this.saveKeyHandled && !this.sharePromptOpen && this.bestLapTime !== Infinity) {
                        this.showShareTimePrompt();
                        this.saveKeyHandled = true;
                    }
                } else {
                    this.saveKeyHandled = false;
                }
            }

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

            // Initialise tyre life once, based on compound
            if (car.tireLifeLaps == null) {
                const tire = car.tire || 'SOFT';
                let min = 10, max = 10;
                if (tire === 'SOFT') { min = 2; max = 4; }
                else if (tire === 'MEDIUM') { min = 6; max = 9; }
                else if (tire === 'HARD') { min = 9; max = 11; }
                else if (tire === 'INTER') { min = 3; max = 5; }
                else if (tire === 'WET') { min = 7; max = 13; }
                car.tireLifeLaps = min + Math.random() * (max - min);
            }
            if (car.tireWear == null) car.tireWear = 0;

            // Detect wrap from end-of-lap to start-of-lap to count a new lap
            if (car.lastProgressNorm !== null) {
                const prev = car.lastProgressNorm;
                const crossedStartForward = prev > 0.7 && norm < 0.3;

                if (crossedStartForward) {
                    car.lap++;

                    // Tyre wear per lap based on compound (skip in time trials)
                    if (this.gameMode !== 'time_trials') {
                        if (!car.tireWear) car.tireWear = 0;
                        if (!car.tireLifeLaps) {
                            const tire = car.tire || 'SOFT';
                            let min = 10, max = 10;
                            if (tire === 'SOFT') { min = 2; max = 4; }
                            else if (tire === 'MEDIUM') { min = 6; max = 9; }
                            else if (tire === 'HARD') { min = 9; max = 11; }
                            else if (tire === 'INTER') { min = 3; max = 5; }
                            else if (tire === 'WET') { min = 7; max = 13; }
                            car.tireLifeLaps = min + Math.random() * (max - min);
                        }
                        if (car.tireLifeLaps > 0) {
                            const wearDelta = 1 / car.tireLifeLaps;
                            car.tireWear = Math.min(1, car.tireWear + wearDelta);
                        }
                    }

                    // Player-specific timing and race end logic
                    if (car === this.player) {
                        if (this.currentLapStartTime !== null && this.player.lap > 1) {
                            this.currentLapTime = Date.now() - this.currentLapStartTime;
                            const lapWasInvalid = this.currentLapInvalid;
                            
                            // Store completed lap in history
                            this.lapHistory.push({
                                lapNum: this.player.lap - 1,
                                time: this.currentLapTime,
                                invalid: lapWasInvalid
                            });
                            
                            // Only update best time if lap was valid
                            if (!lapWasInvalid && this.currentLapTime < this.bestLapTime) {
                                this.bestLapTime = this.currentLapTime;
                                this.lastLapWasPB = true;
                                // Save the recording for ghost car (time trials only)
                                if (this.gameMode === 'time_trials') {
                                    this.bestLapRecording = [...this.currentLapRecording];
                                }
                            } else {
                                this.lastLapWasPB = false;
                            }
                        }
                        this.currentLapStartTime = Date.now();
                        this.currentLapInvalid = false; // Reset for new lap
                        this.offTrackTime = 0; // Reset off-track time for new lap
                        this.currentLapRecording = []; // Reset recording for new lap
                        // Only end race in race mode, time trials are unlimited
                        if (this.gameMode !== 'time_trials' && this.player.lap > this.track.laps) {
                            this.endRace();
                        }
                    }
                }
            }

            // Continuous tyre wear based on distance travelled along the track
            if (car.lastProgressNorm !== null && car.tireLifeLaps > 0 && this.track.totalLength) {
                let deltaNorm = norm - car.lastProgressNorm;
                // Handle wrap-around; ignore backwards movement
                if (deltaNorm < -0.5) deltaNorm += 1; // crossed 1 → 0
                if (deltaNorm < 0) deltaNorm = 0;
                const distanceDelta = deltaNorm * this.track.totalLength;
                const fullLifeDistance = this.track.totalLength * car.tireLifeLaps;
                if (fullLifeDistance > 0 && distanceDelta > 0) {
                    const wearDelta = distanceDelta / fullLifeDistance;
                    car.tireWear = Math.min(1, car.tireWear + wearDelta);
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
            
            // Update the heading based on game mode
            const heading = resultsScreen.querySelector('h2');
            if (heading) {
                heading.textContent = this.gameMode === 'time_trials' ? 'TIME TRIAL COMPLETE' : 'RACE FINISHED';
            }
            
            const list = document.getElementById('results-list');
            list.innerHTML = '';
            
            if (this.gameMode === 'time_trials') {
                // Show best lap time for time trials
                const row = document.createElement('div');
                row.className = 'result-row';
                const bestTime = this.bestLapTime === Infinity ? '--:--.---' : this.formatTime(this.bestLapTime);
                row.innerHTML = `
                    <span class="name">Best Lap Time</span>
                    <span class="time" style="color: var(--accent-color); font-weight: 700;">${bestTime}</span>
                `;
                list.appendChild(row);
            } else {
                // Show race positions
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
    }

    formatTime(ms) {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const millis = Math.floor(ms % 1000);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }

    showShareTimePrompt() {
        if (this.bestLapTime === Infinity) return;
        const shareScreen = document.getElementById('share-time-screen');
        const nameInput = document.getElementById('share-name-input');
        if (shareScreen) {
            shareScreen.classList.remove('hidden');
            shareScreen.classList.add('active');
            this.sharePromptOpen = true;
        }
        if (nameInput) {
            nameInput.classList.remove('invalid');
            // Clear for fresh entry each time
            nameInput.value = '';
        }
    }

    hideShareTimePrompt() {
        const shareScreen = document.getElementById('share-time-screen');
        if (shareScreen) {
            shareScreen.classList.remove('active');
            shareScreen.classList.add('hidden');
        }
        this.sharePromptOpen = false;
    }

    confirmShareTime() {
        if (this.bestLapTime === Infinity || !this.track || !this.player) {
            this.hideShareTimePrompt();
            return;
        }
        const nameInput = document.getElementById('share-name-input');
        let username = nameInput && nameInput.value ? nameInput.value.trim() : '';
        if (!username || username.length < 2) {
            if (nameInput) nameInput.classList.add('invalid');
            return; // require at least 2 letters
        }
        if (nameInput) nameInput.classList.remove('invalid');

        this.saveTimeTrialResult(this.track, this.player, this.bestLapTime, username);
        this.hideShareTimePrompt();
    }

    // ---------------------------------------------------------------------
    // Time Trial Leaderboard persistence
    // ---------------------------------------------------------------------
    saveTimeTrialResult(track, player, timeMs, username) {
        if (!track || !track.id || !player) return;
        const storageKey = 'f1_2026_leaderboards_v1';
        let data = {};
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) data = JSON.parse(raw) || {};
        } catch (e) {
            console.warn('Failed to read leaderboards from storage', e);
        }

        if (!data[track.id]) data[track.id] = {};

        const nameKey = username || player.driverName || 'Player';
        const existing = data[track.id][nameKey];
        if (!existing || timeMs < existing.timeMs) {
            data[track.id][nameKey] = {
                username: nameKey,
                driverName: player.driverName || null,
                timeMs: timeMs,
                teamId: player.teamId || null,
                color: player.color || '#ffffff'
            };
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save leaderboards to storage', e);
        }
    }

    loadLeaderboardEntries(trackId) {
        const storageKey = 'f1_2026_leaderboards_v1';
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return [];
            const data = JSON.parse(raw) || {};
            const trackBoard = data[trackId] || {};
            return Object.values(trackBoard).sort((a, b) => a.timeMs - b.timeMs);
        } catch (e) {
            console.warn('Failed to load leaderboards', e);
            return [];
        }
    }

    showLeaderboardForTrack(trackData) {
        const trackSelect = document.getElementById('track-selection');
        const leaderboardScreen = document.getElementById('leaderboard-screen');
        const nameEl = document.getElementById('leaderboard-track-name');
        const listEl = document.getElementById('leaderboard-list');

        if (trackSelect) {
            trackSelect.classList.remove('active');
            trackSelect.classList.add('hidden');
        }
        if (leaderboardScreen) {
            leaderboardScreen.classList.remove('hidden');
            leaderboardScreen.classList.add('active');
        }

        if (nameEl) {
            nameEl.textContent = trackData.name || 'Unknown Track';
        }

        if (listEl) {
            const entries = this.loadLeaderboardEntries(trackData.id);
            if (!entries.length) {
                listEl.innerHTML = `<div class="result-row"><span class="name">No time trial results yet for this track.</span></div>`;
            } else {
                listEl.innerHTML = '';
                entries.forEach((entry, index) => {
                    const row = document.createElement('div');
                    row.className = 'result-row';
                    const timeStr = this.formatTime(entry.timeMs);
                    const displayName = entry.username || entry.driverName || 'Player';
                    row.innerHTML = `
                        <span class="pos">${index + 1}</span>
                        <span class="name">${displayName}</span>
                        <span class="team" style="color:${entry.color || '#ffffff'}">■</span>
                        <span class="time">${timeStr}</span>
                    `;
                    listEl.appendChild(row);
                });
            }
        }

        // Wire up leaderboard back buttons (once)
        const backBtn = document.getElementById('leaderboard-back-btn');
        if (backBtn && !backBtn._handlerAttached) {
            backBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                // Return to track selection in leaderboard mode
                const lbScreen = document.getElementById('leaderboard-screen');
                const ts = document.getElementById('track-selection');
                if (lbScreen) {
                    lbScreen.classList.remove('active');
                    lbScreen.classList.add('hidden');
                }
                if (ts) {
                    ts.classList.remove('hidden');
                    ts.classList.add('active');
                    this.state = 'TRACK_SELECT';
                }
            });
            backBtn._handlerAttached = true;
        }

        const mainBtn = document.getElementById('leaderboard-main-btn');
        if (mainBtn && !mainBtn._handlerAttached) {
            mainBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.goToMainMenu();
            });
            mainBtn._handlerAttached = true;
        }
    }

    // ---------------------------------------------------------------------
    // HUD update – includes lap counter and timer
    // ---------------------------------------------------------------------
    updateHUD() {
        this.checkLaps();
        const posDisplay = document.getElementById('pos-display');
        const posBox = document.querySelector('.position-box');
        const lapDisplay = document.getElementById('lap-display');
        const lapBox = document.querySelector('.lap-box');
        
        if (this.gameMode === 'time_trials') {
            // Hide position and lap count in time trials
            if (posBox) posBox.style.display = 'none';
            if (lapBox) lapBox.style.display = 'none';
        } else {
            if (posBox) posBox.style.display = '';
            if (posDisplay) {
                const totalCars = this.cars.length;
                posDisplay.innerHTML = `${this.player.position}<span class="total">/${totalCars}</span>`;
            }
            if (lapBox) lapBox.style.display = '';
            if (lapDisplay) {
                lapDisplay.innerHTML = `${Math.min(this.player.lap, this.track.laps)}<span class="total">/${this.track.laps}</span>`;
            }
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
        const tireWeather = document.querySelector('.tire-weather');
        if (this.gameMode === 'time_trials') {
            // Hide tire display in time trials (no tire wear)
            if (tireWeather) tireWeather.style.display = 'none';
        } else {
            if (tireWeather) tireWeather.style.display = '';
            const tireIcon = document.getElementById('tire-icon');
            if (tireIcon) {
                tireIcon.className = `tire-${this.player.tire.toLowerCase()}`;
                tireIcon.innerText = this.player.tire[0];
            }
            const tireWearFill = document.getElementById('tire-wear-fill');
            if (tireWearFill) {
                const wear = this.player.tireWear || 0; // 0 fresh, 1 worn
                const remaining = Math.max(0, Math.min(1, 1 - wear));
                tireWearFill.style.height = `${remaining * 100}%`;
            }
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
        const lapTimesPanel = document.getElementById('lap-times-panel');
        
        if (this.gameMode === 'time_trials') {
            // Show the lap times panel in time trials
            if (lapTimesPanel) lapTimesPanel.style.display = '';
            
            // Update current lap time - green when valid, red when invalid
            if (lapTimeDisplay && this.currentLapStartTime !== null) {
                const elapsed = Date.now() - this.currentLapStartTime;
                lapTimeDisplay.textContent = this.formatTime(elapsed);
                lapTimeDisplay.style.color = this.currentLapInvalid ? '#ef4444' : '#22c55e'; // red or green
            }
            
            // Update lap history display with sticky best lap
            const lapHistoryEl = document.getElementById('lap-history');
            if (lapHistoryEl && this.lapHistory.length > 0) {
                // Find the best lap (only valid laps can be best)
                const bestLap = this.lapHistory.find(lap => !lap.invalid && lap.time === this.bestLapTime);
                
                // Get recent 4 laps excluding the best lap
                const recentLaps = this.lapHistory
                    .filter(lap => lap !== bestLap)
                    .slice(-4);
                
                // Combine best lap (sticky) with recent laps, then sort by lap number
                const displayLaps = [];
                if (bestLap) displayLaps.push(bestLap);
                displayLaps.push(...recentLaps);
                displayLaps.sort((a, b) => a.lapNum - b.lapNum);
                
                lapHistoryEl.innerHTML = displayLaps.map(lap => {
                    const isBest = !lap.invalid && lap.time === this.bestLapTime;
                    const rowClass = lap.invalid ? 'invalid' : (isBest ? 'best' : '');
                    return `
                        <div class="lap-history-row ${rowClass}">
                            <span class="lap-num">LAP ${lap.lapNum}</span>
                            <span class="lap-time">${this.formatTime(lap.time)}</span>
                        </div>
                    `;
                }).join('');
            }
        } else {
            // Show the lap times panel in race mode too
            if (lapTimesPanel) lapTimesPanel.style.display = '';
            
            // Update current lap time (no track limits in race mode, use default color)
            if (lapTimeDisplay && this.currentLapStartTime !== null) {
                const elapsed = Date.now() - this.currentLapStartTime;
                lapTimeDisplay.textContent = this.formatTime(elapsed);
                lapTimeDisplay.style.color = ''; // Default green from CSS
            }
            
            // Update lap history display with sticky best lap
            const lapHistoryEl = document.getElementById('lap-history');
            if (lapHistoryEl && this.lapHistory.length > 0) {
                // Find the best lap
                const bestLap = this.lapHistory.find(lap => lap.time === this.bestLapTime);
                
                // Get recent 4 laps excluding the best lap
                const recentLaps = this.lapHistory
                    .filter(lap => lap !== bestLap)
                    .slice(-4);
                
                // Combine best lap (sticky) with recent laps, then sort by lap number
                const displayLaps = [];
                if (bestLap) displayLaps.push(bestLap);
                displayLaps.push(...recentLaps);
                displayLaps.sort((a, b) => a.lapNum - b.lapNum);
                
                lapHistoryEl.innerHTML = displayLaps.map(lap => {
                    const isBest = lap.time === this.bestLapTime;
                    return `
                        <div class="lap-history-row ${isBest ? 'best' : ''}">
                            <span class="lap-num">LAP ${lap.lapNum}</span>
                            <span class="lap-time">${this.formatTime(lap.time)}</span>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // ---------------------------------------------------------------------
    // Ghost car rendering for time trials
    // ---------------------------------------------------------------------
    drawGhostCar() {
        if (!this.bestLapRecording || this.bestLapRecording.length === 0) {
            return;
        }
        
        const elapsed = Date.now() - this.currentLapStartTime;
        
        // Find the position in the recording closest to current elapsed time
        // Use interpolation for smoother ghost movement
        let ghostPos = null;
        for (let i = 0; i < this.bestLapRecording.length - 1; i++) {
            const curr = this.bestLapRecording[i];
            const next = this.bestLapRecording[i + 1];
            if (elapsed >= curr.time && elapsed <= next.time) {
                // Interpolate between current and next position
                const t = (elapsed - curr.time) / (next.time - curr.time);
                ghostPos = {
                    x: curr.x + (next.x - curr.x) * t,
                    y: curr.y + (next.y - curr.y) * t,
                    angle: curr.angle + (next.angle - curr.angle) * t
                };
                break;
            }
        }
        
        // If before the first recording point, use first position
        if (!ghostPos && elapsed < this.bestLapRecording[0].time) {
            ghostPos = this.bestLapRecording[0];
        }
        
        // If we've passed the end of the recording, use the last position
        if (!ghostPos) {
            ghostPos = this.bestLapRecording[this.bestLapRecording.length - 1];
        }
        
        if (!ghostPos) return;
        
        // Draw ghost car with 40% opacity (more visible)
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.ctx.translate(ghostPos.x, ghostPos.y);
        this.ctx.rotate(ghostPos.angle);
        
        // Ghost car body (purple/semi-transparent)
        const w = 20;
        const h = 40;
        
        this.ctx.fillStyle = '#a855f7'; // Purple ghost color
        
        // Main body
        this.ctx.fillRect(-w / 2 + 2, -h / 2 + 10, w - 4, h - 15);
        
        // Nose cone
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 4, -h / 2 + 10);
        this.ctx.lineTo(0, -h / 2 - 5);
        this.ctx.lineTo(w / 4, -h / 2 + 10);
        this.ctx.fill();
        
        // Front wing
        this.ctx.fillRect(-w / 2 - 2, -h / 2 - 5, w + 4, 5);
        
        // Rear wing
        this.ctx.fillRect(-w / 2 - 2, h / 2 - 5, w + 4, 5);
        
        // Tires
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
        this.ctx.fillRect(-w / 2 - 4, -h / 2 + 2, 5, 10);
        this.ctx.fillRect(w / 2 - 1, -h / 2 + 2, 5, 10);
        this.ctx.fillRect(-w / 2 - 4, h / 2 - 12, 5, 10);
        this.ctx.fillRect(w / 2 - 1, h / 2 - 12, 5, 10);
        
        this.ctx.restore();
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
            
            // Draw ghost car in time trials (before player car so it appears behind)
            if (this.gameMode === 'time_trials' && this.bestLapRecording && this.bestLapRecording.length > 0 && this.currentLapStartTime) {
                this.drawGhostCar();
            }
            
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
