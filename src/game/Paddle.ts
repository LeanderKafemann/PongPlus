/**
 * Paddle - player/AI paddle implementation
 * v1.4.2 - paddle abilities fixed
 */

import type { Ability } from './AbilitySystem';

export class Paddle {
    public x: number;
    public y: number;
    public width: number = 10;
    public height: number = 100;
    public speed: number = 6;

    private abilities: Ability[] = [];
    private shieldUntil = 0;
    private smashUntil = 0;
    private superSmashUntil = 0;
    private miniUntil = 0;

    constructor(x: number, y: number) {
        this.x = x; this.y = y;
    }

    setAbilities(list: Ability[]): void {
        this.abilities = list;
    }

    getAssignedAbilities(): Ability[] {
        return this.abilities;
    }

    move(dir: number, canvasHeight: number): void {
        const delta = dir * this.speed;
        this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y + delta));
    }

    update(): void {
        // expire mini-paddle
        if (this.miniUntil && Date.now() > this.miniUntil) {
            this.height = 100;
            this.miniUntil = 0;
        }
        // expire smash/shield states are time-based and read on demand
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.hasShield() ? '#60a5fa' : '#ffffff';
        if ((ctx as any).roundRect) {
            (ctx as any).roundRect(this.x, this.y, this.width, this.height, 6);
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    hasShield(): boolean {
        return Date.now() < this.shieldUntil;
    }

    isSmashing(): boolean {
        return Date.now() < this.smashUntil;
    }

    isSuperSmashing(): boolean {
        return Date.now() < this.superSmashUntil;
    }

    activateAbility(type: any): boolean {
        // Centralized paddle ability effects that actually set state
        if (!type) return false;
        const t = typeof type === 'string' ? type : (type as any).toString();

        switch (t) {
            case 'SHIELD':
            case 'AbilityType.SHIELD':
                this.shieldUntil = Date.now() + 2500; // shield lasts 2.5s
                return true;
            case 'SMASH':
            case 'AbilityType.SMASH':
                this.smashUntil = Date.now() + 800;
                return true;
            case 'SUPER_SMASH':
            case 'AbilityType.SUPER_SMASH':
                this.superSmashUntil = Date.now() + 900;
                return true;
            case 'MINI_PADDLE':
            case 'AbilityType.MINI_PADDLE':
                this.applyMiniPaddle();
                return true;
            case 'GIANT_PADDLE':
            case 'AbilityType.GIANT_PADDLE':
                this.height = Math.min(300, this.height * 1.5);
                setTimeout(() => { this.height = 100; }, 5000);
                return true;
            default:
                // Other abilities handled at game level
                return true;
        }
    }

    teleport(canvasHeight: number): void {
        this.y = Math.max(0, Math.min(canvasHeight - this.height, (canvasHeight / 2) - (this.height / 2)));
    }

    applyMiniPaddle(): void {
        this.height = Math.max(30, Math.floor(this.height * 0.5));
        this.miniUntil = Date.now() + 3000;
        setTimeout(() => {
            if (Date.now() >= this.miniUntil) {
                this.height = 100;
                this.miniUntil = 0;
            }
        }, 3200);
    }
}