/**
 * Ball - Represents the game ball with physics and visual effects
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

export class Ball {
  private trailPositions: { x: number; y: number }[] = [];
  private maxTrailLength: number = 8;
  private readonly maxSpeed: number = 12;

  constructor(
    public x: number,
    public y: number,
    public radius: number = 8,
    public speedX: number = 4,
    public speedY: number = 4
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    const initialSpeed = Math.sqrt(4 * 4 + 4 * 4);
    const speedMultiplier = currentSpeed / initialSpeed;

    // Draw trail
    this.trailPositions.forEach((pos, index) => {
      const alpha = (index / this.trailPositions.length) * 0.4 * Math.min(speedMultiplier, 2);
      const size = this.radius * (0.5 + (index / this.trailPositions.length) * 0.5);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glow effect when fast
    if (speedMultiplier > 1.5) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 200, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main ball
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(): void {
    // Limit speed
    const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    if (currentSpeed > this.maxSpeed) {
      const scale = this.maxSpeed / currentSpeed;
      this.speedX *= scale;
      this.speedY *= scale;
    }

    // Update trail
    this.trailPositions.push({ x: this.x, y: this.y });
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.shift();
    }

    this.x += this.speedX;
    this.y += this.speedY;
  }

  reset(canvasWidth: number, canvasHeight: number): void {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.speedY = (Math.random() - 0.5) * 8;
    this.trailPositions = [];
  }

  getSpeed(): number {
    return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
  }
}