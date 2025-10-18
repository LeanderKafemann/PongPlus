/**
 * Paddle - Represents a player or AI controlled paddle
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

export class Paddle {
  private smashCooldown: number = 0;
  private readonly smashCooldownMax: number = 120;
  private isSmashing: boolean = false;

  constructor(
    public x: number,
    public y: number,
    public width: number = 10,
    public height: number = 100,
    public speed: number = 6
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.isSmashing ? '#ff6b6b' : 'white';
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.width / 2);
    ctx.fill();

    if (this.smashCooldown > 0) {
      const cooldownPercent = this.smashCooldown / this.smashCooldownMax;
      ctx.fillStyle = `rgba(255, 107, 107, ${cooldownPercent * 0.5})`;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height * cooldownPercent, this.width / 2);
      ctx.fill();
    }
  }

  move(direction: number, canvasHeight: number): void {
    this.y += direction * this.speed;
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
  }

  update(): void {
    if (this.smashCooldown > 0) {
      this.smashCooldown--;
    }
    if (this.isSmashing) {
      this.isSmashing = false;
    }
  }

  smash(): boolean {
    if (this.smashCooldown === 0) {
      this.isSmashing = true;
      this.smashCooldown = this.smashCooldownMax;
      return true;
    }
    return false;
  }

  getIsSmashing(): boolean {
    return this.isSmashing;
  }
}