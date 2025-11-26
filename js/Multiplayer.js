/**
 * Multiplayer networking using PeerJS (WebRTC)
 */
class Multiplayer {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connection = null;
        this.isHost = false;
        this.roomCode = null;
        this.connected = false;
        this.opponentData = null; // Latest data from opponent
        
        // Sync rate (send position updates at ~30fps)
        this.lastSendTime = 0;
        this.sendInterval = 33; // ~30fps
        
        // PeerJS server configs (try private first, fallback to public)
        this.peerServers = [
            {
                name: 'private',
                host: 'peerjs-5y63k.ondigitalocean.app',
                port: 443,
                secure: true,
                path: '/'
            },
            {
                name: 'public',
                // Default PeerJS cloud server (no config needed)
                host: '0.peerjs.com',
                port: 443,
                secure: true
            }
        ];
        this.currentServerIndex = 0;
    }

    /**
     * Generate a random 6-character room code
     */
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Get current server config
     */
    getServerConfig() {
        return this.peerServers[this.currentServerIndex];
    }

    /**
     * Try next server in the list
     */
    tryNextServer() {
        this.currentServerIndex++;
        return this.currentServerIndex < this.peerServers.length;
    }

    /**
     * Reset to first server
     */
    resetServerIndex() {
        this.currentServerIndex = 0;
    }

    /**
     * Create a room (host)
     */
    createRoom(onReady, onConnect, onError) {
        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        this.resetServerIndex();
        
        this._createRoomWithServer(onReady, onConnect, onError);
    }

    /**
     * Internal: Create room with current server, fallback on failure
     */
    _createRoomWithServer(onReady, onConnect, onError) {
        const serverConfig = this.getServerConfig();
        console.log('[MP] Creating room with code:', this.roomCode, 'using server:', serverConfig.name);
        
        // Clean up any existing peer
        if (this.peer) {
            this.peer.destroy();
        }
        
        // Create peer with room code as ID
        this.peer = new Peer('f1race-' + this.roomCode, {
            host: serverConfig.host,
            port: serverConfig.port,
            secure: serverConfig.secure,
            path: serverConfig.path || '/',
            debug: 2
        });

        const connectionTimeout = setTimeout(() => {
            console.log('[MP] Connection timeout on server:', serverConfig.name);
            this._handleServerFailure(onReady, onConnect, onError, 'timeout');
        }, 5000);

        this.peer.on('open', (id) => {
            clearTimeout(connectionTimeout);
            console.log('[MP] Host peer opened with ID:', id, 'on server:', serverConfig.name);
            if (onReady) onReady(this.roomCode);
        });

        this.peer.on('connection', (conn) => {
            console.log('[MP] Incoming connection from opponent!');
            this.connection = conn;
            this.setupConnection(onConnect);
        });

        this.peer.on('error', (err) => {
            clearTimeout(connectionTimeout);
            console.error('[MP] Host peer error on server:', serverConfig.name, err);
            this._handleServerFailure(onReady, onConnect, onError, err.type);
        });
        
        this.peer.on('disconnected', () => {
            console.log('[MP] Host peer disconnected from signaling server');
        });
    }

    /**
     * Handle server failure and try fallback
     */
    _handleServerFailure(onReady, onConnect, onError, errorType) {
        if (this.tryNextServer()) {
            const nextServer = this.getServerConfig();
            console.log('[MP] Trying fallback server:', nextServer.name);
            if (this.isHost) {
                this._createRoomWithServer(onReady, onConnect, onError);
            } else {
                this._joinRoomWithServer(onConnect, onError);
            }
        } else {
            console.error('[MP] All servers failed');
            if (onError) onError(errorType);
        }
    }

    /**
     * Join a room (client)
     */
    joinRoom(roomCode, onConnect, onError) {
        this.isHost = false;
        this.roomCode = roomCode.toUpperCase();
        this.resetServerIndex();
        this._savedOnConnect = onConnect;
        this._savedOnError = onError;
        
        this._joinRoomWithServer(onConnect, onError);
    }

    /**
     * Internal: Join room with current server, fallback on failure
     */
    _joinRoomWithServer(onConnect, onError) {
        const serverConfig = this.getServerConfig();
        console.log('[MP] Joining room:', this.roomCode, 'using server:', serverConfig.name);
        
        // Clean up any existing peer
        if (this.peer) {
            this.peer.destroy();
        }
        
        // Create our own peer
        this.peer = new Peer({
            host: serverConfig.host,
            port: serverConfig.port,
            secure: serverConfig.secure,
            path: serverConfig.path || '/',
            debug: 2
        });

        let connectionTimeout;
        let hasConnected = false;

        this.peer.on('open', (id) => {
            console.log('[MP] Client peer opened with ID:', id, 'on server:', serverConfig.name);
            console.log('[MP] Attempting to connect to host: f1race-' + this.roomCode);
            
            // Connect to the host
            this.connection = this.peer.connect('f1race-' + this.roomCode, {
                reliable: true
            });

            // Set timeout for connection to host
            connectionTimeout = setTimeout(() => {
                if (!hasConnected && !this.connected) {
                    console.log('[MP] Connection to host timeout on server:', serverConfig.name);
                    this._handleServerFailure(null, onConnect, onError, 'timeout');
                }
            }, 5000);

            this.connection.on('open', () => {
                hasConnected = true;
                clearTimeout(connectionTimeout);
                console.log('[MP] Connection to host opened!');
                this.setupConnection(onConnect);
            });

            this.connection.on('error', (err) => {
                clearTimeout(connectionTimeout);
                console.error('[MP] Connection error on server:', serverConfig.name, err);
                this._handleServerFailure(null, onConnect, onError, 'connection-failed');
            });
        });

        this.peer.on('error', (err) => {
            clearTimeout(connectionTimeout);
            console.error('[MP] Client peer error on server:', serverConfig.name, err);
            this._handleServerFailure(null, onConnect, onError, err.type);
        });
    }

    /**
     * Setup the data connection
     */
    setupConnection(onConnect) {
        console.log('[MP] Setting up data connection...');
        console.log('[MP] Connection object:', this.connection);
        console.log('[MP] Connection open:', this.connection.open);
        
        // Wait for the connection to be fully open before calling onConnect
        if (this.connection.open) {
            console.log('[MP] Connection already open, setting up handlers');
            this.connected = true;
            this.setupConnectionHandlers();
            if (onConnect) {
                console.log('[MP] Calling onConnect callback');
                onConnect();
            }
        } else {
            console.log('[MP] Connection not yet open, waiting for open event');
            this.connection.on('open', () => {
                console.log('[MP] Connection now open!');
                this.connected = true;
                this.setupConnectionHandlers();
                if (onConnect) {
                    console.log('[MP] Calling onConnect callback');
                    onConnect();
                }
            });
        }
    }
    
    setupConnectionHandlers() {
        this.connection.on('data', (data) => {
            this.handleData(data);
        });

        this.connection.on('close', () => {
            console.log('[MP] Connection closed');
            this.connected = false;
            this.opponentData = null;
        });
    }

    /**
     * Handle incoming data from opponent
     */
    handleData(data) {
        if (data.type === 'position') {
            this.opponentData = data;
        } else if (data.type === 'track-selected') {
            // Host selected a track
            console.log('[MP] Received track selection:', data.trackName);
            if (this.game.onTrackSelected) {
                this.game.onTrackSelected(data);
            }
        } else if (data.type === 'driver-selected') {
            // Opponent selected a driver
            console.log('[MP] Received opponent driver selection:', data.driverInfo.name);
            this.game.opponentDriverInfo = data.driverInfo;
            
            // If opponent car already exists, update its info
            if (this.game.opponentCar) {
                this.game.opponentCar.driverName = data.driverInfo.name || 'Opponent';
                this.game.opponentCar.driverNumber = data.driverInfo.number || '??';
                this.game.opponentCar.color = data.driverInfo.teamColor || '#888888';
                console.log('[MP] Updated existing opponent car with driver info');
            }
        } else if (data.type === 'player-ready') {
            // Opponent is ready to race
            console.log('[MP] Opponent is ready to race');
            console.log('[MP] Current game state - multiplayerReady:', this.game.multiplayerReady, 'waitingForOpponent:', this.game.waitingForOpponent);
            this.game.opponentReady = true;
            if (this.game.onOpponentReady) {
                console.log('[MP] Calling onOpponentReady callback');
                this.game.onOpponentReady();
            } else {
                console.log('[MP] No onOpponentReady callback set yet');
            }
        } else if (data.type === 'race-start') {
            // Sync race start timing from host
            console.log('[MP] Received race start signal');
            if (!this.isHost && this.game) {
                this.game.waitingForOpponent = false;
                this.game.startSequenceStart = performance.now();
                console.log('[MP] Guest starting race sequence');
            }
        } else if (data.type === 'lap-complete') {
            // Opponent completed a lap
            if (this.game.onOpponentLapComplete) {
                this.game.onOpponentLapComplete(data);
            }
        }
    }

    /**
     * Send ready signal to opponent
     */
    sendReady() {
        if (!this.connected || !this.connection) return;
        
        console.log('[MP] Sending ready signal');
        this.connection.send({
            type: 'player-ready'
        });
    }

    /**
     * Send track selection to opponent (host only)
     */
    sendTrackSelection(trackName) {
        if (!this.connected || !this.connection) return;
        
        console.log('[MP] Sending track selection:', trackName);
        this.connection.send({
            type: 'track-selected',
            trackName: trackName
        });
    }

    /**
     * Send driver selection to opponent
     */
    sendDriverSelection(driverInfo) {
        if (!this.connected || !this.connection) return;
        
        console.log('[MP] Sending driver selection:', driverInfo.name);
        this.connection.send({
            type: 'driver-selected',
            driverInfo: driverInfo
        });
    }

    /**
     * Send player position to opponent
     */
    sendPosition(car) {
        if (!this.connected || !this.connection) return;

        const now = performance.now();
        if (now - this.lastSendTime < this.sendInterval) return;
        this.lastSendTime = now;

        this.connection.send({
            type: 'position',
            x: car.x,
            y: car.y,
            angle: car.angle,
            speed: car.speed,
            lap: car.lap,
            timestamp: now
        });
    }

    /**
     * Send race start signal (host only)
     */
    sendRaceStart(startTime) {
        if (!this.connected || !this.connection) return;

        this.connection.send({
            type: 'race-start',
            startTime: startTime
        });
    }

    /**
     * Send lap completion
     */
    sendLapComplete(lapNum, lapTime) {
        if (!this.connected || !this.connection) return;

        this.connection.send({
            type: 'lap-complete',
            lapNum: lapNum,
            lapTime: lapTime
        });
    }

    /**
     * Get opponent's latest position data
     */
    getOpponentData() {
        return this.opponentData;
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
        this.connected = false;
        this.connection = null;
        this.peer = null;
        this.opponentData = null;
    }
}

// Make available globally
window.Multiplayer = Multiplayer;

