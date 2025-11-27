/**
 * Weather System - Dynamic weather cycle for F1 racing
 * Based on historical weather data from real F1 races
 * Manages weather transitions between SUNNY, CLOUDY, LIGHT_RAIN, and HEAVY_RAIN
 */

// Historical weather data from real F1 races
// Each track has multiple race scenarios based on actual past races
const HISTORICAL_WEATHER = {
    // Monza - Generally dry, occasional drama
    'monza': {
        name: 'Monza',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2022 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2017 Qualifying Rain', sequence: ['CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY'] },
            { name: '2020 Dry Hot', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] }
        ]
    },
    // Silverstone - Famous for unpredictable British weather
    'silverstone': {
        name: 'Silverstone',
        scenarios: [
            { name: '2023 Dry', sequence: ['CLOUDY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2022 Dry Hot', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2021 Sprint Rain', sequence: ['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY'] },
            { name: '2020 Late Rain', sequence: ['SUNNY', 'SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'LIGHT_RAIN'] },
            { name: '2019 Changeable', sequence: ['CLOUDY', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY', 'CLOUDY'] },
            { name: '2015 Wet Start', sequence: ['LIGHT_RAIN', 'CLOUDY', 'SUNNY', 'SUNNY', 'CLOUDY'] }
        ]
    },
    // Spa - Infamous for localized rain and unpredictable conditions
    'spa': {
        name: 'Spa-Francorchamps',
        scenarios: [
            { name: '2023 Dry', sequence: ['CLOUDY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2022 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2021 Red Flag Monsoon', sequence: ['HEAVY_RAIN', 'HEAVY_RAIN', 'HEAVY_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN'] },
            { name: '2019 Changeable', sequence: ['CLOUDY', 'LIGHT_RAIN', 'SUNNY', 'CLOUDY', 'LIGHT_RAIN'] },
            { name: '2018 Thunderstorm', sequence: ['SUNNY', 'CLOUDY', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY'] },
            { name: '2008 Chaos', sequence: ['LIGHT_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'HEAVY_RAIN', 'CLOUDY'] }
        ]
    },
    // Monaco - Usually dry Mediterranean weather
    'monaco': {
        name: 'Monaco',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2022 Wet Start Drama', sequence: ['HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY', 'SUNNY'] },
            { name: '2021 Dry', sequence: ['SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY', 'SUNNY'] },
            { name: '2016 Wet Race', sequence: ['LIGHT_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY'] },
            { name: '2008 Hamilton Magic', sequence: ['CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY'] }
        ]
    },
    // Suzuka - Can be affected by typhoons
    'suzuka': {
        name: 'Suzuka',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY', 'SUNNY'] },
            { name: '2022 Typhoon Aftermath', sequence: ['HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY', 'SUNNY'] },
            { name: '2019 Typhoon Delay', sequence: ['CLOUDY', 'HEAVY_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY'] },
            { name: '2014 Bianchi Tragedy', sequence: ['LIGHT_RAIN', 'HEAVY_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY'] },
            { name: '2018 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] }
        ]
    },
    // Interlagos - Famous for dramatic rain races
    'interlagos': {
        name: 'Interlagos',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'CLOUDY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2022 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2019 Chaos Race', sequence: ['CLOUDY', 'LIGHT_RAIN', 'SUNNY', 'CLOUDY', 'LIGHT_RAIN'] },
            { name: '2016 Epic Wet Race', sequence: ['LIGHT_RAIN', 'HEAVY_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY'] },
            { name: '2012 Championship Decider', sequence: ['CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'SUNNY'] },
            { name: '2008 Hamilton Title', sequence: ['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN'] },
            { name: '2003 Fisichella Win', sequence: ['HEAVY_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY'] }
        ]
    },
    // COTA Austin - Usually dry Texas weather
    'austin': {
        name: 'COTA',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2022 Dry Hot', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2018 Wet Qualifying', sequence: ['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY'] },
            { name: '2015 Wet Race', sequence: ['CLOUDY', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY'] }
        ]
    },
    // Australia Melbourne - Variable spring weather
    'australia': {
        name: 'Australia',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2022 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2018 Dry', sequence: ['SUNNY', 'CLOUDY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2013 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] }
        ]
    },
    // Bahrain - Desert, always dry
    'bahrain': {
        name: 'Bahrain',
        scenarios: [
            { name: 'Typical Dry Night', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: 'Desert Clear', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] }
        ]
    },
    // Singapore - Can have tropical storms
    'singapore': {
        name: 'Singapore',
        scenarios: [
            { name: '2023 Dry', sequence: ['CLOUDY', 'CLOUDY', 'SUNNY', 'CLOUDY', 'CLOUDY'] },
            { name: '2022 Dry Humid', sequence: ['CLOUDY', 'SUNNY', 'CLOUDY', 'CLOUDY', 'SUNNY'] },
            { name: '2017 Wet Start', sequence: ['LIGHT_RAIN', 'CLOUDY', 'SUNNY', 'CLOUDY', 'SUNNY'] }
        ]
    },
    // Zandvoort Netherlands - Coastal weather
    'netherlands': {
        name: 'Netherlands',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2022 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2021 Dry', sequence: ['SUNNY', 'CLOUDY', 'SUNNY', 'SUNNY', 'SUNNY'] }
        ]
    },
    // Hungary - Hot and can have summer storms
    'hungary': {
        name: 'Hungary',
        scenarios: [
            { name: '2023 Dry Hot', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2022 Dry', sequence: ['SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY', 'SUNNY'] },
            { name: '2021 Chaos Start', sequence: ['HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY', 'SUNNY'] },
            { name: '2014 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] }
        ]
    },
    // Canada Montreal - Variable weather
    'canada': {
        name: 'Canada',
        scenarios: [
            { name: '2023 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: '2022 Dry', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2019 Dry Hot', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'SUNNY', 'SUNNY'] },
            { name: '2011 Epic Wet Race', sequence: ['LIGHT_RAIN', 'HEAVY_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY'] }
        ]
    },
    // Default for any track without specific data
    'default': {
        name: 'Default',
        scenarios: [
            { name: 'Dry Race', sequence: ['SUNNY', 'SUNNY', 'SUNNY', 'CLOUDY', 'SUNNY'] },
            { name: 'Mixed Conditions', sequence: ['CLOUDY', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY', 'CLOUDY'] },
            { name: 'Wet Race', sequence: ['LIGHT_RAIN', 'HEAVY_RAIN', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY'] },
            { name: 'Changing Weather', sequence: ['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'CLOUDY', 'SUNNY'] }
        ]
    }
};

class Weather {
    constructor(trackId = null) {
        // Weather states in order of progression
        this.states = ['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN'];
        this.currentState = 'SUNNY';
        this.targetState = 'SUNNY';
        
        // Historical weather mode
        this.trackId = trackId;
        this.historicalScenario = null;
        this.scenarioIndex = 0;
        this.scenarioName = '';
        
        // Transition timing (in milliseconds)
        this.minCycleDuration = 30000;  // Minimum 30 seconds between weather changes
        this.maxCycleDuration = 90000;  // Maximum 90 seconds between weather changes
        this.transitionDuration = 5000; // 5 seconds to transition between states
        
        // Current cycle timing
        this.lastChangeTime = Date.now();
        this.nextChangeTime = this.scheduleNextChange();
        this.transitionProgress = 1; // 1 = fully transitioned, 0 = just started
        
        // Rain intensity (0-1, affects gameplay)
        this.rainIntensity = 0;
        this.targetRainIntensity = 0;
        
        // Slip factor (higher = more slippery)
        this.slipFactor = 0;
        
        // Track wetness (builds up over time in rain, dries in sun)
        this.trackWetness = 0;
        
        // Initialize with track if provided
        if (trackId) {
            this.initializeHistoricalWeather(trackId);
        }
    }
    
    /**
     * Initialize weather based on historical race data for a track
     */
    initializeHistoricalWeather(trackId) {
        this.trackId = trackId;
        
        // Find track data (try exact match, then partial match, then default)
        let trackData = HISTORICAL_WEATHER[trackId.toLowerCase()];
        
        if (!trackData) {
            // Try partial match for tracks loaded from GeoJSON
            const trackKey = Object.keys(HISTORICAL_WEATHER).find(key => 
                trackId.toLowerCase().includes(key) || key.includes(trackId.toLowerCase())
            );
            trackData = trackKey ? HISTORICAL_WEATHER[trackKey] : HISTORICAL_WEATHER['default'];
        }
        
        // Pick a random historical scenario
        const scenarios = trackData.scenarios;
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        this.historicalScenario = randomScenario.sequence;
        this.scenarioName = randomScenario.name;
        this.scenarioIndex = 0;
        
        // Set initial weather from the scenario
        this.currentState = this.historicalScenario[0];
        this.targetState = this.currentState;
        this.rainIntensity = this.getStateRainIntensity(this.currentState);
        
        // Set initial track wetness based on starting weather
        if (this.currentState === 'HEAVY_RAIN') {
            this.trackWetness = 1;
        } else if (this.currentState === 'LIGHT_RAIN') {
            this.trackWetness = 0.5;
        } else {
            this.trackWetness = 0;
        }
        
        this.slipFactor = Math.max(this.rainIntensity, this.trackWetness * 0.8);
        
        console.log(`Weather initialized: ${trackData.name} - ${this.scenarioName}`);
    }
    
    /**
     * Schedule the next weather change
     */
    scheduleNextChange() {
        const duration = this.minCycleDuration + Math.random() * (this.maxCycleDuration - this.minCycleDuration);
        return Date.now() + duration;
    }
    
    /**
     * Get the next weather state based on historical scenario or random progression
     */
    getNextState() {
        // If we have a historical scenario, follow it
        if (this.historicalScenario && this.historicalScenario.length > 0) {
            this.scenarioIndex = (this.scenarioIndex + 1) % this.historicalScenario.length;
            return this.historicalScenario[this.scenarioIndex];
        }
        
        // Otherwise use random weighted transitions
        const rand = Math.random();
        
        if (this.currentState === 'SUNNY') {
            if (rand < 0.6) return 'SUNNY';
            if (rand < 0.9) return 'CLOUDY';
            return 'LIGHT_RAIN';
        } else if (this.currentState === 'CLOUDY') {
            if (rand < 0.2) return 'SUNNY';
            if (rand < 0.5) return 'CLOUDY';
            if (rand < 0.9) return 'LIGHT_RAIN';
            return 'HEAVY_RAIN';
        } else if (this.currentState === 'LIGHT_RAIN') {
            if (rand < 0.1) return 'SUNNY';
            if (rand < 0.3) return 'CLOUDY';
            if (rand < 0.7) return 'LIGHT_RAIN';
            return 'HEAVY_RAIN';
        } else { // HEAVY_RAIN
            if (rand < 0.05) return 'SUNNY';
            if (rand < 0.2) return 'CLOUDY';
            if (rand < 0.7) return 'LIGHT_RAIN';
            return 'HEAVY_RAIN';
        }
    }
    
    /**
     * Get rain intensity for a given weather state
     */
    getStateRainIntensity(state) {
        switch (state) {
            case 'SUNNY': return 0;
            case 'CLOUDY': return 0;
            case 'LIGHT_RAIN': return 0.4;
            case 'HEAVY_RAIN': return 1.0;
            default: return 0;
        }
    }
    
    /**
     * Update weather system - call this every frame
     */
    update(deltaTime) {
        const now = Date.now();
        
        // Check if it's time to change weather
        if (now >= this.nextChangeTime && this.transitionProgress >= 1) {
            this.targetState = this.getNextState();
            this.targetRainIntensity = this.getStateRainIntensity(this.targetState);
            
            if (this.targetState !== this.currentState) {
                this.transitionProgress = 0;
            }
            
            this.lastChangeTime = now;
            this.nextChangeTime = this.scheduleNextChange();
        }
        
        // Handle smooth transition
        if (this.transitionProgress < 1) {
            this.transitionProgress += deltaTime / this.transitionDuration;
            if (this.transitionProgress >= 1) {
                this.transitionProgress = 1;
                this.currentState = this.targetState;
            }
        }
        
        // Smoothly interpolate rain intensity
        const targetIntensity = this.getStateRainIntensity(this.targetState);
        const currentIntensity = this.getStateRainIntensity(this.currentState);
        this.rainIntensity = currentIntensity + (targetIntensity - currentIntensity) * this.transitionProgress;
        
        // Update track wetness based on weather
        const wetnessDelta = deltaTime / 1000; // per second
        if (this.rainIntensity > 0) {
            // Track gets wet in rain (faster in heavy rain)
            this.trackWetness = Math.min(1, this.trackWetness + this.rainIntensity * wetnessDelta * 0.1);
        } else {
            // Track dries in dry conditions (slower than it gets wet)
            this.trackWetness = Math.max(0, this.trackWetness - wetnessDelta * 0.02);
        }
        
        // Calculate slip factor based on rain and track wetness
        this.slipFactor = Math.max(this.rainIntensity, this.trackWetness * 0.8);
    }
    
    /**
     * Check if it's currently raining
     */
    isRaining() {
        return this.rainIntensity > 0.1;
    }
    
    /**
     * Check if conditions are wet (rain or wet track)
     */
    isWet() {
        return this.slipFactor > 0.1;
    }
    
    /**
     * Get the current grip modifier (lower = less grip)
     * Returns a value between 0.5 (heavy rain) and 1.0 (dry)
     */
    getGripModifier() {
        return 1.0 - this.slipFactor * 0.5;
    }
    
    /**
     * Get brake effectiveness modifier (lower = less effective brakes in rain)
     * Returns a value between 0.6 (heavy rain) and 1.0 (dry)
     */
    getBrakeModifier() {
        return 1.0 - this.slipFactor * 0.4;
    }
    
    /**
     * Get the chance of slipping (0-1)
     * Used for AI corner slip and player brake slip calculations
     */
    getSlipChance() {
        return this.slipFactor * 0.5; // Max 50% base slip chance in worst conditions
    }
    
    /**
     * Get display-friendly weather state
     */
    getDisplayState() {
        // During transition, show the target state
        if (this.transitionProgress < 0.5) {
            return this.currentState;
        }
        return this.targetState;
    }
    
    /**
     * Get weather for Car.update() compatibility
     * Returns 'RAIN' for wet conditions, 'SUNNY' for dry
     */
    getSimpleWeather() {
        return this.isWet() ? 'RAIN' : 'SUNNY';
    }
    
    /**
     * Get CSS class for weather icon
     */
    getWeatherIconClass() {
        const state = this.getDisplayState();
        switch (state) {
            case 'SUNNY': return 'weather-sunny';
            case 'CLOUDY': return 'weather-cloudy';
            case 'LIGHT_RAIN': return 'weather-light-rain';
            case 'HEAVY_RAIN': return 'weather-heavy-rain';
            default: return 'weather-sunny';
        }
    }
    
    /**
     * Get weather display text
     */
    getWeatherText() {
        const state = this.getDisplayState();
        switch (state) {
            case 'SUNNY': return '☀️';
            case 'CLOUDY': return '☁️';
            case 'LIGHT_RAIN': return '🌧️';
            case 'HEAVY_RAIN': return '⛈️';
            default: return '☀️';
        }
    }
    
    /**
     * Get the current scenario name (for display)
     */
    getScenarioName() {
        return this.scenarioName || 'Dynamic Weather';
    }
    
    /**
     * Force a specific weather state (for testing/debugging or custom mode)
     */
    forceWeather(state) {
        if (this.states.includes(state)) {
            this.currentState = state;
            this.targetState = state;
            this.rainIntensity = this.getStateRainIntensity(state);
            this.transitionProgress = 1;
            
            // Clear historical scenario when forcing weather
            this.historicalScenario = null;
            
            // Immediately set track wetness based on weather
            if (state === 'HEAVY_RAIN') this.trackWetness = 1;
            else if (state === 'LIGHT_RAIN') this.trackWetness = 0.6;
            else if (state === 'CLOUDY') this.trackWetness = Math.min(this.trackWetness, 0.3);
            else this.trackWetness = 0;
            
            this.slipFactor = Math.max(this.rainIntensity, this.trackWetness * 0.8);
        }
    }
}
