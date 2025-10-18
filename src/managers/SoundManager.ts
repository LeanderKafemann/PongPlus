/**
 * SoundManager - Handles all audio effects
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

export class SoundManager {
  private sounds: { [key: string]: AudioBuffer } = {};
  private audioContext: AudioContext;
  private enabled: boolean = true;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.createSounds();
  }

  private createSounds() {
    this.sounds.paddleHit = this.createTone(440, 0.1);
    this.sounds.wallHit = this.createTone(220, 0.1);
    this.sounds.score = this.createTone(330, 0.3);
    this.sounds.smash = this.createTone(550, 0.15);
  }

  private createTone(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * Math.exp(-3 * i / numSamples);
    }

    return buffer;
  }

  play(soundName: string) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[soundName];
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}