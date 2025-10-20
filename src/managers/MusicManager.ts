/**
 * MusicManager - Handles background music (configurable tempo)
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.4.0
 */

export class MusicManager {
    private audioContext: AudioContext;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private enabled: boolean = false;
    private currentNote: number = 0;
    private noteTimeoutId: number | null = null;

    // Pentatonic scale (C, D, E, G, A) - two octaves
    private melody: number[] = [
        261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
        523.25, 587.33, 659.25, 783.99, 880.00  // C5, D5, E5, G5, A5
    ];

    // tempo in ms between notes; configurable
    private tempoMs: number;

    constructor(tempoMs = 120) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.tempoMs = tempoMs; // default faster tempo for energetic gameplay
    }

    /**
     * Start playing background music
     */
    start(): void {
        if (this.enabled) return;
        this.enabled = true;
        this.scheduleNextNote();
    }

    /**
     * Stop background music
     */
    stop(): void {
        this.enabled = false;
        if (this.noteTimeoutId) {
            clearTimeout(this.noteTimeoutId);
            this.noteTimeoutId = null;
        }
        if (this.oscillator) {
            try { this.oscillator.stop(); } catch (e) { /* ignore */ }
            this.oscillator = null;
        }
    }

    /**
     * Play a single note and schedule the next one
     * @private
     */
    private scheduleNextNote(): void {
        if (!this.enabled) return;

        const freq = this.melody[this.currentNote % this.melody.length];

        const osc = this.audioContext.createOscillator();
        const g = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        // Quick soft pluck envelope
        g.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        g.gain.exponentialRampToValueAtTime(0.008, this.audioContext.currentTime + 0.08);

        osc.connect(g);
        g.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);

        this.oscillator = osc;
        this.gainNode = g;

        this.currentNote = (this.currentNote + 1) % this.melody.length;

        this.noteTimeoutId = window.setTimeout(() => {
            // continue if still enabled
            if (this.enabled) this.scheduleNextNote();
        }, this.tempoMs);
    }

    /**
     * Toggle music on/off
     * @returns Current music state
     */
    toggle(): boolean {
        if (this.enabled) this.stop();
        else this.start();
        return this.enabled;
    }

    /**
     * Check if music is playing
     */
    isPlaying(): boolean {
        return this.enabled;
    }

    /**
     * Set tempo at runtime (ms per note)
     */
    setTempo(ms: number): void {
        this.tempoMs = Math.max(40, ms); // clamp to reasonable minimum
    }
}