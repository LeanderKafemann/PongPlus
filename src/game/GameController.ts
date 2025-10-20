/**
 * GameController - central orchestrator (v1.4.2)
 * - central game loop
 * - delegates AI to AIController
 * - delegates input handling to InputManager
 * - delegates UI to UIManager
 *
 * This file contains the main loop and wiring previously in PongGame,
 * split into smaller modules for easier maintenance.
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { AbilitySystem, AbilityType, type Ability } from './AbilitySystem';
import { SoundManager } from '../managers/SoundManager';
import { MusicManager } from '../managers/MusicManager';
import { LeaderboardManager } from '../managers/LeaderboardManager';
import { AIController } from './AIController';
import { InputManager } from './InputManager';
import { UIManager } from './UIManager';
import type { GameConfig } from './types';

export class GameController {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private player: Paddle;
    private ai: Paddle;
    private ball: Ball;
    private balls: Ball[] = [];

    private playerScore = 0;
    private aiScore = 0;

    private animationId: number | null = null;
    private paused = false;
    private gameRunning = false;

    private soundManager: SoundManager;
    private musicManager: MusicManager;
    private leaderboardManager: LeaderboardManager;
    private abilitySystem: AbilitySystem;

    private aiController: AIController;
    private inputManager: InputManager;
    private uiManager: UIManager;

    private config: GameConfig;

    // effect flags
    private slowMotionActive = false;
    private reverseControlsActive = false;
    private magnetActive = false;
    private doubleScoreActive = false;
    private freezeActive = false;
    private multiBallActive = false;
    private gravityActive = false;

    // cooldown map
    private abilityCooldowns: Map<AbilityType, number> = new Map();

    constructor() {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
        if (!canvas) throw new Error('gameCanvas element missing');
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('2D ctx missing');
        this.ctx = ctx;

        this.soundManager = new SoundManager();
        this.musicManager = new MusicManager(120);
        this.leaderboardManager = new LeaderboardManager();
        this.abilitySystem = new AbilitySystem();

        this.config = {
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            winScore: 10,
            paddleSpeed: 6
        };

        const offset = 20;
        this.player = new Paddle(offset, this.canvas.height / 2 - 50);
        this.ai = new Paddle(this.canvas.width - offset - 10, this.canvas.height / 2 - 50);
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
        this.balls = [this.ball];

        this.aiController = new AIController(this.ai, this.player, () => this.reverseControlsActive);
        this.inputManager = new InputManager(this.onSecret.bind(this), this.onPolaroid.bind(this));
        this.uiManager = new UIManager(this);

        // wire UI controls
        this.uiManager.onStart(() => this.startGame());
        this.uiManager.onShowLeaderboard(() => this.showLeaderboard());
        this.uiManager.onSaveScore(() => this.saveScore());
        this.uiManager.onBackToMenu(() => this.showMenu());
        this.uiManager.onToggleArcade((v) => { this.config.winScore = v ? 9999 : 10; /* keep winScore default; arcade uses AI 10 rule */ });

        // ensure screens hidden correctly
        this.uiManager.showMenu();
    }

    // called by UIManager when user types secrets
    private onSecret(seq: string): void {
        // polaroid handled separately
        // other sequences forwarded to UI manager
    }

    private onPolaroid(): void {
        // handled by uiManager -> create screenshot and download
        this.uiManager.takePolaroid(this.canvas);
    }

    public startGame(): void {
        this.stopGame();

        const abilities = this.abilitySystem.selectRandomAbilities();
        this.player.setAbilities(abilities);
        this.ai.setAbilities(abilities);
        this.uiManager.displaySelectedAbilities(abilities);

        this.musicManager.start();
        this.uiManager.showGame();

        this.playerScore = 0; this.aiScore = 0;
        this.updateScoreUI();

        this.ball.reset(this.canvas.width, this.canvas.height);
        this.balls = [this.ball];

        this.paused = false;
        this.gameRunning = true;

        // simple countdown
        this.gameLoop();
    }

    private updateScoreUI(): void {
        this.uiManager.updateScore(this.playerScore, this.aiScore);
    }

    private stopGame(): void {
        this.gameRunning = false;
        if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
    }

    private gameLoop = (): void => {
        if (!this.gameRunning || this.paused) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.gameLoop);
    };

    private update(): void {
        // player input movement
        const up = this.inputManager.isKeyDown('ArrowUp') || this.inputManager.isKeyDown('w');
        const down = this.inputManager.isKeyDown('ArrowDown') || this.inputManager.isKeyDown('s');
        if (up) this.player.move(-1, this.canvas.height);
        if (down) this.player.move(1, this.canvas.height);
        this.player.update();

        // AI decides movement & ability usage
        this.aiController.update(this.balls[0], this);

        // magnet effect (only in front of player)
        if (this.magnetActive) {
            const paddleCenter = this.player.y + this.player.height / 2;
            this.balls.forEach(ball => {
                if (ball.x < this.canvas.width / 2 && ball.x > this.player.x + this.player.width) {
                    const dy = paddleCenter - ball.y;
                    const dist = Math.abs(dy);
                    if (dist < 200) {
                        const force = Math.max(0.004, 0.015 * (1 - dist / 200));
                        ball.speedY += dy * force;
                    }
                }
            });
        }

        // update balls, collisions and scoring
        this.balls = this.balls.filter(ball => {
            ball.update();

            // walls
            if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= this.canvas.height) {
                ball.speedY *= -1;
                ball.y = Math.max(ball.radius, Math.min(this.canvas.height - ball.radius, ball.y));
                this.soundManager.play('wallHit');
            }

            // paddle collisions
            const playerCollision = this.checkCollision(ball, this.player);
            const aiCollision = this.checkCollision(ball, this.ai);

            if (playerCollision || aiCollision) {
                const paddle = playerCollision ? this.player : this.ai;
                if (paddle.hasShield()) {
                    ball.speedX *= -1;
                    this.soundManager.play('shield');
                } else {
                    const hitPos = (ball.y - paddle.y) / paddle.height;
                    ball.speedY = (hitPos - 0.5) * 10;
                    ball.speedX *= -1;

                    if (paddle.isSuperSmashing()) {
                        ball.speedX *= 2.0;
                        ball.speedY *= 1.5;
                        this.soundManager.play('smash');
                        this.soundManager.play('score');
                    } else if (paddle.isSmashing()) {
                        ball.speedX *= 1.5;
                        ball.speedY *= 1.2;
                        this.soundManager.play('smash');
                    } else {
                        ball.speedX *= 1.05;
                        this.soundManager.play('paddleHit');
                    }
                }

                if (playerCollision) ball.x = this.player.x + this.player.width + ball.radius;
                else ball.x = this.ai.x - ball.radius;
            }

            // scoring
            if (ball.x - ball.radius <= 0) {
                const points = this.doubleScoreActive ? 2 : 1;
                this.aiScore += points;
                this.soundManager.play('score');
                this.doubleScoreActive = false;
                this.updateScoreUI();
                this.checkGameOver();
                return false;
            } else if (ball.x + ball.radius >= this.canvas.width) {
                const points = this.doubleScoreActive ? 2 : 1;
                this.playerScore += points;
                this.soundManager.play('score');
                this.doubleScoreActive = false;
                this.updateScoreUI();
                this.checkGameOver();
                return false;
            }

            return true;
        });

        if (this.balls.length === 0 && this.gameRunning) {
            this.ball.reset(this.canvas.width, this.canvas.height);
            this.balls = [this.ball];
        }
    }

    private checkCollision(ball: Ball, paddle: Paddle): boolean {
        const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
        const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        return (dx * dx + dy * dy) < (ball.radius * ball.radius);
    }

    private draw(): void {
        // background & effects left simple — UIManager handles overlays when required
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.slowMotionActive) {
            this.ctx.fillStyle = 'rgba(76,222,128,0.06)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // center line
        this.ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // draw entities
        this.player.draw(this.ctx);
        this.ai.draw(this.ctx);
        this.balls.forEach(b => b.draw(this.ctx));
    }

    private checkGameOver(): void {
        // arcade mode: AI wins at 10 (uiManager controls arcade toggle)
        if (this.uiManager.isArcade()) {
            if (this.aiScore >= 10 || this.playerScore >= this.config.winScore) {
                this.endGame();
            }
        } else {
            if (this.playerScore >= this.config.winScore || this.aiScore >= this.config.winScore) {
                this.endGame();
            }
        }
    }

    private endGame(): void {
        this.stopGame();
        this.musicManager.stop();
        this.uiManager.showGameOver(this.playerScore > this.aiScore, this.playerScore, this.aiScore);
    }

    public saveScore(): void {
        // invoked by UI
        const name = this.uiManager.getPlayerName() || 'Anonymous';
        const mode = this.uiManager.isArcade() ? 'arcade' : 'standard';
        this.leaderboardManager.addEntry(name, this.playerScore, this.aiScore, mode);
        this.uiManager.showMenu();
    }

    private updateScoreUI() {
        this.uiManager.updateScore(this.playerScore, this.aiScore);
    }

    // Expose ability activation so AIController can request and UI/keys can trigger
    public tryActivateAbility(type: AbilityType): boolean {
        const last = this.abilityCooldowns.get(type) ?? 0;
        if (Date.now() < last) return false;
        this.abilityCooldowns.set(type, Date.now() + 4000);
        // apply to player
        this.player.activateAbility(type);
        // central effects for certain abilities
        switch (type) {
            case AbilityType.MAGNET: this.magnetActive = true; setTimeout(() => this.magnetActive = false, 2000); break;
            case AbilityType.DOUBLE_SCORE: this.doubleScoreActive = true; break;
            case AbilityType.GHOST_BALL: this.balls.forEach(b => b.setGhost(true)); setTimeout(() => this.balls.forEach(b => b.setGhost(false)), 1500); break;
            case AbilityType.SLOW_MOTION: this.slowMotionActive = true; this.balls.forEach(b => b.applySlowMotion()); setTimeout(() => { this.slowMotionActive = false; this.balls.forEach(b => b.removeSlowMotion()); }, 2000); break;
            case AbilityType.MULTI_BALL: this.activateMultiBall(); break;
        }
        return true;
    }

    private activateMultiBall(): void {
        if (this.multiBallActive || this.balls.length > 1) return;
        this.multiBallActive = true;
        this.soundManager.play('multiBall');
        const main = this.balls[0];
        this.balls.push(main.clone(1), main.clone(2));
        setTimeout(() => { this.balls = this.balls.slice(0, 1); this.multiBallActive = false; }, 3000);
    }

    // UI helpers for external interaction (optional)
    public togglePause(): void {
        this.paused = !this.paused;
        if (!this.paused && this.gameRunning) this.gameLoop();
    }
}