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
        this.gameMode = 'race'; // 'race', 'time_trials', or 'multiplayer'

        // Multiplayer
        this.multiplayer = null;
        this.opponentCar = null;
        this.selectedDriverInfo = null;
        this.opponentDriverInfo = null;
        this.opponentReady = false; // Track if opponent sent ready signal

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

        // Multiplayer buttons
        const multiplayerBtn = document.getElementById('multiplayer-btn');
        if (multiplayerBtn) {
            multiplayerBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.gameMode = 'multiplayer';
                this.showMultiplayerLobby();
            });
        }

        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.createMultiplayerRoom();
            });
        }

        const joinRoomBtn = document.getElementById('join-room-btn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.showJoinRoom();
            });
        }

        const joinConnectBtn = document.getElementById('join-connect-btn');
        if (joinConnectBtn) {
            joinConnectBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.joinMultiplayerRoom();
            });
        }

        const lobbyBackBtn = document.getElementById('lobby-back-btn');
        if (lobbyBackBtn) {
            lobbyBackBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.goToMainMenu();
            });
        }

        const createBackBtn = document.getElementById('create-back-btn');
        if (createBackBtn) {
            createBackBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.cancelMultiplayer();
            });
        }

        const joinBackBtn = document.getElementById('join-back-btn');
        if (joinBackBtn) {
            joinBackBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.backToLobby();
            });
        }

        const waitingCancelBtn = document.getElementById('waiting-cancel-btn');
        if (waitingCancelBtn) {
            waitingCancelBtn.addEventListener('click', () => {
                if (window.MenuSound) MenuSound.playClick();
                this.cancelMultiplayer();
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
        const hud = document.getElementById('hud');
        const results = document.getElementById('results-screen');
        const multiplayerLobby = document.getElementById('multiplayer-lobby');
        const createRoom = document.getElementById('create-room-screen');
        const joinRoom = document.getElementById('join-room-screen');
        const multiplayerWaiting = document.getElementById('multiplayer-waiting');

        [trackSelect, driverSelect, tyreSelect, hud, results, multiplayerLobby, createRoom, joinRoom, multiplayerWaiting].forEach(el => {
            if (!el) return;
            el.classList.remove('active');
            el.classList.add('hidden');
        });
        if (menu) {
            menu.classList.remove('hidden');
            menu.classList.add('active');
        }

        // Cleanup multiplayer if active
        if (this.multiplayer) {
            this.multiplayer.disconnect();
            this.multiplayer = null;
        }

        // Reset basic game state
        this.state = 'MENU';
        this.track = null;
        this.cars = [];
        this.player = null;
        this.opponentCar = null;
        this.selectedDriverId = null;
        this.selectedTire = 'SOFT';
    }

    // ---------------------------------------------------------------------
    // Multiplayer screens
    // ---------------------------------------------------------------------
    showMultiplayerLobby() {
        const menu = document.getElementById('main-menu');
        const lobby = document.getElementById('multiplayer-lobby');
        if (menu) {
            menu.classList.remove('active');
            menu.classList.add('hidden');
        }
        if (lobby) {
            lobby.classList.remove('hidden');
            lobby.classList.add('active');
        }
        this.state = 'MULTIPLAYER_LOBBY';
    }

    createMultiplayerRoom() {
        const lobby = document.getElementById('multiplayer-lobby');
        const createScreen = document.getElementById('create-room-screen');
        const roomCodeEl = document.getElementById('room-code');
        const statusEl = document.getElementById('connection-status');

        if (lobby) {
            lobby.classList.remove('active');
            lobby.classList.add('hidden');
        }
        if (createScreen) {
            createScreen.classList.remove('hidden');
            createScreen.classList.add('active');
        }

        // Initialize multiplayer
        this.multiplayer = new Multiplayer(this);
        
        this.multiplayer.createRoom(
            // onReady
            (roomCode) => {
                console.log('[Game] Room ready with code:', roomCode);
                if (roomCodeEl) roomCodeEl.textContent = roomCode;
                if (statusEl) statusEl.textContent = 'Waiting for opponent to join...';
            },
            // onConnect
            () => {
                console.log('[Game] onConnect callback fired!');
                if (statusEl) {
                    statusEl.textContent = 'Opponent connected! Starting game...';
                    statusEl.classList.add('success');
                }
                // Short delay then go to track selection
                console.log('[Game] Starting 1 second delay before track selection...');
                setTimeout(() => {
                    console.log('[Game] Transitioning to track selection');
                    this.showTrackSelection();
                }, 1000);
            },
            // onError
            (errorType) => {
                console.error('[Game] Create room error:', errorType);
                if (statusEl) {
                    statusEl.textContent = 'Error: ' + errorType;
                    statusEl.classList.add('error');
                }
            }
        );
    }

    showJoinRoom() {
        const lobby = document.getElementById('multiplayer-lobby');
        const joinScreen = document.getElementById('join-room-screen');
        const inputEl = document.getElementById('join-code-input');
        const statusEl = document.getElementById('join-status');

        if (lobby) {
            lobby.classList.remove('active');
            lobby.classList.add('hidden');
        }
        if (joinScreen) {
            joinScreen.classList.remove('hidden');
            joinScreen.classList.add('active');
        }
        if (inputEl) {
            inputEl.value = '';
            inputEl.focus();
        }
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.classList.remove('error', 'success');
        }
    }

    joinMultiplayerRoom() {
        const inputEl = document.getElementById('join-code-input');
        const statusEl = document.getElementById('join-status');
        const roomCode = inputEl ? inputEl.value.trim().toUpperCase() : '';

        if (roomCode.length !== 6) {
            if (statusEl) {
                statusEl.textContent = 'Please enter a 6-character room code';
                statusEl.classList.add('error');
            }
            return;
        }

        if (statusEl) {
            statusEl.textContent = 'Connecting...';
            statusEl.classList.remove('error', 'success');
        }

        // Initialize multiplayer
        this.multiplayer = new Multiplayer(this);

        this.multiplayer.joinRoom(
            roomCode,
            // onConnect
            () => {
                console.log('[Game] Join onConnect callback fired!');
                if (statusEl) {
                    statusEl.textContent = 'Connected! Starting game...';
                    statusEl.classList.add('success');
                }
                // Go to track selection
                console.log('[Game] Starting 1 second delay before track selection...');
                setTimeout(() => {
                    console.log('[Game] Transitioning to track selection');
                    this.showTrackSelection();
                }, 1000);
            },
            // onError
            (errorType) => {
                console.error('[Game] Join room error:', errorType);
                if (statusEl) {
                    if (errorType === 'peer-unavailable') {
                        statusEl.textContent = 'Room not found. Check the code and try again.';
                    } else if (errorType === 'timeout') {
                        statusEl.textContent = 'Connection timed out. Try again.';
                    } else {
                        statusEl.textContent = 'Connection failed: ' + errorType;
                    }
                    statusEl.classList.add('error');
                }
                // Cleanup failed connection
                if (this.multiplayer) {
                    this.multiplayer.disconnect();
                    this.multiplayer = null;
                }
            }
        );
    }

    cancelMultiplayer() {
        if (this.multiplayer) {
            this.multiplayer.disconnect();
            this.multiplayer = null;
        }
        this.goToMainMenu();
    }

    backToLobby() {
        const joinScreen = document.getElementById('join-room-screen');
        const lobby = document.getElementById('multiplayer-lobby');

        if (this.multiplayer) {
            this.multiplayer.disconnect();
            this.multiplayer = null;
        }

        if (joinScreen) {
            joinScreen.classList.remove('active');
            joinScreen.classList.add('hidden');
        }
        if (lobby) {
            lobby.classList.remove('hidden');
            lobby.classList.add('active');
        }
    }

    showTrackSelection() {
        const menu = document.getElementById('main-menu');
        const trackSelect = document.getElementById('track-selection');
        const multiplayerLobby = document.getElementById('multiplayer-lobby');
        const createRoom = document.getElementById('create-room-screen');
        const joinRoom = document.getElementById('join-room-screen');
        const multiplayerWaiting = document.getElementById('multiplayer-waiting');
        
        // Hide all possible previous screens
        [menu, multiplayerLobby, createRoom, joinRoom, multiplayerWaiting].forEach(el => {
            if (el) {
                el.classList.remove('active');
                el.classList.add('hidden');
            }
        });
        
        // In multiplayer, only host selects track - guest waits
        if (this.gameMode === 'multiplayer' && this.multiplayer && !this.multiplayer.isHost) {
            // Show waiting screen for guest
            if (multiplayerWaiting) {
                multiplayerWaiting.classList.remove('hidden');
                multiplayerWaiting.classList.add('active');
            }
            this.state = 'MULTIPLAYER_WAITING';
            
            // Set up callback for when host selects track
            this.onTrackSelected = (data) => {
                console.log('[Game] Host selected track:', data.trackName);
                // Find the track by name
                const track = window.TRACKS.find(t => t.name === data.trackName);
                if (track) {
                    this.loadTrack(track);
                }
            };
            return;
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
                // In time trials, don't show lap count
                if (this.gameMode === 'time_trials') {
                    card.innerHTML = `<h3>${track.name}</h3>`;
                } else {
                    card.innerHTML = `<h3>${track.name}</h3><p>${track.laps} Laps</p>`;
                }
                card.addEventListener('click', () => this.loadTrack(track));
                trackList.appendChild(card);
            });
        }
    }

    loadTrack(trackData) {
        this.track = new Track(trackData);
        
        // In multiplayer, host sends track selection to guest
        if (this.gameMode === 'multiplayer' && this.multiplayer && this.multiplayer.isHost) {
            this.multiplayer.sendTrackSelection(trackData.name);
        }
        
        this.showDriverSelection();
    }

    showDriverSelection() {
        const trackSelect = document.getElementById('track-selection');
        const driverSelect = document.getElementById('driver-selection');
        const multiplayerWaiting = document.getElementById('multiplayer-waiting');
        
        // Hide previous screens
        [trackSelect, multiplayerWaiting].forEach(el => {
            if (el) {
                el.classList.remove('active');
                el.classList.add('hidden');
            }
        });
        
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
                    this.selectedDriverInfo = {
                        name: driver.name,
                        number: driver.number,
                        teamColor: driver.teamColor,
                        teamName: driver.teamName
                    };
                    
                    // In multiplayer, send driver selection to opponent
                    if (this.gameMode === 'multiplayer' && this.multiplayer) {
                        this.multiplayer.sendDriverSelection(this.selectedDriverInfo);
                    }
                    
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
        this.startSequenceStart = null; // Will be set when race actually starts
        this.startLightsCount = 0;
        this.startLightsOff = false;
        this.raceStartTime = null;
        // F1-style: 5 reds on at 1s intervals, then random delay before lights out
        this.startRandomDelay = 1000 + Math.random() * 1500; // 1.0s–2.5s after 5th light
        
        // Multiplayer sync state - preserve opponentReady if already set (opponent was ready before us)
        this.multiplayerReady = false;
        // Don't reset opponentReady - it may have been set when we received their ready signal earlier
        // this.opponentReady is initialized in constructor and set by Multiplayer.js when signal received
        this.waitingForOpponent = false;
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
        
        // In multiplayer, wait for both players to be ready before starting lights
        if (this.gameMode === 'multiplayer' && this.multiplayer) {
            this.waitingForOpponent = true;
            this.multiplayerReady = true;
            
            // Set up callback BEFORE sending ready (in case response is fast)
            this.onOpponentReady = () => {
                console.log('[Game] onOpponentReady callback fired');
                this.checkBothPlayersReady();
            };
            
            // Check if opponent was already ready (they sent ready before us)
            if (this.opponentReady) {
                console.log('[Game] Opponent was already ready');
                this.checkBothPlayersReady();
            }
            
            // Send ready signal to opponent
            console.log('[Game] Sending ready signal');
            this.multiplayer.sendReady();
        } else {
            // Non-multiplayer: start lights immediately
            this.startSequenceStart = performance.now();
        }
        
        this.loop(this.lastTime);
    }
    
    checkBothPlayersReady() {
        console.log('[Game] checkBothPlayersReady - multiplayerReady:', this.multiplayerReady, 
                    'opponentReady:', this.opponentReady, 'waitingForOpponent:', this.waitingForOpponent);
        
        if (this.multiplayerReady && this.opponentReady && this.waitingForOpponent) {
            console.log('[Game] Both players ready!');
            
            // Host controls the start timing
            if (this.multiplayer && this.multiplayer.isHost) {
                console.log('[Game] Host starting race sequence and notifying guest');
                this.waitingForOpponent = false;
                
                // Small delay to ensure sync, then start and notify guest
                setTimeout(() => {
                    this.startSequenceStart = performance.now();
                    this.multiplayer.sendRaceStart(this.startSequenceStart);
                }, 300);
            }
            // Guest keeps waitingForOpponent=true until they receive race-start signal
            // (handled in Multiplayer.js handleData)
        }
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

        // In multiplayer mode, create player and opponent (no AI)
        if (this.gameMode === 'multiplayer') {
            const playerDriver = allDrivers[playerIndex];
            // Player at position 0 (pole) or 1 based on host status
            const playerGridPos = this.multiplayer && this.multiplayer.isHost ? 0 : 1;
            const opponentGridPos = playerGridPos === 0 ? 1 : 0;
            
            // Create player car
            const playerStartPos = this.track.getGridPosition(playerGridPos);
            const playerCar = new Car(playerStartPos.x, playerStartPos.y, playerDriver.teamColor, true);
            playerCar.angle = playerStartPos.angle;
            playerCar.driverName = playerDriver.name;
            playerCar.driverNumber = playerDriver.driverNumber;
            playerCar.teamId = playerDriver.teamId;
            playerCar.tire = this.selectedTire || 'SOFT';
            this.player = playerCar;
            this.cars.push(playerCar);
            
            // Create opponent car (will be position-synced via network)
            const opponentStartPos = this.track.getGridPosition(opponentGridPos);
            // Use opponent's driver info if available, otherwise placeholder
            const opponentInfo = this.opponentDriverInfo || { name: 'Opponent', number: '??', teamColor: '#888888' };
            this.opponentCar = new Car(opponentStartPos.x, opponentStartPos.y, opponentInfo.teamColor || '#888888', false);
            this.opponentCar.angle = opponentStartPos.angle;
            this.opponentCar.driverName = opponentInfo.name || 'Opponent';
            this.opponentCar.driverNumber = opponentInfo.number || '??';
            this.opponentCar.teamId = 'opponent';
            this.opponentCar.tire = 'SOFT';
            this.opponentCar.isOpponent = true; // Mark as network opponent
            this.cars.push(this.opponentCar);
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
                // Skip network opponent - their position comes from network
                if (car.isOpponent) return;
                
                // Only allow movement once raceStarted is true AND not waiting for opponent
                const raceActive = this.raceStarted && !this.waitingForOpponent;
                car.update(this.input, deltaTime, this.track, this.cars, this.weather, raceActive);
            });
            
            // Multiplayer position sync
            if (this.gameMode === 'multiplayer' && this.multiplayer && this.multiplayer.isConnected()) {
                // Send our position to opponent
                if (this.player) {
                    this.multiplayer.sendPosition(this.player);
                }
                
                // Update opponent car from network data
                const opponentData = this.multiplayer.getOpponentData();
                if (opponentData && this.opponentCar) {
                    // Smooth interpolation to opponent position
                    const lerpFactor = 0.3;
                    this.opponentCar.x += (opponentData.x - this.opponentCar.x) * lerpFactor;
                    this.opponentCar.y += (opponentData.y - this.opponentCar.y) * lerpFactor;
                    this.opponentCar.angle = opponentData.angle;
                    this.opponentCar.speed = opponentData.speed;
                    this.opponentCar.lap = opponentData.lap || 0;
                }
            }
            
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

    // ---------------------------------------------------------------------
    // HUD update – includes lap counter and timer
    // ---------------------------------------------------------------------
    updateHUD() {
        this.checkLaps();
        
        // Show/hide multiplayer waiting message
        const waitingMsg = document.getElementById('multiplayer-race-waiting');
        if (waitingMsg) {
            if (this.gameMode === 'multiplayer' && this.waitingForOpponent) {
                waitingMsg.style.display = '';
            } else {
                waitingMsg.style.display = 'none';
            }
        }
        
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
            // Hide lights when waiting for opponent in multiplayer
            if (this.gameMode === 'multiplayer' && this.waitingForOpponent) {
                lightsContainer.style.display = 'none';
            }
            // Hide the entire start light rig 5 seconds after race start
            else if (this.raceStartTime && performance.now() - this.raceStartTime > 5000) {
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
