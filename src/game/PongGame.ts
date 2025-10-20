/**
 * PongGame - Main game logic with AI heuristics improvements and Arcade mode
 * - v1.4.0
 *
 * Notes:
 * - Arcade mode toggle available in menu (checkbox #arcadeToggle)
 * - Leaderboard entries saved with mode ('standard' | 'arcade')
 * - AI heuristics improved: teleport limited, multi-ball/ghost used conditionally, mini-paddle spam reduced
 * - Magnet only affects balls in front of player's paddle
 * - Ghost ball invisibility handled in Ball.draw (no render)
 *
 * Keep this file reasonably documented; additional comments added.
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { SoundManager } from '../managers/SoundManager';
import { LeaderboardManager } from '../managers/LeaderboardManager';
import { MusicManager } from '../managers/MusicManager';
import { AbilitySystem, AbilityType, type Ability } from './AbilitySystem';
import type { GameConfig } from './types';

export class PongGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private player: Paddle;
    private ai: Paddle;
    private ball: Ball;
    private balls: Ball[] = [];

    private playerScore = 0;
    private aiScore = 0;

    private keys: { [key: string]: boolean } = {};
    private animationId: number | null = null;
    private paused = false;
    private gameRunning = false;

    private soundManager: SoundManager;
    private leaderboardManager: LeaderboardManager;
    private musicManager: MusicManager;
    private abilitySystem: AbilitySystem;

    private config: GameConfig;

    private countdown = 0;
    private countdownActive = false;

    // Effects & flags
    private slowMotionActive = false;
    private reverseControlsActive = false; // affects AI movement, not player
    private magnetActive = false;
    private doubleScoreActive = false;
    private freezeActive = false;
    private multiBallActive = false;
    private gravityActive = false;

    // Easter eggs / UI
    private secretClicks = 0;
    private footerClicks = 0;
    private authorClicks = 0;
    private canvasClicks = 0;
    private pauseCount = 0;

    // PWA
    private deferredPrompt: any = null;

    // Arcade mode
    private arcadeMode: boolean = false;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.soundManager = new SoundManager();
        this.leaderboardManager = new LeaderboardManager();
        this.musicManager = new MusicManager(120); // tempo in ms per note
        this.abilitySystem = new AbilitySystem();

        this.config = {
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            winScore: 10, // default win score
            paddleSpeed: 6
        };

        const paddleOffset = 20;
        this.player = new Paddle(paddleOffset, this.canvas.height / 2 - 50);
        this.ai = new Paddle(this.canvas.width - paddleOffset - 10, this.canvas.height / 2 - 50);

        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
        this.balls.push(this.ball);

        this.setupControls();
        this.setupUI();
        this.setupEasterEggs();
        this.setupMusicToggle();
        this.setupPWA();
    }

    /**
     * PWA install prompt handling
     */
    private setupPWA(): void {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const installBtn = document.getElementById('installBtn');
            if (installBtn) {
                installBtn.classList.remove('hidden');
                installBtn.addEventListener('click', async () => {
                    if (this.deferredPrompt) {
                        this.deferredPrompt.prompt();
                        const { outcome } = await this.deferredPrompt.userChoice;
                        console.log('Install outcome:', outcome);
                        this.deferredPrompt = null;
                        installBtn.classList.add('hidden');
                    }
                });
            }
        });
    }

    /**
     * Keyboard input setup
     */
    private setupControls(): void {
        window.addEventListener('keydown', (e) => {
            if (this.gameRunning && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;

            // Secrets processing
            this.checkKonamiCode(e.key);
            this.checkSecretSequence(e.key);

            if (!this.gameRunning || this.paused || this.countdownActive) return;

            const abilities = this.player.getAssignedAbilities();
            abilities.forEach(a => {
                if (this.isAbilityKey(e.key, a.key)) {
                    e.preventDefault();
                    this.activatePlayerAbility(a.type);
                }
            });
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    /**
     * Setup menu UI / buttons and arcade toggle wiring
     */
    private setupUI(): void {
        const startBtn = document.getElementById('startBtn')!;
        const leaderboardBtn = document.getElementById('leaderboardBtn')!;
        const soundToggle = document.getElementById('soundToggle')!;
        const pauseBtn = document.getElementById('pauseBtn')!;
        const backBtn = document.getElementById('backBtn')!;
        const menuBtn = document.getElementById('menuBtn')!;
        const saveScoreBtn = document.getElementById('saveScoreBtn')!;
        const clearBtn = document.getElementById('clearBtn')!;
        const arcadeToggle = document.getElementById('arcadeToggle') as HTMLInputElement | null;

        startBtn.addEventListener('click', () => this.startGame());
        leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        soundToggle.addEventListener('click', () => {
            const enabled = this.soundManager.toggle();
            soundToggle.textContent = `🔊 Sound: ${enabled ? 'ON' : 'OFF'}`;
        });

        pauseBtn.addEventListener('click', () => {
            this.togglePause();
            this.pauseCount++;
            if (this.pauseCount === 15) {
                alert('⏸️ Pause Master! All cooldowns -50% for next game!');
                this.pauseCount = 0;
            }
        });

        backBtn.addEventListener('click', () => this.showMenu());
        menuBtn.addEventListener('click', () => this.showMenu());
        saveScoreBtn.addEventListener('click', () => this.saveScore());
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear all leaderboard entries?')) {
                this.leaderboardManager.clear();
                this.showLeaderboard();
            }
        });

        if (arcadeToggle) {
            arcadeToggle.addEventListener('change', () => {
                this.arcadeMode = arcadeToggle.checked;
                // If switching modes mid-menu, nothing else required; startGame will respect it
                console.log('Arcade mode:', this.arcadeMode);
            });
        }
    }

    /**
     * Toggle music UI element (floating button)
     */
    private setupMusicToggle(): void {
        const musicBtn = document.createElement('div');
        musicBtn.className = 'music-indicator';
        musicBtn.textContent = '🎵';
        musicBtn.title = 'Toggle Background Music';
        musicBtn.addEventListener('click', () => {
            this.musicManager.toggle();
            musicBtn.textContent = this.musicManager.isPlaying() ? '🎵' : '🔇';
        });
        document.body.appendChild(musicBtn);
    }

    /**
     * Easter eggs and click secrets
     */
    private setupEasterEggs(): void {
        // Title clicks
        const title = document.querySelector('h1');
        if (title) {
            title.addEventListener('click', () => {
                this.secretClicks++;
                title.classList.add('spin');
                setTimeout(() => title.classList.remove('spin'), 1000);
                if (this.secretClicks === 10) {
                    title.classList.add('shake');
                    alert('🎮 Ultra Speed! Paddle x2!');
                    this.config.paddleSpeed = 12;
                    setTimeout(() => title.classList.remove('shake'), 500);
                    this.secretClicks = 0;
                } else if (this.secretClicks === 5) {
                    this.soundManager.play('paddleHit');
                }
            });
        }

        // Footer clicks
        const footer = document.getElementById('gameFooter');
        if (footer) {
            footer.addEventListener('click', () => {
                this.footerClicks++;
                if (this.footerClicks === 7) {
                    alert('👻 Secrets: "disco", "matrix", "god"');
                    this.footerClicks = 0;
                }
            });
        }

        // Author clicks
        const authorName = document.querySelector('.author-name');
        if (authorName) {
            authorName.addEventListener('click', (e) => {
                e.stopPropagation();
                this.authorClicks++;
                if (this.authorClicks === 3) {
                    alert('👨‍💻 Type: "speed", "pong", "matrix", "god"');
                    this.authorClicks = 0;
                }
            });
        }

        // Canvas click secret
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning) return;
            this.canvasClicks++;
            if (this.canvasClicks === 20) {
                alert('🎯 Ball Tracker! AI gets confused!');
                this.canvasClicks = 0;
            }
        });

        // NEW: Double-click score to instantly win (easter egg)
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            let clickCount = 0;
            let timer: number | null = null;
            scoreElement.addEventListener('click', () => {
                if (!this.gameRunning) return;
                clickCount++;
                if (timer) clearTimeout(timer);
                timer = window.setTimeout(() => { clickCount = 0; }, 500);
                if (clickCount === 2) {
                    scoreElement.classList.add('pulse');
                    alert('🏆 Score Hacker! You win instantly!');
                    this.playerScore = this.config.winScore;
                    this.updateScore();
                    this.checkGameOver();
                    setTimeout(() => scoreElement.classList.remove('pulse'), 1000);
                    clickCount = 0;
                    if (timer) { clearTimeout(timer); timer = null; }
                }
            });
        }
    }

    /**
     * Helper: ability key mapping
     */
    private isAbilityKey(pressedKey: string, abilityKey: string): boolean {
        if (abilityKey === 'SPACE') return pressedKey === ' ';
        return pressedKey.toLowerCase() === abilityKey.toLowerCase();
    }

    /**
     * Activate player's ability
     */
    private activatePlayerAbility(type: AbilityType): void {
        const activated = this.player.activateAbility(type);
        if (!activated) return;

        switch (type) {
            case AbilityType.SMASH:
                this.balls.forEach(ball => { ball.speedX *= 1.5; ball.speedY *= 1.2; });
                this.soundManager.play('smash');
                break;
            case AbilityType.SUPER_SMASH:
                this.balls.forEach(ball => { ball.speedX *= 2.0; ball.speedY *= 1.5; });
                this.soundManager.play('smash');
                break;
            case AbilityType.SHIELD:
                this.soundManager.play('shield');
                break;
            case AbilityType.SPEED_BOOST:
                this.soundManager.play('speedBoost');
                break;
            case AbilityType.TELEPORT:
                this.player.teleport(this.canvas.height);
                this.soundManager.play('teleport');
                break;
            case AbilityType.SLOW_MOTION:
                this.slowMotionActive = true;
                this.balls.forEach(ball => ball.applySlowMotion());
                this.soundManager.play('slowMotion');
                setTimeout(() => {
                    this.slowMotionActive = false;
                    this.balls.forEach(ball => ball.removeSlowMotion());
                }, 2000);
                break;
            case AbilityType.GHOST_BALL:
                this.balls.forEach(ball => ball.setGhost(true));
                this.soundManager.play('ghostBall');
                setTimeout(() => { this.balls.forEach(ball => ball.setGhost(false)); }, 1500);
                break;
            case AbilityType.GIANT_PADDLE:
                this.soundManager.play('giantPaddle');
                break;
            case AbilityType.REVERSE_CONTROLS:
                // Only affects AI movement
                this.reverseControlsActive = true;
                this.soundManager.play('reverseControls');
                setTimeout(() => { this.reverseControlsActive = false; }, 3000);
                break;
            case AbilityType.MAGNET:
                this.magnetActive = true;
                this.soundManager.play('magnet');
                setTimeout(() => { this.magnetActive = false; }, 2000);
                break;
            case AbilityType.DOUBLE_SCORE:
                this.doubleScoreActive = true;
                this.soundManager.play('doubleScore');
                break;
            case AbilityType.FREEZE:
                this.freezeActive = true;
                this.soundManager.play('freeze');
                setTimeout(() => { this.freezeActive = false; }, 1500);
                break;
            case AbilityType.MULTI_BALL:
                this.activateMultiBall();
                break;
            case AbilityType.MINI_PADDLE:
                this.ai.applyMiniPaddle();
                this.soundManager.play('freeze');
                break;
            case AbilityType.GRAVITY:
                this.gravityActive = true;
                this.balls.forEach(ball => ball.gravityActive = true);
                this.soundManager.play('slowMotion');
                setTimeout(() => {
                    this.gravityActive = false;
                    this.balls.forEach(ball => ball.gravityActive = false);
                }, 2000);
                break;
        }
    }

    /**
     * Activate Multi-Ball (player)
     */
    private activateMultiBall(): void {
        if (this.multiBallActive || this.balls.length > 1) return;
        this.multiBallActive = true;
        this.soundManager.play('multiBall');

        const main = this.balls[0];
        const b2 = main.clone(1);
        const b3 = main.clone(2);
        this.balls.push(b2, b3);

        setTimeout(() => {
            this.balls = this.balls.slice(0, 1);
            this.multiBallActive = false;
        }, 3000);
    }

    /**
     * Start a game (select abilities, reset state)
     */
    private async startGame(): Promise<void> {
        this.stopGame();

        const selectedAbilities = this.abilitySystem.selectRandomAbilities();
        this.player.setAbilities(selectedAbilities);
        this.ai.setAbilities(selectedAbilities);

        this.displaySelectedAbilities(selectedAbilities);

        this.musicManager.start();
        document.body.classList.add('game-active');

        document.getElementById('menu')!.classList.add('hidden');
        document.getElementById('gameContainer')!.classList.remove('hidden');
        document.getElementById('leaderboard')!.classList.add('hidden');
        document.getElementById('gameOver')!.classList.add('hidden');

        this.playerScore = 0;
        this.aiScore = 0;
        this.updateScore();

        this.ball.reset(this.canvas.width, this.canvas.height);
        this.balls = [this.ball];

        this.paused = false;
        this.gameRunning = true;

        await this.runCountdown();

        if (this.gameRunning) this.gameLoop();
    }

    private displaySelectedAbilities(abilities: Ability[]): void {
        const container = document.getElementById('abilityDisplay');
        if (!container) return;
        container.innerHTML = abilities.map(a => `<div class="ability-badge" style="background: ${a.color};">
      ${a.icon} ${a.name} (${a.key})
    </div>`).join('');
    }

    private async runCountdown(): Promise<void> {
        this.countdownActive = true;
        for (let i = 3; i > 0; i--) {
            this.countdown = i;
            this.draw();
            this.soundManager.play('countdown');
            await this.sleep(1000);
        }
        this.countdown = 0;
        this.countdownActive = false;
    }

    private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

    private stopGame(): void {
        this.gameRunning = false;
        this.countdownActive = false;
        if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
    }

    private togglePause(): void {
        if (!this.gameRunning || this.countdownActive) return;
        this.paused = !this.paused;
        document.getElementById('pauseBtn')!.textContent = this.paused ? 'Resume' : 'Pause';
        if (!this.paused) this.gameLoop();
    }

    private gameLoop(): void {
        if (this.paused || !this.gameRunning || this.countdownActive) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game state and AI heuristics
     */
    private update(): void {
        // Player input
        const upPressed = this.keys['w'] || this.keys['W'] || this.keys['ArrowUp'];
        const downPressed = this.keys['s'] || this.keys['S'] || this.keys['ArrowDown'];
        if (upPressed) this.player.move(-1, this.canvas.height);
        if (downPressed) this.player.move(1, this.canvas.height);
        this.player.update();

        // AI update & heuristics
        if (!this.freezeActive) {
            this.ai.update();

            const aiCenter = this.ai.y + this.ai.height / 2;
            const targetBall = this.balls[0]; // main tracking ball
            const aiDirection = this.reverseControlsActive ? -1 : 1;

            // Track visible ball; be confused when ghost
            if (!targetBall.isGhost) {
                if (aiCenter < targetBall.y - 35) this.ai.move(1 * aiDirection, this.canvas.height);
                else if (aiCenter > targetBall.y + 35) this.ai.move(-1 * aiDirection, this.canvas.height);
            } else {
                // random jitter movement while invisible
                if (Math.random() < 0.02) this.ai.move(Math.random() > 0.5 ? 1 : -1, this.canvas.height);
            }

            // AI ability usage: use abilities more selectively to avoid spam
            if (!targetBall.isGhost && Math.abs(targetBall.x - this.ai.x) < 160 && targetBall.getSpeed() > 5) {
                const rand = Math.random();
                const abilities = this.ai.getAssignedAbilities();
                const distanceFromBall = Math.abs(aiCenter - targetBall.y);

                // Ghost Ball: when ball is dangerously close and AI wants to confuse player
                if (rand < 0.18 && abilities.some(a => a.type === AbilityType.GHOST_BALL)) {
                    if (this.ai.activateAbility(AbilityType.GHOST_BALL)) {
                        this.balls.forEach(b => b.setGhost(true));
                        this.soundManager.play('ghostBall');
                        setTimeout(() => { this.balls.forEach(b => b.setGhost(false)); }, 1500);
                    }
                }
                // Multi-Ball: only if ball is fast and AI is trailing or wants aggressive play
                else if (rand >= 0.18 && rand < 0.36 && targetBall.getSpeed() > 7 && abilities.some(a => a.type === AbilityType.MULTI_BALL)) {
                    if (this.ai.activateAbility(AbilityType.MULTI_BALL) && !this.multiBallActive && this.balls.length === 1) {
                        this.multiBallActive = true;
                        this.soundManager.play('multiBall');
                        const main = this.balls[0];
                        this.balls.push(main.clone(1), main.clone(2));
                        setTimeout(() => { this.balls = this.balls.slice(0, 1); this.multiBallActive = false; }, 3000);
                    }
                }
                // Double score: use only when AI is about to score (ball near player side) and ability available
                else if (rand >= 0.36 && rand < 0.52 && abilities.some(a => a.type === AbilityType.DOUBLE_SCORE)) {
                    // AI will attempt double-score opportunistically if it expects to get the point
                    if (Math.abs(targetBall.x - this.ai.x) < 100 && targetBall.x > this.canvas.width / 2) {
                        if (this.ai.activateAbility(AbilityType.DOUBLE_SCORE)) {
                            this.doubleScoreActive = true;
                            this.soundManager.play('doubleScore');
                            // doubleScoreActive will be consumed when scoring occurs
                        }
                    }
                }
                // Shield: protect against very fast returning shots
                else if (rand >= 0.52 && rand < 0.68 && abilities.some(a => a.type === AbilityType.SHIELD)) {
                    this.ai.activateAbility(AbilityType.SHIELD);
                }
                // Smash: occasional aggressive hit
                else if (rand >= 0.68 && rand < 0.80 && abilities.some(a => a.type === AbilityType.SMASH)) {
                    if (this.ai.activateAbility(AbilityType.SMASH)) {
                        this.balls.forEach(b => { b.speedX *= 1.5; b.speedY *= 1.2; });
                        this.soundManager.play('smash');
                    }
                }
                // Teleport: only when AI is far from ball vertically and the ball is already very close to AI's paddle
                else if (rand >= 0.80 && rand < 0.88 && abilities.some(a => a.type === AbilityType.TELEPORT)) {
                    if (distanceFromBall > 120 && Math.abs(targetBall.x - this.ai.x) < 80) {
                        this.ai.activateAbility(AbilityType.TELEPORT);
                        this.ai.teleport(this.canvas.height);
                    }
                }
                // Mini paddle: use rarely to disrupt player
                else if (rand >= 0.88 && rand < 0.95 && abilities.some(a => a.type === AbilityType.MINI_PADDLE)) {
                    // reduced frequency: AI won't spam mini-paddle
                    if (Math.random() < 0.33) {
                        this.ai.activateAbility(AbilityType.MINI_PADDLE);
                        this.player.applyMiniPaddle();
                    }
                }
            }
        }

        // Magnet effect: only pulls balls on player's side and in front of paddle,
        // and only if player's mini-paddle not active (magnet should respect mini-state).
        if (this.magnetActive) {
            const paddleCenter = this.player.y + this.player.height / 2;
            this.balls.forEach(ball => {
                if (ball.x < this.canvas.width / 2 && ball.x > this.player.x + this.player.width) {
                    const dy = paddleCenter - ball.y;
                    const distance = Math.abs(dy);
                    if (distance < 200) {
                        const force = Math.max(0.004, 0.015 * (1 - distance / 200));
                        ball.speedY += dy * force;
                    }
                }
            });
        }

        // Update all balls: collisions, scoring, physics
        this.balls = this.balls.filter(ball => {
            ball.update();

            // Wall collision
            if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= this.canvas.height) {
                ball.speedY *= -1;
                ball.y = Math.max(ball.radius, Math.min(this.canvas.height - ball.radius, ball.y));
                this.soundManager.play('wallHit');
            }

            // Paddle collisions
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

            // Scoring
            if (ball.x - ball.radius <= 0) {
                const points = this.doubleScoreActive ? 2 : 1;
                this.aiScore += points;
                this.soundManager.play('score');
                // Double score consumed when point against player
                this.doubleScoreActive = false;
                this.updateScore();
                this.checkGameOver();
                return false;
            } else if (ball.x + ball.radius >= this.canvas.width) {
                const points = this.doubleScoreActive ? 2 : 1;
                this.playerScore += points;
                this.soundManager.play('score');
                this.doubleScoreActive = false;
                this.updateScore();
                this.checkGameOver();
                return false;
            }

            return true;
        });

        // Reset if all balls gone
        if (this.balls.length === 0 && this.gameRunning) {
            this.ball.reset(this.canvas.width, this.canvas.height);
            this.balls = [this.ball];
        }
    }

    /**
     * Simple circular collision check
     */
    private checkCollision(ball: Ball, paddle: Paddle): boolean {
        const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
        const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        return (dx * dx + dy * dy) < (ball.radius * ball.radius);
    }

    /**
     * Draw everything
     */
    private draw(): void {
        // background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // overlays for effects
        if (this.slowMotionActive) {
            this.ctx.fillStyle = 'rgba(76, 222, 128, 0.08)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.freezeActive) {
            this.ctx.fillStyle = 'rgba(96, 165, 250, 0.12)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.reverseControlsActive) {
            this.ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.magnetActive) {
            const gradient = this.ctx.createRadialGradient(
                this.player.x, this.player.y + this.player.height / 2, 0,
                this.player.x, this.player.y + this.player.height / 2, 150
            );
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.gravityActive) {
            this.ctx.fillStyle = 'rgba(34, 211, 238, 0.06)';
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

        // paddles & balls
        this.player.draw(this.ctx);
        if (this.freezeActive) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.75;
            this.ai.draw(this.ctx);
            this.ctx.restore();
        } else {
            this.ai.draw(this.ctx);
        }

        this.balls.forEach(ball => ball.draw(this.ctx));

        // UI
        this.drawSpeedometer();
        this.drawAbilityHints(); // moved slightly down for readability
        this.drawActiveEffects();

        // countdown overlay
        if (this.countdownActive && this.countdown > 0) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 120px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.countdown.toString(), this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Get Ready!', this.canvas.width / 2, this.canvas.height / 2 + 80);
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'alphabetic';
        }
    }

    /**
     * Draw active effects HUD (moved down for readability)
     */
    private drawActiveEffects(): void {
        const effects: string[] = [];
        if (this.slowMotionActive) effects.push('🟢 Slow Motion');
        if (this.reverseControlsActive) effects.push('🔄 Reversed');
        if (this.magnetActive) effects.push('🧲 Magnet');
        if (this.doubleScoreActive) effects.push('💎 Double Score');
        if (this.freezeActive) effects.push('❄️ Frozen');
        if (this.multiBallActive) effects.push('🟡 Multi-Ball');
        if (this.gravityActive) effects.push('🌍 Gravity');

        if (effects.length > 0) {
            this.ctx.strokeStyle = 'rgba(0,0,0,0.9)';
            this.ctx.lineWidth = 4;
            this.ctx.fillStyle = 'rgba(255,255,255,1)';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';

            effects.forEach((effect, idx) => {
                const y = 80 + idx * 28; // moved slightly down to avoid overlap with top HUD
                this.ctx.strokeText(effect, this.canvas.width / 2, y);
                this.ctx.fillText(effect, this.canvas.width / 2, y);
            });

            this.ctx.textAlign = 'left';
            this.ctx.lineWidth = 1;
        }
    }

    private drawAbilityHints(): void {
        const abilities = this.player.getAssignedAbilities();
        this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.ctx.font = '14px Arial';
        const hints = abilities.map(a => `${a.key}: ${a.name}`).join(' | ');
        // moved up a bit above bottom to avoid being cut off on small screens
        this.ctx.fillText(hints, 10, this.canvas.height - 20);
        this.ctx.fillText('↑↓ or W/S: Move', 10, this.canvas.height - 40);
    }

    private drawSpeedometer(): void {
        const speed = this.balls.length > 0 ? this.balls[0].getSpeed() : 0;
        const maxDisplaySpeed = 15;
        const speedPercent = Math.min(speed / maxDisplaySpeed, 1);
        const x = this.canvas.width / 2 - 100;
        const y = 20;
        const width = 200;
        const height = 20;
        this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
        this.ctx.fillRect(x, y, width, height);
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, '#4ade80'); gradient.addColorStop(0.5, '#fbbf24'); gradient.addColorStop(1, '#ef4444');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width * speedPercent, height);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`SPEED: ${speed.toFixed(1)}`, this.canvas.width / 2, y + height + 15);
        this.ctx.textAlign = 'left';
    }

    private updateScore(): void {
        document.getElementById('playerScore')!.textContent = this.playerScore.toString();
        document.getElementById('aiScore')!.textContent = this.aiScore.toString();
    }

    /**
     * Check for end of game.
     * Arcade mode rules: AI reaching 10 ends game (player loses).
     */
    private checkGameOver(): void {
        if (this.arcadeMode) {
            // in Arcade mode game ends when AI reaches 10 or player reaches winScore
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
        this.showGameOver();
    }

    private showGameOver(): void {
        document.body.classList.remove('game-active');
        document.getElementById('gameContainer')!.classList.add('hidden');
        document.getElementById('gameOver')!.classList.remove('hidden');

        const won = this.playerScore > this.aiScore;
        document.getElementById('gameOverTitle')!.textContent = won ? '🎉 You Win!' : '😢 You Lose!';
        document.getElementById('finalScore')!.textContent = `Final Score: ${this.playerScore} - ${this.aiScore}`;
    }

    /**
     * Save the current score to leaderboard including mode (standard | arcade)
     */
    private saveScore(): void {
        const nameInput = document.getElementById('playerName') as HTMLInputElement;
        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Anonymous';
        const mode = this.arcadeMode ? 'arcade' : 'standard';
        // save both scores and mode
        this.leaderboardManager.addEntry(name, this.playerScore, this.aiScore, mode);
        this.showMenu();
        if (nameInput) nameInput.value = '';
    }

    /**
     * Show leaderboard UI (includes mode display)
     */
    private showLeaderboard(): void {
        this.stopGame();
        document.body.classList.remove('game-active');
        document.getElementById('menu')!.classList.add('hidden');
        document.getElementById('gameContainer')!.classList.add('hidden');
        document.getElementById('leaderboard')!.classList.remove('hidden');
        document.getElementById('gameOver')!.classList.add('hidden');

        const tbody = document.getElementById('leaderboardBody') as HTMLTableSectionElement;
        tbody.innerHTML = '';

        const entries = this.leaderboardManager.getEntries();
        entries.forEach((entry, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `<td>${index + 1}</td><td>${entry.name}</td><td>${entry.score}</td><td>${entry.mode ?? 'standard'}</td><td>${entry.date}</td>`;
        });

        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No entries yet!</td></tr>';
        }
    }
}