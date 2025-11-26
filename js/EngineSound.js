class EngineSound {
    constructor() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
            this.enabled = false;
            return;
        }

        this.ctx = new Ctx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0;
        this.gainNode.connect(this.ctx.destination);

        this.osc = this.ctx.createOscillator();
        this.osc.type = 'sawtooth';
        this.osc.frequency.value = 80;
        this.osc.connect(this.gainNode);

        // Some browsers start AudioContext in a 'suspended' state; resume on user gesture.
        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            // ignore – best-effort
        }

        this.osc.start();

        this.enabled = true;
        this.lastVolume = 0;
        this.isMuted = false;
    }

    setState(speed, gear, throttlePressed) {
        if (!this.enabled) return;
        if (this.isMuted) {
            this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
            this.lastVolume = 0;
            return;
        }

        // Normalize speed against an approximate "racing" speed
        const normSpeed = Math.min(1, Math.max(0, Math.abs(speed) / 8));

        let gearNum = 0;
        if (gear && gear !== 'N') {
            const parsed = parseInt(gear, 10);
            if (!isNaN(parsed)) gearNum = parsed;
        }

        // Base engine frequency scales with gear and speed
        const baseFreq = 80 + gearNum * 35;         // higher gear → higher base
        const revSweep = normSpeed * 100;           // revs within gear
        const freq = baseFreq + revSweep;

        // Volume based on throttle and speed
        // Slightly higher base volume so it's more audible
        let volume = 0.05 + normSpeed * 0.15;
        if (throttlePressed) {
            volume += 0.08;
        }

        this.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
        this.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
        this.lastVolume = volume;
    }

    stop() {
        if (!this.enabled) return;
        try {
            this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
            this.lastVolume = 0;
        } catch (e) {
            // ignore
        }
    }

    mute() {
        if (!this.enabled) return;
        this.isMuted = true;
        this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }

    unmute() {
        if (!this.enabled) return;
        this.isMuted = false;
        this.gainNode.gain.setTargetAtTime(this.lastVolume || 0, this.ctx.currentTime, 0.05);
    }
}

// Simple UI/menu click sound helper
class MenuSound {
    static playClick() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;

        const ctx = new Ctx();
        try {
            if (ctx.state === 'suspended') ctx.resume();
        } catch (e) {
            // ignore
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 700;
        gain.gain.value = 0.2;

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.start(now);
        // Quick decay envelope
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.stop(now + 0.15);
    }
}

// Expose classes on window so Game can see them reliably
if (typeof window !== 'undefined') {
    window.EngineSound = EngineSound;
    window.MenuSound = MenuSound;
}



