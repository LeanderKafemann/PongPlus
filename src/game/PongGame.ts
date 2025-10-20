/**
 * PongGame - Main game logic for PongPlus
 * v1.4.0 (includes full functionality of 1.3.3 and 1.4.0 improvements)
 *
 * Features:
 *  - Core Pong gameplay (player vs AI)
 *  - 15+ Abilities system (random selection each round)
 *  - AI heuristics (teleport, multi-ball, ghost, double-score, mini-paddle, magnet handling)
 *  - Easter eggs (Konami, typed words, clicks, double-click score, etc.)
 *  - Leaderboard saving with migration & mode (standard | arcade)
 *  - Arcade Mode (AI plays to 10)
 *  - Music / SFX integrations
 *  - Visual overlays and HUD
 *
 * Notes:
 *  - Depends on modules:
 *      ./Ball
 *      ./Paddle
 *      ./AbilitySystem
 *      ../managers/SoundManager
 *      ../managers/MusicManager
 *      ../managers/LeaderboardManager
 *      ./types
 *
 *  - Expects DOM elements in index.html with IDs used below.
 *
 * Copyright 2025 LeanderKafemann. All rights reserved.
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { AbilitySystem, AbilityType, type Ability } from './AbilitySystem';
import { SoundManager } from '../managers/SoundManager';
import { MusicManager } from '../managers/MusicManager';
import { LeaderboardManager } from '../managers/LeaderboardManager';
import type { GameConfig } from './types';

type KeyMap = Record<string, boolean>;

export class PongGame {
    // Canvas & rendering
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    // Entities
    private player: Paddle;
    private ai: Paddle;
    private ball: Ball;
    private balls: Ball[] = [];

    // Scores
    private playerScore: number = 0;
    private aiScore: number = 0;

    // Input
    private keys: KeyMap = {};

    // Loop control
    private animationId: number | null = null;
    private paused: boolean = false;
    private gameRunning: boolean = false;

    // Managers
    private soundManager: SoundManager;
    private musicManager: MusicManager;
    private leaderboardManager: LeaderboardManager;
    private abilitySystem: AbilitySystem;

    // Config
    private config: GameConfig;

    // Countdown
    private countdown: number = 0;
    private countdownActive: boolean = false;

    // Effects & flags
    private slowMotionActive: boolean = false;
    private reverseControlsActive: boolean = false; // only affects AI
    private magnetActive: boolean = false;
    private doubleScoreActive: boolean = false;
    private freezeActive: boolean = false;
    private multiBallActive: boolean = false;
    private gravityActive: boolean = false;

    // (spiel-weite Flags / counters)
    private secretClicks: number = 0;
    private footerClicks: number = 0;
    private authorClicks: number = 0;
    private canvasClicks: number = 0;
    private pauseCount: number = 0;

    // PWA
    private deferredPrompt: any = null;

    // Arcade mode
    private arcadeMode: boolean = false;

    // Konami & typed sequences
    private konamiCode: string[] = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    private konamiProgress: number = 0;
    private sequenceKeys: string = '';
    private lastKeyTime: number = 0;

    // Ability cooldowns
    private abilityCooldowns: Map<AbilityType, number> = new Map();

    private musicIndicatorEl: HTMLElement | null = null;

    constructor() {
        // get DOM elements
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
        if (!canvas) throw new Error('gameCanvas element not found');
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Unable to get 2D context');
        this.ctx = ctx;

        // instantiate managers
        this.soundManager = new SoundManager();
        this.musicManager = new MusicManager(120); // default tempo (ms)
        this.leaderboardManager = new LeaderboardManager();
        this.abilitySystem = new AbilitySystem();

        // config
        this.config = {
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            winScore: 10,
            paddleSpeed: 6
        };

        // paddles & ball
        const paddleOffset = 20;
        this.player = new Paddle(paddleOffset, (this.canvas.height / 2) - 50);
        this.ai = new Paddle(this.canvas.width - paddleOffset - 10, (this.canvas.height / 2) - 50);
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
        this.balls = [this.ball];

        // wire up
        this.setupControls();
        this.setupUI();
        this.setupEasterEggs();
        this.setupMusicToggle();
        this.setupPWA();

        // default: music off
        this.musicManager.stop();
    }

    /* ---------------------------
       PWA / Install
       --------------------------- */

    private setupPWA(): void {
        window.addEventListener('beforeinstallprompt', (evt: any) => {
            try {
                evt.preventDefault();
                this.deferredPrompt = evt;
                const installBtn = document.getElementById('installBtn');
                if (installBtn) {
                    installBtn.classList.remove('hidden');
                    // Click-Handler ohne ungenutzte Parameter
                    installBtn.addEventListener('click', async () => {
                        if (this.deferredPrompt) {
                            this.deferredPrompt.prompt();
                            await this.deferredPrompt.userChoice;
                            this.deferredPrompt = null;
                            installBtn.classList.add('hidden');
                        }
                    });
                }
            } catch (err) {
                // Fallback: ignore older browsers
                // Konsolenausgabe nur zu Debug-Zwecken
                // eslint-disable-next-line no-console
                console.warn('PWA setup skipped:', err);
            }
        });
    }

    /* ---------------------------
       Input & Controls
       --------------------------- */

    private setupControls(): void {
        window.addEventListener('keydown', (e) => {
            // prevent arrow keys from scrolling the page when game active
            if (this.gameRunning && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;

            // secret sequences
            this.checkKonamiCode(e.key);
            this.checkSecretSequence(e.key);

            if (!this.gameRunning || this.paused || this.countdownActive) return;

            // activate ability if key matches assigned ability
            const abilities = this.player.getAssignedAbilities();
            for (const a of abilities) {
                if (this.isAbilityKey(e.key, a.key)) {
                    e.preventDefault();
                    this.activatePlayerAbility(a.type);
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // prevent page scroll on arrow keys globally while game active
        window.addEventListener('keydown', (e) => {
            if (this.gameRunning && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    private isAbilityKey(pressedKey: string, abilityKey: string): boolean {
        if (abilityKey === 'SPACE') return pressedKey === ' ';
        return pressedKey.toLowerCase() === abilityKey.toLowerCase();
    }

    /* ---------------------------
       UI Setup
       --------------------------- */

    private setupUI(): void {
        const startBtn = document.getElementById('startBtn');
        const leaderboardBtn = document.getElementById('leaderboardBtn');
        const soundToggle = document.getElementById('soundToggle');
        const pauseBtn = document.getElementById('pauseBtn');
        const backBtn = document.getElementById('backBtn');
        const menuBtn = document.getElementById('menuBtn');
        const saveScoreBtn = document.getElementById('saveScoreBtn');
        const clearBtn = document.getElementById('clearBtn');
        const arcadeToggle = document.getElementById('arcadeToggle') as HTMLInputElement | null;

        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (leaderboardBtn) leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        if (soundToggle) soundToggle.addEventListener('click', () => {
            const enabled = this.soundManager.toggle();
            soundToggle.textContent = `🔊 Sound: ${enabled ? 'ON' : 'OFF'}`;
        });
        if (pauseBtn) pauseBtn.addEventListener('click', () => {
            this.togglePause();
            this.pauseCount++;
            if (this.pauseCount === 15) {
                alert('⏸️ Pause Master! All cooldowns -50% for next game!');
                this.pauseCount = 0;
            }
        });
        if (backBtn) backBtn.addEventListener('click', () => this.showMenu());
        if (menuBtn) menuBtn.addEventListener('click', () => this.showMenu());
        if (saveScoreBtn) saveScoreBtn.addEventListener('click', () => this.saveScore());
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (confirm('Clear all leaderboard entries?')) {
                this.leaderboardManager.clear();
                this.showLeaderboard();
            }
        });

        if (arcadeToggle) {
            arcadeToggle.addEventListener('change', () => {
                this.arcadeMode = arcadeToggle.checked;
                // eslint-disable-next-line no-console
                console.log('Arcade mode set to', this.arcadeMode);
            });
        }
    }

    private setupMusicToggle(): void {
        // floating music button on the page (already appended in previous versions)
        const existing = document.querySelector('.music-indicator') as HTMLElement | null;
        if (existing) {
            this.musicIndicatorEl = existing;
            existing.addEventListener('click', () => {
                this.musicManager.toggle();
                existing.textContent = this.musicManager.isPlaying() ? '🎵' : '🔇';
            });
            return;
        }

        const musicBtn = document.createElement('div');
        musicBtn.className = 'music-indicator';
        musicBtn.textContent = '🎵';
        musicBtn.title = 'Toggle Background Music';
        musicBtn.addEventListener('click', () => {
            this.musicManager.toggle();
            musicBtn.textContent = this.musicManager.isPlaying() ? '🎵' : '🔇';
        });
        document.body.appendChild(musicBtn);
        this.musicIndicatorEl = musicBtn;
    }

    /* ---------------------------
       Easter Eggs & Secret Sequences
       --------------------------- */

    private checkKonamiCode(key: string): void {
        if (key === this.konamiCode[this.konamiProgress]) {
            this.konamiProgress++;
            if (this.konamiProgress === this.konamiCode.length) {
                this.activateKonamiCode();
                this.konamiProgress = 0;
            }
        } else {
            this.konamiProgress = 0;
        }
    }

    private checkSecretSequence(key: string): void {
        const now = Date.now();
        if (now - this.lastKeyTime > 2000) {
            this.sequenceKeys = '';
        }
        this.lastKeyTime = now;
        this.sequenceKeys += key.toLowerCase();
        // keep length manageable
        if (this.sequenceKeys.length > 20) this.sequenceKeys = this.sequenceKeys.slice(-20);

        // detect words
        if (this.sequenceKeys.includes('pong')) {
            this.sequenceKeys = '';
            alert('🏓 Classic Pong mode! Ball gets bigger!');
            this.balls.forEach(b => b.radius = Math.max(b.radius, 12));
        } else if (this.sequenceKeys.includes('disco')) {
            this.sequenceKeys = '';
            this.activateDiscoMode();
        } else if (this.sequenceKeys.includes('speed')) {
            this.sequenceKeys = '';
            alert('⚡ Speed Hack! Ball max speed doubled!');
            // increase max speed on balls temporarily
            this.balls.forEach(b => {
                (b as any).maxSpeed = 24;
            });
            setTimeout(() => {
                this.balls.forEach(b => {
                    (b as any).maxSpeed = undefined;
                });
            }, 8000);
        } else if (this.sequenceKeys.includes('matrix')) {
            this.sequenceKeys = '';
            alert('💚 Matrix Mode! Stay focused...');
            document.body.style.background = 'linear-gradient(135deg,#041014 0%, #02110a 100%)';
            document.body.style.color = '#00ff00';
            setTimeout(() => {
                document.body.style.background = '';
                document.body.style.color = '';
            }, 15000);
        } else if (this.sequenceKeys.includes('god')) {
            this.sequenceKeys = '';
            alert('👑 GOD MODE: Giant paddle + speed for 10s!');
            const old = this.config.paddleSpeed;
            this.config.paddleSpeed = 20;
            this.player.height = Math.min(this.canvas.height, 200);
            setTimeout(() => {
                this.config.paddleSpeed = old;
                this.player.height = 100;
            }, 10000);
        }
    }

    private activateKonamiCode(): void {
        document.body.classList.add('konami-active');
        this.soundManager.play('score');
        alert('🎉 Konami: Rainbow mode for 10s!');
        setTimeout(() => document.body.classList.remove('konami-active'), 10000);
    }

    private activateDiscoMode(): void {
        document.body.classList.add('disco-mode');
        const disco = document.createElement('div');
        disco.id = 'discoBall';
        disco.className = 'disco-ball';
        document.body.appendChild(disco);
        this.soundManager.play('multiBall');
        setTimeout(() => {
            document.body.classList.remove('disco-mode');
            const el = document.getElementById('discoBall');
            if (el) el.remove();
        }, 10000);
    }

    private setupEasterEggs(): void {
        // Title click secrets
        const title = document.querySelector('h1');
        if (title) {
            title.addEventListener('click', () => {
                this.secretClicks++;
                title.classList.add('spin');
                setTimeout(() => title.classList.remove('spin'), 900);
                if (this.secretClicks === 10) {
                    alert('🎮 Ultra Speed unlocked! Paddle speed doubled for this game.');
                    const oldSpeed = this.config.paddleSpeed;
                    this.config.paddleSpeed = Math.min(20, oldSpeed * 2);
                    setTimeout(() => { this.config.paddleSpeed = oldSpeed; }, 12000);
                    this.secretClicks = 0;
                } else if (this.secretClicks === 5) {
                    this.soundManager.play('paddleHit');
                }
            });
        }

        // Footer hints
        const footer = document.getElementById('gameFooter');
        if (footer) {
            footer.addEventListener('click', () => {
                this.footerClicks++;
                if (this.footerClicks === 7) {
                    alert('👻 Hints: Try typing "disco", "matrix", "god" or click the title 10×');
                    this.footerClicks = 0;
                }
            });
        }

        // Author click hint
        const author = document.querySelector('.author-name');
        if (author) {
            author.addEventListener('click', (ev) => {
                ev.stopPropagation();
                this.authorClicks++;
                if (this.authorClicks === 3) {
                    alert('👨‍💻 Dev hint: you can type "pong" for ball size');
                    this.authorClicks = 0;
                }
            });
        }

        // Canvas multi-click confuses AI
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning) return;
            this.canvasClicks++;
            if (this.canvasClicks === 20) {
                alert('🎯 Ball Tracker: AI gets confused!');
                this.canvasClicks = 0;
            }
        });

        // Double-click score => instant win (easter egg)
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            let clicks = 0;
            let timer: number | null = null;
            scoreEl.addEventListener('click', () => {
                if (!this.gameRunning) return;
                clicks++;
                if (timer) clearTimeout(timer);
                timer = window.setTimeout(() => { clicks = 0; }, 500);
                if (clicks === 2) {
                    scoreEl.classList.add('pulse');
                    alert('🏆 Score Hacker! You instantly win!');
                    this.playerScore = this.config.winScore;
                    this.updateScore();
                    this.checkGameOver();
                    setTimeout(() => scoreEl.classList.remove('pulse'), 1000);
                    clicks = 0;
                    if (timer) { clearTimeout(timer); timer = null; }
                }
            });
        }
    }

    /* ---------------------------
       Abilities & Player Activation
       --------------------------- */

    private activatePlayerAbility(type: AbilityType): void {
        // simple cooldown check (if present)
        const last = this.abilityCooldowns.get(type) ?? 0;
        if (Date.now() < last) return;
        // assign naive cooldown (example)
        this.abilityCooldowns.set(type, Date.now() + 5000);

        const activated = this.player.activateAbility(type);
        if (!activated) return;

        switch (type) {
            case AbilityType.SMASH:
                this.balls.forEach(b => { b.speedX *= 1.5; b.speedY *= 1.2; });
                this.soundManager.play('smash');
                break;
            case AbilityType.SUPER_SMASH:
                this.balls.forEach(b => { b.speedX *= 2.0; b.speedY *= 1.5; });
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
                this.balls.forEach(b => b.applySlowMotion());
                this.soundManager.play('slowMotion');
                setTimeout(() => {
                    this.slowMotionActive = false;
                    this.balls.forEach(b => b.removeSlowMotion());
                }, 2000);
                break;
            case AbilityType.GHOST_BALL:
                this.balls.forEach(b => b.setGhost(true));
                this.soundManager.play('ghostBall');
                setTimeout(() => this.balls.forEach(b => b.setGhost(false)), 1500);
                break;
            case AbilityType.GIANT_PADDLE:
                this.soundManager.play('giantPaddle');
                break;
            case AbilityType.REVERSE_CONTROLS:
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
                // apply to opponent when player activates mini-paddle (design choice)
                this.ai.applyMiniPaddle();
                this.soundManager.play('freeze');
                break;
            case AbilityType.GRAVITY:
                this.gravityActive = true;
                this.balls.forEach(b => b.gravityActive = true);
                this.soundManager.play('slowMotion');
                setTimeout(() => {
                    this.gravityActive = false;
                    this.balls.forEach(b => b.gravityActive = false);
                }, 2000);
                break;
        }
    }

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

    /* ---------------------------
       Game Flow: Start / Stop / Loop
       --------------------------- */

    private async startGame(): Promise<void> {
        this.stopGame();

        // select random abilities and assign to both players
        const selected = this.abilitySystem.selectRandomAbilities();
        this.player.setAbilities(selected);
        this.ai.setAbilities(selected);

        this.displaySelectedAbilities(selected);

        // start music
        this.musicManager.start();
        document.body.classList.add('game-active');

        // UI switches
        const menu = document.getElementById('menu');
        const container = document.getElementById('gameContainer');
        const leader = document.getElementById('leaderboard');
        const over = document.getElementById('gameOver');
        if (menu) menu.classList.add('hidden');
        if (container) container.classList.remove('hidden');
        if (leader) leader.classList.add('hidden');
        if (over) over.classList.add('hidden');

        // reset state
        this.playerScore = 0;
        this.aiScore = 0;
        this.updateScore();

        // reset ball(s)
        this.ball.reset(this.canvas.width, this.canvas.height);
        this.balls = [this.ball];
        this.multiBallActive = false;
        this.doubleScoreActive = false;

        this.paused = false;
        this.gameRunning = true;

        await this.runCountdown();
        if (this.gameRunning) this.gameLoop();
    }

    private displaySelectedAbilities(abilities: Ability[]): void {
        const container = document.getElementById('abilityDisplay');
        if (!container) return;
        container.innerHTML = abilities.map(a => `<div class="ability-badge" style="background:${a.color}">${a.icon} ${a.name} (${a.key})</div>`).join('');
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
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    private togglePause(): void {
        if (!this.gameRunning || this.countdownActive) return;
        this.paused = !this.paused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
        if (!this.paused) this.gameLoop();
    }

    private gameLoop(): void {
        if (this.paused || !this.gameRunning || this.countdownActive) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    /* ---------------------------
       Update: Game logic & AI
       --------------------------- */

    private update(): void {
        // Player input
        const up = this.keys['w'] || this.keys['W'] || this.keys['ArrowUp'];
        const down = this.keys['s'] || this.keys['S'] || this.keys['ArrowDown'];
        if (up) this.player.move(-1, this.canvas.height);
        if (down) this.player.move(1, this.canvas.height);
        this.player.update();

        // AI update
        if (!this.freezeActive) {
            this.ai.update();

            const aiCenter = this.ai.y + (this.ai.height / 2);
            const targetBall = this.balls[0];
            const aiDirection = this.reverseControlsActive ? -1 : 1;

            // Tracking when ball is visible; random jitter when ghost
            if (!targetBall.isGhost) {
                if (aiCenter < targetBall.y - 35) this.ai.move(1 * aiDirection, this.canvas.height);
                else if (aiCenter > targetBall.y + 35) this.ai.move(-1 * aiDirection, this.canvas.height);
            } else {
                if (Math.random() < 0.02) this.ai.move(Math.random() > 0.5 ? 1 : -1, this.canvas.height);
            }

            // AI ability usage: selective and conditional to reduce spam
            if (!targetBall.isGhost && Math.abs(targetBall.x - this.ai.x) < 160 && targetBall.getSpeed() > 5) {
                const rand = Math.random();
                const abilities = this.ai.getAssignedAbilities();
                const distanceFromBall = Math.abs(aiCenter - targetBall.y);

                // Ghost Ball: use sometimes when ball close
                if (rand < 0.18 && abilities.some(a => a.type === AbilityType.GHOST_BALL)) {
                    if (this.ai.activateAbility(AbilityType.GHOST_BALL)) {
                        this.balls.forEach(b => b.setGhost(true));
                        this.soundManager.play('ghostBall');
                        setTimeout(() => this.balls.forEach(b => b.setGhost(false)), 1500);
                    }
                }
                // Multi-Ball: only on fast ball
                else if (rand >= 0.18 && rand < 0.36 && targetBall.getSpeed() > 7 && abilities.some(a => a.type === AbilityType.MULTI_BALL)) {
                    if (this.ai.activateAbility(AbilityType.MULTI_BALL) && !this.multiBallActive && this.balls.length === 1) {
                        this.multiBallActive = true;
                        this.soundManager.play('multiBall');
                        const main = this.balls[0];
                        this.balls.push(main.clone(1), main.clone(2));
                        setTimeout(() => { this.balls = this.balls.slice(0, 1); this.multiBallActive = false; }, 3000);
                    }
                }
                // Double-score: opportunistic when near AI paddle
                else if (rand >= 0.36 && rand < 0.52 && abilities.some(a => a.type === AbilityType.DOUBLE_SCORE)) {
                    if (Math.abs(targetBall.x - this.ai.x) < 100 && targetBall.x > this.canvas.width / 2) {
                        if (this.ai.activateAbility(AbilityType.DOUBLE_SCORE)) {
                            this.doubleScoreActive = true;
                            this.soundManager.play('doubleScore');
                        }
                    }
                }
                // Shield / Smash / Teleport / Mini-Paddle ... conditional as before
                else if (rand >= 0.52 && rand < 0.68 && abilities.some(a => a.type === AbilityType.SHIELD)) {
                    this.ai.activateAbility(AbilityType.SHIELD);
                } else if (rand >= 0.68 && rand < 0.80 && abilities.some(a => a.type === AbilityType.SMASH)) {
                    if (this.ai.activateAbility(AbilityType.SMASH)) {
                        this.balls.forEach(b => { b.speedX *= 1.5; b.speedY *= 1.2; });
                        this.soundManager.play('smash');
                    }
                } else if (rand >= 0.80 && rand < 0.88 && abilities.some(a => a.type === AbilityType.TELEPORT)) {
                    if (distanceFromBall > 120 && Math.abs(targetBall.x - this.ai.x) < 80) {
                        this.ai.activateAbility(AbilityType.TELEPORT);
                        this.ai.teleport(this.canvas.height);
                    }
                } else if (rand >= 0.88 && rand < 0.95 && abilities.some(a => a.type === AbilityType.MINI_PADDLE)) {
                    if (Math.random() < 0.33) {
                        this.ai.activateAbility(AbilityType.MINI_PADDLE);
                        this.player.applyMiniPaddle();
                    }
                }
            }
        }

        // Magnet: only affect balls in front of player's paddle (on player's side)
        if (this.magnetActive) {
            const paddleCenter = this.player.y + (this.player.height / 2);
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

        // Update balls: physics / collisions / scoring
        this.balls = this.balls.filter(ball => {
            ball.update();

            // wall collision
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

        // if all balls gone, reset main ball
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

    /* ---------------------------
       Rendering / Draw
       --------------------------- */

    private draw(): void {
        // clear
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // effect overlays
        if (this.slowMotionActive) {
            this.ctx.fillStyle = 'rgba(76,222,128,0.08)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.freezeActive) {
            this.ctx.fillStyle = 'rgba(96,165,250,0.12)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.reverseControlsActive) {
            this.ctx.fillStyle = 'rgba(236,72,153,0.08)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.magnetActive) {
            const grad = this.ctx.createRadialGradient(this.player.x, this.player.y + (this.player.height / 2), 0, this.player.x, this.player.y + (this.player.height / 2), 150);
            grad.addColorStop(0, 'rgba(124,58,237,0.16)');
            grad.addColorStop(1, 'rgba(124,58,237,0)');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.gravityActive) {
            this.ctx.fillStyle = 'rgba(34,211,238,0.06)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // center dashed line
        this.ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // draw paddles
        this.player.draw(this.ctx);
        if (this.freezeActive) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.75;
            this.ai.draw(this.ctx);
            this.ctx.restore();
        } else {
            this.ai.draw(this.ctx);
        }

        // balls (Ball.draw respects isGhost)
        this.balls.forEach(b => b.draw(this.ctx));

        // UI overlays
        this.drawSpeedometer();
        this.drawAbilityHints();
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

    private drawActiveEffects(): void {
        const effects: string[] = [];
        if (this.slowMotionActive) effects.push('🟢 Slow Motion');
        if (this.reverseControlsActive) effects.push('🔄 Reversed');
        if (this.magnetActive) effects.push('🧲 Magnet');
        if (this.doubleScoreActive) effects.push('💎 Double Score');
        if (this.freezeActive) effects.push('❄️ Frozen');
        if (this.multiBallActive) effects.push('🟡 Multi-Ball');
        if (this.gravityActive) effects.push('🌍 Gravity');

        if (effects.length === 0) return;

        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        this.ctx.fillStyle = 'rgba(255,255,255,1)';

        effects.forEach((effect, i) => {
            const y = 80 + i * 28; // moved slightly down to avoid overlap with top HUD
            this.ctx.strokeText(effect, this.canvas.width / 2, y);
            this.ctx.fillText(effect, this.canvas.width / 2, y);
        });

        this.ctx.textAlign = 'left';
        this.ctx.lineWidth = 1;
    }

    private drawAbilityHints(): void {
        const abilities = this.player.getAssignedAbilities();
        this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
        this.ctx.font = '14px Arial';
        const hints = abilities.map(a => `${a.key}: ${a.name}`).join(' | ');
        this.ctx.fillText(hints, 10, this.canvas.height - 20);
        this.ctx.fillText('↑↓ or W/S: Move', 10, this.canvas.height - 40);
    }

    private drawSpeedometer(): void {
        const speed = this.balls.length > 0 ? this.balls[0].getSpeed() : 0;
        const maxDisplaySpeed = 15;
        const pct = Math.min(speed / maxDisplaySpeed, 1);
        const x = this.canvas.width / 2 - 100;
        const y = 20;
        const w = 200;
        const h = 20;
        this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
        this.ctx.fillRect(x, y, w, h);

        const grad = this.ctx.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, '#4ade80'); grad.addColorStop(0.5, '#fbbf24'); grad.addColorStop(1, '#ef4444');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x, y, w * pct, h);

        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`SPEED: ${speed.toFixed(1)}`, this.canvas.width / 2, y + h + 15);
        this.ctx.textAlign = 'left';
    }

    /* ---------------------------
       Score / Leaderboard / End Game
       --------------------------- */

    private updateScore(): void {
        const p = document.getElementById('playerScore');
        const a = document.getElementById('aiScore');
        if (p) p.textContent = this.playerScore.toString();
        if (a) a.textContent = this.aiScore.toString();
    }

    private checkGameOver(): void {
        if (this.arcadeMode) {
            // in Arcade Mode, AI reaching 10 ends game (player loses)
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
        const gc = document.getElementById('gameContainer');
        const go = document.getElementById('gameOver');
        if (gc) gc.classList.add('hidden');
        if (go) go.classList.remove('hidden');
        const title = document.getElementById('gameOverTitle');
        const final = document.getElementById('finalScore');
        if (title) title.textContent = this.playerScore > this.aiScore ? '🎉 You Win!' : '😢 You Lose!';
        if (final) final.textContent = `Final Score: ${this.playerScore} - ${this.aiScore}`;
    }

    private saveScore(): void {
        const nameInput = document.getElementById('playerName') as HTMLInputElement | null;
        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Anonymous';
        const mode = this.arcadeMode ? 'arcade' : 'standard';
        this.leaderboardManager.addEntry(name, this.playerScore, this.aiScore, mode);
        this.showMenu();
        if (nameInput) nameInput.value = '';
    }

    private showMenu(): void {
        this.stopGame();
        this.musicManager.stop();
        document.body.classList.remove('game-active');
        const menu = document.getElementById('menu');
        const gc = document.getElementById('gameContainer');
        const leader = document.getElementById('leaderboard');
        const go = document.getElementById('gameOver');
        if (menu) menu.classList.remove('hidden');
        if (gc) gc.classList.add('hidden');
        if (leader) leader.classList.add('hidden');
        if (go) go.classList.add('hidden');
    }

    private showLeaderboard(): void {
        this.stopGame();
        document.body.classList.remove('game-active');
        const menu = document.getElementById('menu');
        const gc = document.getElementById('gameContainer');
        const leader = document.getElementById('leaderboard');
        const go = document.getElementById('gameOver');
        if (menu) menu.classList.add('hidden');
        if (gc) gc.classList.add('hidden');
        if (leader) leader.classList.remove('hidden');
        if (go) go.classList.add('hidden');

        const tbody = document.getElementById('leaderboardBody') as HTMLTableSectionElement | null;
        if (!tbody) return;
        tbody.innerHTML = '';

        // default: sort by player score
        const entries = this.leaderboardManager.getEntries('player');
        entries.forEach((entry, idx) => {
            const row = tbody.insertRow();
            row.innerHTML = `<td>${idx + 1}</td><td>${entry.name}</td><td>${entry.score}</td><td>${entry.mode ?? 'standard'}</td><td>${entry.date}</td>`;
        });

        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No entries yet!</td></tr>';
        }
    }
}