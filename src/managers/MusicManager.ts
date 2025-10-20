/**
 * MusicManager - Handles background music (configurable tempo)
 * v1.4.1
 */

export class MusicManager {
    private audioContext: AudioContext;
    private oscillator: OscillatorNode | null = null;
    private enabled: boolean = false;
    private currentNote: number = 0;
    private noteTimeoutId: number | null = null;

    // Pentatonic scale (C, D, E, G, A)
    private melody: number[] = [
        261.63, 293.66, 329.63, 392.00, 440.00,
        523.25, 587.33, 659.25, 783.99, 880.00
    ];

    private tempoMs: number;

    constructor(tempoMs = 120) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.tempoMs = tempoMs;
    }

    start(): void {
        if (this.enabled) return;
        this.enabled = true;
        this.scheduleNextNote();
    }

    stop(): void {
        this.enabled = false;
        if (this.noteTimeoutId) {
            clearTimeout(this.noteTimeoutId);
            this.noteTimeoutId = null;
        }
        if (this.oscillator) {
            try { this.oscillator.stop(); } catch (e) { }
            this.oscillator = null;
        }
    }

    private scheduleNextNote(): void {
        if (!this.enabled) return;

        const freq = this.melody[this.currentNote % this.melody.length];

        const osc = this.audioContext.createOscillator();
        const g = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        g.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        g.gain.exponentialRampToValueAtTime(0.008, this.audioContext.currentTime + 0.08);

        osc.connect(g);
        g.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);

        this.oscillator = osc;
        this.currentNote = (this.currentNote + 1) % this.melody.length;

        this.noteTimeoutId = window.setTimeout(() => {
            if (this.enabled) this.scheduleNextNote();
        }, this.tempoMs);
    }

    toggle(): boolean {
        if (this.enabled) this.stop();
        else this.start();
        return this.enabled;
    }

    isPlaying(): boolean {
        return this.enabled;
    }

    setTempo(ms: number): void {
        this.tempoMs = Math.max(40, ms);
    }
}