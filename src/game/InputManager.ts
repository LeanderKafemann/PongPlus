/**
 * InputManager - handles keyboard input, secret sequences and exposes key states
 * v1.4.3
 *
 * - setActive(flag) prevents arrow key page scrolling while game is active
 * - triggers polaroid on 'photo' sequence
 */

type SecretCallback = (sequence: string) => void;
type PolaroidCallback = () => void;

export class InputManager {
    private keys: Record<string, boolean> = {};
    private sequence: string = '';
    private lastKeyTime = 0;
    private secretCb: SecretCallback;
    private polaroidCb: PolaroidCallback;
    private active: boolean = false;

    constructor(secretCb: SecretCallback, polaroidCb: PolaroidCallback) {
        this.secretCb = secretCb;
        this.polaroidCb = polaroidCb;
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    setActive(flag: boolean) {
        this.active = !!flag;
    }

    private onKeyDown(e: KeyboardEvent) {
        // prevent page scroll when active and arrow keys pressed
        if (this.active && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        this.keys[e.key] = true;

        // secret handling
        const now = Date.now();
        if (now - this.lastKeyTime > 2000) this.sequence = '';
        this.lastKeyTime = now;
        this.sequence += e.key.toLowerCase();
        if (this.sequence.includes('photo')) {
            this.sequence = '';
            this.polaroidCb();
            return;
        }
        this.secretCb(this.sequence);
        if (this.sequence.length > 40) this.sequence = this.sequence.slice(-40);
    }

    private onKeyUp(e: KeyboardEvent) {
        this.keys[e.key] = false;
    }

    isKeyDown(key: string): boolean {
        return !!this.keys[key];
    }
}