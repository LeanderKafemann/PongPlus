/**
 * Paddle - Represents a player or AI controlled paddle
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

import type { Ability, AbilityType } from './AbilitySystem';

interface AbilityState {
  cooldown: number;
  active: boolean;
  duration: number;
}

export class Paddle {
  private abilities: Map<AbilityType, AbilityState> = new Map();
  private assignedAbilities: Ability[] = [];
  private originalHeight: number;
  private ghostBallActive: boolean = false;

  constructor(
    public x: number,
    public y: number,
    public width: number = 10,
    public height: number = 100,
    public speed: number = 6
  ) {
    this.originalHeight = height;
  }

  /**
   * Assigns the random abilities for this game
   */
  setAbilities(abilities: Ability[]): void {
    this.assignedAbilities = abilities;
    abilities.forEach(ability => {
      this.abilities.set(ability.type, {
        cooldown: 0,
        active: false,
        duration: 0
      });
    });
  }

  getAssignedAbilities(): Ability[] {
    return this.assignedAbilities;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Shield effect
    const shieldState = this.abilities.get('shield' as AbilityType);
    if (shieldState?.active) {
      const gradient = ctx.createRadialGradient(
        this.x + this.width / 2, 
        this.y + this.height / 2, 
        0, 
        this.x + this.width / 2, 
        this.y + this.height / 2, 
        this.height / 2 + 10
      );
      gradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
      gradient.addColorStop(0.7, 'rgba(100, 200, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(100, 200, 255, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
    }

    // Determine paddle color based on active abilities
    let paddleColor = 'white';
    const smashState = this.abilities.get('smash' as AbilityType);
    const speedState = this.abilities.get('speedBoost' as AbilityType);
    const giantState = this.abilities.get('giantPaddle' as AbilityType);
    
    if (smashState?.active) paddleColor = '#ff6b6b';
    else if (speedState?.active) paddleColor = '#ffeb3b';
    else if (giantState?.active) paddleColor = '#f97316';
    
    // Main paddle
    ctx.fillStyle = paddleColor;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.width / 2);
    ctx.fill();

    // Cooldown indicators
    this.drawCooldownIndicators(ctx);
  }

  private drawCooldownIndicators(ctx: CanvasRenderingContext2D): void {
    const indicatorY = this.y + this.height + 10;
    let offsetY = 0;

    this.assignedAbilities.forEach((ability, index) => {
      const state = this.abilities.get(ability.type);
      if (state && state.cooldown > 0) {
        this.drawCooldownBar(
          ctx, 
          this.x, 
          indicatorY + offsetY, 
          state.cooldown, 
          ability.cooldownMax, 
          ability.color
        );
        offsetY += 8;
      }
    });
  }

  private drawCooldownBar(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    current: number, 
    max: number, 
    color: string
  ): void {
    const width = this.width;
    const height = 3;
    const percent = current / max;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * percent, height);
  }

  move(direction: number, canvasHeight: number): void {
    const speedState = this.abilities.get('speedBoost' as AbilityType);
    const currentSpeed = speedState?.active ? this.speed * 1.8 : this.speed;
    this.y += direction * currentSpeed;
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
  }

  update(): void {
    this.abilities.forEach((state, type) => {
      if (state.cooldown > 0) state.cooldown--;
      
      if (state.active) {
        state.duration--;
        if (state.duration <= 0) {
          state.active = false;
          
          // Reset size for giant paddle
          if (type === 'giantPaddle') {
            this.height = this.originalHeight;
          }
        }
      }
    });
  }

  activateAbility(type: AbilityType): boolean {
    const state = this.abilities.get(type);
    const ability = this.assignedAbilities.find(a => a.type === type);
    
    if (!state || !ability || state.cooldown > 0) return false;
    
    state.cooldown = ability.cooldownMax;
    
    if (ability.duration) {
      state.active = true;
      state.duration = ability.duration;
      
      // Special handling for giant paddle
      if (type === 'giantPaddle') {
        this.height = this.originalHeight * 1.5;
      }
    } else {
      state.active = true;
      // For instant abilities, deactivate immediately
      setTimeout(() => { state.active = false; }, 50);
    }
    
    return true;
  }

  teleport(canvasHeight: number): void {
    this.y = canvasHeight / 2 - this.height / 2;
  }

  hasShield(): boolean {
    const state = this.abilities.get('shield' as AbilityType);
    return state?.active || false;
  }

  isSmashing(): boolean {
    const state = this.abilities.get('smash' as AbilityType);
    return state?.active || false;
  }

  hasSlowMotion(): boolean {
    const state = this.abilities.get('slowMotion' as AbilityType);
    return state?.active || false;
  }

  hasGhostBall(): boolean {
    const state = this.abilities.get('ghostBall' as AbilityType);
    return state?.active || false;
  }
}