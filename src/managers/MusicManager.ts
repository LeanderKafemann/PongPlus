/**
 * MusicManager - Handles background music
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.3.1
 */

export class MusicManager {
    private audioContext: AudioContext;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private enabled: boolean = false;
    private currentNote: number = 0;

    // Pentatonic scale (C, D, E, G, A) - extended to two octaves
    private melody: number[] = [
        261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
        523.25, 587.33, 659.25, 783.99, 880.00  // C5, D5, E5, G5, A5
    ];

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    /**
     * Start playing background music
     */
    start(): void {
        if (this.enabled) return;

        this.enabled = true;
        this.playNote();
    }

    /**
     * Stop background music
     */
    stop(): void {
        this.enabled = false;
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
    }

    /**
     * Play a single note in the melody
     * @private
     */
    private playNote(): void {
        if (!this.enabled) return;

        // Create audio nodes
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        // Configure oscillator
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = this.melody[this.currentNote];

        // Soft volume with fade out
        this.gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        // Connect and play
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.oscillator.start();
        this.oscillator.stop(this.audioContext.currentTime + 0.1);

        // Move to next note
        this.currentNote = (this.currentNote + 1) % this.melody.length;

        // Schedule next note - MUCH FASTER: 100ms instead of 250ms
        setTimeout(() => this.playNote(), 100);
    }

    /**
     * Toggle music on/off
     * @returns Current music state (true = playing)
     */
    toggle(): boolean {
        if (this.enabled) {
            this.stop();
        } else {
            this.start();
        }
        return this.enabled;
    }

    /**
     * Check if music is currently playing
     * @returns True if music is playing
     */
    isPlaying(): boolean {
        return this.enabled;
    }
}