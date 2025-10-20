/**
 * Ball - Represents the game ball with physics and visual effects
 * - Ghost mode: invisible but still collidable
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.4.0
 */

export class Ball {
    private trailPositions: { x: number; y: number }[] = [];
    private maxTrailLength: number = 8;
    private readonly maxSpeed: number = 12;
    public isGhost: boolean = false;
    public isMultiBall: boolean = false;
    public multiBallId: number = 0;
    public gravityActive: boolean = false;

    constructor(
        public x: number,
        public y: number,
        public radius: number = 8,
        public speedX: number = 4,
        public speedY: number = 4
    ) { }

    draw(ctx: CanvasRenderingContext2D): void {
        // If ghost, render nothing (invisible) but keep physics/collisions active
        if (this.isGhost) {
            // optionally draw a very faint debug dot if you want - currently fully invisible
            return;
        }

        const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        const initialSpeed = Math.sqrt(4 * 4 + 4 * 4);
        const speedMultiplier = currentSpeed / initialSpeed;

        // Draw trail
        this.trailPositions.forEach((pos, index) => {
            const alpha = (index / this.trailPositions.length) * 0.4 * Math.min(speedMultiplier, 2);
            const size = this.radius * (0.5 + (index / this.trailPositions.length) * 0.5);

            if (this.isMultiBall) {
                const color = this.getMultiBallColor();
                ctx.fillStyle = color.replace('1)', `${alpha})`);
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            }

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Glow effect when fast
        if (speedMultiplier > 1.5) {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
            if (this.isMultiBall) {
                const color = this.getMultiBallColor();
                gradient.addColorStop(0, color);
                gradient.addColorStop(0.5, color.replace('1)', '0.8)'));
                gradient.addColorStop(1, color.replace('1)', '0)'));
            } else {
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.5, 'rgba(255, 200, 200, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
            }
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Main ball
        ctx.fillStyle = this.isMultiBall ? this.getMultiBallColor() : 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    private getMultiBallColor(): string {
        const colors = ['rgba(251, 191, 36, 1)', 'rgba(34, 197, 94, 1)', 'rgba(59, 130, 246, 1)'];
        return colors[this.multiBallId % 3];
    }

    update(): void {
        // Apply gravity if active
        if (this.gravityActive) {
            this.speedY += 0.15;
        }

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
        this.isGhost = false;
        this.isMultiBall = false;
        this.gravityActive = false;
    }

    getSpeed(): number {
        return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    }

    applySlowMotion(): void {
        this.speedX *= 0.5;
        this.speedY *= 0.5;
    }

    removeSlowMotion(): void {
        this.speedX *= 2;
        this.speedY *= 2;
    }

    setGhost(isGhost: boolean): void {
        this.isGhost = isGhost;
    }

    clone(id: number): Ball {
        const clone = new Ball(this.x, this.y, this.radius, this.speedX, this.speedY);
        clone.isMultiBall = true;
        clone.multiBallId = id;

        const angle = (id - 1) * 0.5;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        clone.speedX = this.speedX * cos - this.speedY * sin;
        clone.speedY = this.speedX * sin + this.speedY * cos;

        return clone;
    }
}