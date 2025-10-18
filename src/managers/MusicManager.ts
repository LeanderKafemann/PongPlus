/**
 * MusicManager - Handles background music
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.2.0
 */

export class MusicManager {
  private audioContext: AudioContext;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private enabled: boolean = false;
  private currentNote: number = 0;
  
  // Pentatonic scale (C, D, E, G, A) - sounds pleasant
  private melody: number[] = [
    261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
    523.25, 587.33, 659.25 // C5, D5, E5
  ];

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  start(): void {
    if (this.enabled) return;
    
    this.enabled = true;
    this.playNote();
  }

  stop(): void {
    this.enabled = false;
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
  }

  private playNote(): void {
    if (!this.enabled) return;

    // Create oscillator and gain
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    // Configure
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = this.melody[this.currentNote];
    
    // Soft volume
    this.gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    // Connect and play
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.oscillator.start();
    this.oscillator.stop(this.audioContext.currentTime + 0.5);

    // Next note
    this.currentNote = (this.currentNote + 1) % this.melody.length;

    // Schedule next note
    setTimeout(() => this.playNote(), 500);
  }

  toggle(): boolean {
    if (this.enabled) {
      this.stop();
    } else {
      this.start();
    }
    return this.enabled;
  }

  isPlaying(): boolean {
    return this.enabled;
  }
}