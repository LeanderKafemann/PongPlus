/**
 * Paddle - player/AI paddle implementation
 * v1.4.0
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
    private miniUntil = 0; // will track when mini effect expires

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
        // handle mini-paddle expiration if active
        if (this.miniUntil && Date.now() > this.miniUntil) {
            this.height = 100; // reset to default
            this.miniUntil = 0;
        }
        // other time-based state handling could be placed here
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#fff';
        // Use rounded rect if supported; fallback to rect
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
        // Placeholder - in a full impl check cooldowns & availability
        // For AI usage, returning true simulates activation success.
        return true;
    }

    teleport(canvasHeight: number): void {
        // center vertically
        this.y = Math.max(0, Math.min(canvasHeight - this.height, (canvasHeight / 2) - (this.height / 2)));
    }

    applyMiniPaddle(): void {
        // shrink paddle temporarily
        this.height = Math.max(30, Math.floor(this.height * 0.5));
        this.miniUntil = Date.now() + 3000;
        setTimeout(() => {
            // ensure expiration at end (in case update didn't run)
            if (Date.now() >= this.miniUntil) {
                this.height = 100;
                this.miniUntil = 0;
            }
        }, 3200);
    }
}