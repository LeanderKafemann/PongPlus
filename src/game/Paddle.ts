/**
 * Paddle - Represents a player or AI controlled paddle
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

export class Paddle {
  private smashCooldown: number = 0;
  private readonly smashCooldownMax: number = 120;
  private isSmashing: boolean = false;
  
  private shieldCooldown: number = 0;
  private readonly shieldCooldownMax: number = 300;
  private shieldActive: boolean = false;
  private shieldDuration: number = 0;
  private readonly shieldDurationMax: number = 90;
  
  private speedBoostCooldown: number = 0;
  private readonly speedBoostCooldownMax: number = 240;
  private speedBoostActive: boolean = false;
  private speedBoostDuration: number = 0;
  private readonly speedBoostDurationMax: number = 120;

  constructor(
    public x: number,
    public y: number,
    public width: number = 10,
    public height: number = 100,
    public speed: number = 6
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    // Shield effect
    if (this.shieldActive) {
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

    // Main paddle
    let paddleColor = 'white';
    if (this.isSmashing) paddleColor = '#ff6b6b';
    if (this.speedBoostActive) paddleColor = '#ffeb3b';
    
    ctx.fillStyle = paddleColor;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.width / 2);
    ctx.fill();

    // Cooldown indicators
    const indicatorY = this.y + this.height + 10;
    this.drawCooldownBar(ctx, this.x, indicatorY, this.smashCooldown, this.smashCooldownMax, '#ff6b6b');
    this.drawCooldownBar(ctx, this.x, indicatorY + 8, this.shieldCooldown, this.shieldCooldownMax, '#64c8ff');
    this.drawCooldownBar(ctx, this.x, indicatorY + 16, this.speedBoostCooldown, this.speedBoostCooldownMax, '#ffeb3b');
  }

  private drawCooldownBar(ctx: CanvasRenderingContext2D, x: number, y: number, current: number, max: number, color: string): void {
    if (current === 0) return;
    
    const width = this.width;
    const height = 3;
    const percent = current / max;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * percent, height);
  }

  move(direction: number, canvasHeight: number): void {
    const currentSpeed = this.speedBoostActive ? this.speed * 1.8 : this.speed;
    this.y += direction * currentSpeed;
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
  }

  update(): void {
    if (this.smashCooldown > 0) this.smashCooldown--;
    if (this.isSmashing) this.isSmashing = false;
    
    if (this.shieldActive) {
      this.shieldDuration--;
      if (this.shieldDuration <= 0) {
        this.shieldActive = false;
      }
    }
    if (this.shieldCooldown > 0) this.shieldCooldown--;
    
    if (this.speedBoostActive) {
      this.speedBoostDuration--;
      if (this.speedBoostDuration <= 0) {
        this.speedBoostActive = false;
      }
    }
    if (this.speedBoostCooldown > 0) this.speedBoostCooldown--;
  }

  smash(): boolean {
    if (this.smashCooldown === 0) {
      this.isSmashing = true;
      this.smashCooldown = this.smashCooldownMax;
      return true;
    }
    return false;
  }

  activateShield(): boolean {
    if (this.shieldCooldown === 0) {
      this.shieldActive = true;
      this.shieldDuration = this.shieldDurationMax;
      this.shieldCooldown = this.shieldCooldownMax;
      return true;
    }
    return false;
  }

  activateSpeedBoost(): boolean {
    if (this.speedBoostCooldown === 0) {
      this.speedBoostActive = true;
      this.speedBoostDuration = this.speedBoostDurationMax;
      this.speedBoostCooldown = this.speedBoostCooldownMax;
      return true;
    }
    return false;
  }

  getIsSmashing(): boolean {
    return this.isSmashing;
  }

  hasShield(): boolean {
    return this.shieldActive;
  }
}