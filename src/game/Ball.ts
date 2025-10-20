/**
 * Ball - physics and rendering
 * v1.4.1
 */

export class Ball {
    public x: number;
    public y: number;
    public radius: number;
    public speedX: number;
    public speedY: number;
    private trailPositions: { x: number, y: number }[] = [];
    private maxTrailLength = 8;
    private readonly maxSpeed = 12;

    public isGhost: boolean = false;
    public isMultiBall: boolean = false;
    public multiBallId: number = 0;
    public gravityActive: boolean = false;

    constructor(x: number, y: number, radius = 8, sx = 4, sy = 4) {
        this.x = x; this.y = y; this.radius = radius;
        this.speedX = sx; this.speedY = sy;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.isGhost) {
            // invisible; collisions still work
            return;
        }

        // draw trail
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (i / this.trailPositions.length) * 0.4;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.radius * (0.5 + i / this.trailPositions.length * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }

        // glow when fast
        const speed = this.getSpeed();
        if (speed > 6) {
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
            g.addColorStop(0, 'rgba(255,255,255,1)');
            g.addColorStop(1, 'rgba(255,100,100,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // ball
        ctx.fillStyle = this.isMultiBall ? this.getMultiBallColor() : 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    private getMultiBallColor(): string {
        const colors = ['rgba(251,191,36,1)', 'rgba(34,197,94,1)', 'rgba(59,130,246,1)'];
        return colors[this.multiBallId % colors.length];
    }

    update(): void {
        if (this.gravityActive) this.speedY += 0.15;

        // clamp speed
        const cur = this.getSpeed();
        if (cur > this.maxSpeed) {
            const scale = this.maxSpeed / cur;
            this.speedX *= scale; this.speedY *= scale;
        }

        this.trailPositions.push({ x: this.x, y: this.y });
        if (this.trailPositions.length > this.maxTrailLength) this.trailPositions.shift();

        this.x += this.speedX;
        this.y += this.speedY;
    }

    reset(canvasW: number, canvasH: number): void {
        this.x = canvasW / 2; this.y = canvasH / 2;
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
        this.speedX *= 0.5; this.speedY *= 0.5;
    }

    removeSlowMotion(): void {
        this.speedX *= 2; this.speedY *= 2;
    }

    setGhost(g: boolean): void {
        this.isGhost = g;
    }

    clone(id: number): Ball {
        const clone = new Ball(this.x, this.y, this.radius, this.speedX, this.speedY);
        clone.isMultiBall = true;
        clone.multiBallId = id;
        // spread angle
        const angle = (id - 1) * 0.5;
        const cos = Math.cos(angle), sin = Math.sin(angle);
        clone.speedX = this.speedX * cos - this.speedY * sin;
        clone.speedY = this.speedX * sin + this.speedY * cos;
        return clone;
    }
}