/**
 * Paddle - player/AI paddle implementation
 * v1.4.0
 */

import type { Ability, AbilityType } from './AbilitySystem';

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
        // reduce temporary states durations based on time elsewhere or implement timers
        // For simplicity, we rely on external timeouts to toggle states (applyMiniPaddle etc.)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect?.(this.x, this.y, this.width, this.height, 6); // If supported
        // fallback:
        ctx.fillRect(this.x, this.y, this.width, this.height);
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

    activateAbility(type: AbilityType): boolean {
        // Placeholder: return true if ability "available" - in real impl check cooldowns
        // For AI we simply return true to indicate usage
        return true;
    }

    teleport(canvasHeight: number): void {
        // Snap to center vertical
        this.y = Math.max(0, Math.min(canvasHeight - this.height, canvasHeight / 2 - this.height / 2));
    }

    applyMiniPaddle(): void {
        this.height = Math.max(30, this.height * 0.5);
        this.miniUntil = Date.now() + 3000;
        setTimeout(() => {
            this.height = 100;
        }, 3000);
    }
}