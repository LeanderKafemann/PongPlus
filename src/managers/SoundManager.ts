/**
 * SoundManager - lightweight WebAudio-based SFX manager
 * v1.4.0
 */

export class SoundManager {
    private ctx: AudioContext;
    private enabled: boolean = true;

    constructor() {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    toggle(): boolean {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    play(name: string): void {
        if (!this.enabled) return;

        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';

        // Map name to freq/duration
        let freq = 440;
        let dur = 0.08;
        switch (name) {
            case 'paddleHit': freq = 440; dur = 0.06; break;
            case 'wallHit': freq = 220; dur = 0.06; break;
            case 'score': freq = 330; dur = 0.12; break;
            case 'smash': freq = 600; dur = 0.12; break;
            case 'shield': freq = 660; dur = 0.08; break;
            case 'speedBoost': freq = 880; dur = 0.08; break;
            case 'teleport': freq = 1000; dur = 0.1; break;
            case 'ghostBall': freq = 300; dur = 0.1; break;
            case 'multiBall': freq = 520; dur = 0.12; break;
            case 'countdown': freq = 400; dur = 0.08; break;
            default: freq = 440; dur = 0.06; break;
        }

        o.frequency.value = freq;
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t);
        o.stop(t + dur + 0.02);
    }
}