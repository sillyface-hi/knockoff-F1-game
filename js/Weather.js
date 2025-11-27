/**
 * Weather System - Dynamic weather cycle for F1 racing
 * Manages weather transitions between SUNNY, CLOUDY, LIGHT_RAIN, and HEAVY_RAIN
 */
class Weather {
    constructor() {
        // Weather states in order of progression
        this.states = ['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN'];
        this.currentState = 'SUNNY';
        this.targetState = 'SUNNY';
        
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
    }
    
    /**
     * Schedule the next weather change
     */
    scheduleNextChange() {
        const duration = this.minCycleDuration + Math.random() * (this.maxCycleDuration - this.minCycleDuration);
        return Date.now() + duration;
    }
    
    /**
     * Get the next weather state based on current conditions
     */
    getNextState() {
        const currentIndex = this.states.indexOf(this.currentState);
        
        // Weighted random: more likely to stay similar or progress gradually
        const rand = Math.random();
        
        if (this.currentState === 'SUNNY') {
            // From sunny: 60% stay sunny, 30% cloudy, 10% jump to light rain
            if (rand < 0.6) return 'SUNNY';
            if (rand < 0.9) return 'CLOUDY';
            return 'LIGHT_RAIN';
        } else if (this.currentState === 'CLOUDY') {
            // From cloudy: 20% sunny, 30% stay cloudy, 40% light rain, 10% heavy rain
            if (rand < 0.2) return 'SUNNY';
            if (rand < 0.5) return 'CLOUDY';
            if (rand < 0.9) return 'LIGHT_RAIN';
            return 'HEAVY_RAIN';
        } else if (this.currentState === 'LIGHT_RAIN') {
            // From light rain: 10% sunny, 20% cloudy, 40% stay light, 30% heavy
            if (rand < 0.1) return 'SUNNY';
            if (rand < 0.3) return 'CLOUDY';
            if (rand < 0.7) return 'LIGHT_RAIN';
            return 'HEAVY_RAIN';
        } else { // HEAVY_RAIN
            // From heavy rain: 5% sunny, 15% cloudy, 50% light rain, 30% stay heavy
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
     * Force a specific weather state (for testing/debugging)
     */
    forceWeather(state) {
        if (this.states.includes(state)) {
            this.currentState = state;
            this.targetState = state;
            this.rainIntensity = this.getStateRainIntensity(state);
            this.transitionProgress = 1;
            
            // Immediately set track wetness based on weather
            if (state === 'HEAVY_RAIN') this.trackWetness = 1;
            else if (state === 'LIGHT_RAIN') this.trackWetness = 0.6;
            else if (state === 'CLOUDY') this.trackWetness = Math.min(this.trackWetness, 0.3);
            else this.trackWetness = 0;
            
            this.slipFactor = Math.max(this.rainIntensity, this.trackWetness * 0.8);
        }
    }
}

