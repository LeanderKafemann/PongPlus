/**
 * PongGame - Main game logic with random abilities
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.1.0
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { SoundManager } from '../managers/SoundManager';
import { LeaderboardManager } from '../managers/LeaderboardManager';
import { AbilitySystem, AbilityType, type Ability } from './AbilitySystem';
import type { GameConfig } from './types';

export class PongGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Paddle;
  private ai: Paddle;
  private ball: Ball;
  private playerScore: number = 0;
  private aiScore: number = 0;
  private keys: { [key: string]: boolean } = {};
  private animationId: number | null = null;
  private paused: boolean = false;
  private gameRunning: boolean = false;
  private soundManager: SoundManager;
  private leaderboardManager: LeaderboardManager;
  private abilitySystem: AbilitySystem;
  private config: GameConfig;
  private countdown: number = 0;
  private countdownActive: boolean = false;
  private slowMotionActive: boolean = false;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.soundManager = new SoundManager();
    this.leaderboardManager = new LeaderboardManager();
    this.abilitySystem = new AbilitySystem();

    this.config = {
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      winScore: 5,
      paddleSpeed: 6
    };

    const paddleOffset = 20;
    this.player = new Paddle(paddleOffset, this.canvas.height / 2 - 50);
    this.ai = new Paddle(this.canvas.width - paddleOffset - 10, this.canvas.height / 2 - 50);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);

    this.setupControls();
    this.setupUI();
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => { 
      this.keys[e.key] = true;
      
      if (!this.gameRunning || this.paused || this.countdownActive) return;
      
      const abilities = this.player.getAssignedAbilities();
      
      abilities.forEach(ability => {
        if (this.isAbilityKey(e.key, ability.key)) {
          e.preventDefault();
          this.activatePlayerAbility(ability.type);
        }
      });
    });
    window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
  }

  private isAbilityKey(pressedKey: string, abilityKey: string): boolean {
    if (abilityKey === 'SPACE') return pressedKey === ' ';
    return pressedKey.toLowerCase() === abilityKey.toLowerCase();
  }

  private activatePlayerAbility(type: AbilityType): void {
    const activated = this.player.activateAbility(type);
    if (!activated) return;

    switch (type) {
      case AbilityType.SMASH:
        this.ball.speedX *= 1.5;
        this.ball.speedY *= 1.2;
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
        this.ball.applySlowMotion();
        this.soundManager.play('slowMotion');
        setTimeout(() => {
          this.slowMotionActive = false;
          this.ball.removeSlowMotion();
        }, 2000);
        break;
      case AbilityType.GHOST_BALL:
        this.ball.setGhost(true);
        this.soundManager.play('ghostBall');
        setTimeout(() => {
          this.ball.setGhost(false);
        }, 1500);
        break;
      case AbilityType.GIANT_PADDLE:
        this.soundManager.play('giantPaddle');
        break;
      case AbilityType.MULTI_BALL:
        // Multi-ball would require more complex implementation
        this.soundManager.play('multiBall');
        break;
    }
  }

  private setupUI(): void {
    document.getElementById('startBtn')!.addEventListener('click', () => this.startGame());
    document.getElementById('leaderboardBtn')!.addEventListener('click', () => this.showLeaderboard());
    document.getElementById('soundToggle')!.addEventListener('click', () => {
      const enabled = this.soundManager.toggle();
      document.getElementById('soundToggle')!.textContent = `🔊 Sound: ${enabled ? 'ON' : 'OFF'}`;
    });
    document.getElementById('pauseBtn')!.addEventListener('click', () => this.togglePause());
    document.getElementById('backBtn')!.addEventListener('click', () => this.showMenu());
    document.getElementById('menuBtn')!.addEventListener('click', () => this.showMenu());
    document.getElementById('saveScoreBtn')!.addEventListener('click', () => this.saveScore());
    document.getElementById('clearBtn')!.addEventListener('click', () => {
      if (confirm('Clear all leaderboard entries?')) {
        this.leaderboardManager.clear();
        this.showLeaderboard();
      }
    });
  }

  private showMenu(): void {
    this.stopGame();
    document.getElementById('menu')!.classList.remove('hidden');
    document.getElementById('gameContainer')!.classList.add('hidden');
    document.getElementById('leaderboard')!.classList.add('hidden');
    document.getElementById('gameOver')!.classList.add('hidden');
  }

  private showLeaderboard(): void {
    this.stopGame();
    document.getElementById('menu')!.classList.add('hidden');
    document.getElementById('gameContainer')!.classList.add('hidden');
    document.getElementById('leaderboard')!.classList.remove('hidden');
    document.getElementById('gameOver')!.classList.add('hidden');
    
    const tbody = document.getElementById('leaderboardBody') as HTMLTableSectionElement;
    tbody.innerHTML = '';
    
    const entries = this.leaderboardManager.getEntries();
    entries.forEach((entry, index) => {
      const row = tbody.insertRow();
      row.innerHTML = `<td>${index + 1}</td><td>${entry.name}</td><td>${entry.score}</td><td>${entry.date}</td>`;
    });
    
    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No entries yet!</td></tr>';
    }
  }

  private async startGame(): Promise<void> {
    this.stopGame();
    
    // Select random abilities
    const selectedAbilities = this.abilitySystem.selectRandomAbilities();
    this.player.setAbilities(selectedAbilities);
    this.ai.setAbilities(selectedAbilities);
    
    // Display selected abilities
    this.displaySelectedAbilities(selectedAbilities);
    
    document.getElementById('menu')!.classList.add('hidden');
    document.getElementById('gameContainer')!.classList.remove('hidden');
    document.getElementById('leaderboard')!.classList.add('hidden');
    document.getElementById('gameOver')!.classList.add('hidden');
    
    this.playerScore = 0;
    this.aiScore = 0;
    this.updateScore();
    this.ball.reset(this.canvas.width, this.canvas.height);
    this.paused = false;
    this.gameRunning = true;
    
    await this.runCountdown();
    
    if (this.gameRunning) {
      this.gameLoop();
    }
  }

  private displaySelectedAbilities(abilities: Ability[]): void {
    const container = document.getElementById('abilityDisplay');
    if (!container) return;
    
    container.innerHTML = abilities.map(a => 
      `<div style="display: inline-block; margin: 0 10px; padding: 5px 10px; background: ${a.color}; color: white; border-radius: 5px; font-size: 14px;">
        ${a.icon} ${a.name} (${a.key})
      </div>`
    ).join('');
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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
    document.getElementById('pauseBtn')!.textContent = this.paused ? 'Resume' : 'Pause';
    if (!this.paused) this.gameLoop();
  }

  private gameLoop(): void {
    if (this.paused || !this.gameRunning || this.countdownActive) return;
    
    this.update();
    this.draw();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    if (this.keys['w'] || this.keys['W']) this.player.move(-1, this.canvas.height);
    if (this.keys['s'] || this.keys['S']) this.player.move(1, this.canvas.height);

    this.player.update();
    this.ai.update();

    // AI logic
    const aiCenter = this.ai.y + this.ai.height / 2;
    if (aiCenter < this.ball.y - 35) this.ai.move(1, this.canvas.height);
    else if (aiCenter > this.ball.y + 35) this.ai.move(-1, this.canvas.height);

    // AI ability usage
    if (Math.abs(this.ball.x - this.ai.x) < 100 && this.ball.getSpeed() > 6) {
      const random = Math.random();
      const abilities = this.ai.getAssignedAbilities();
      
      if (random < 0.2 && abilities.some(a => a.type === AbilityType.SHIELD)) {
        this.ai.activateAbility(AbilityType.SHIELD);
      } else if (random < 0.3 && abilities.some(a => a.type === AbilityType.SMASH)) {
        if (this.ai.activateAbility(AbilityType.SMASH)) {
          this.ball.speedX *= 1.5;
          this.ball.speedY *= 1.2;
        }
      } else if (random < 0.35 && abilities.some(a => a.type === AbilityType.TELEPORT)) {
        this.ai.activateAbility(AbilityType.TELEPORT);
        this.ai.teleport(this.canvas.height);
      }
    }

    this.ball.update();

    // Wall collision
    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
      this.ball.speedY *= -1;
      this.ball.y = Math.max(this.ball.radius, Math.min(this.canvas.height - this.ball.radius, this.ball.y));
      this.soundManager.play('wallHit');
    }

    // Paddle collision
    const playerCollision = this.checkCollision(this.ball, this.player);
    const aiCollision = this.checkCollision(this.ball, this.ai);

    if (playerCollision || aiCollision) {
      const paddle = playerCollision ? this.player : this.ai;
      
      if (paddle.hasShield()) {
        this.ball.speedX *= -1;
        this.soundManager.play('shield');
      } else {
        const hitPos = (this.ball.y - paddle.y) / paddle.height;
        this.ball.speedY = (hitPos - 0.5) * 10;
        this.ball.speedX *= -1;
        
        if (paddle.isSmashing()) {
          this.ball.speedX *= 1.5;
          this.ball.speedY *= 1.2;
          this.soundManager.play('smash');
        } else {
          this.ball.speedX *= 1.05;
          this.soundManager.play('paddleHit');
        }
      }
      
      if (playerCollision) {
        this.ball.x = this.player.x + this.player.width + this.ball.radius;
      } else {
        this.ball.x = this.ai.x - this.ball.radius;
      }
    }

    // Scoring
    if (this.ball.x - this.ball.radius <= 0) {
      this.aiScore++;
      this.soundManager.play('score');
      this.updateScore();
      this.checkGameOver();
      if (this.gameRunning) {
        this.ball.reset(this.canvas.width, this.canvas.height);
      }
    } 
    else if (this.ball.x + this.ball.radius >= this.canvas.width) {
      this.playerScore++;
      this.soundManager.play('score');
      this.updateScore();
      this.checkGameOver();
      if (this.gameRunning) {
        this.ball.reset(this.canvas.width, this.canvas.height);
      }
    }
  }

  private checkCollision(ball: Ball, paddle: Paddle): boolean {
    const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
    const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
    
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return distanceSquared < (ball.radius * ball.radius);
  }

  private draw(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Slow motion effect overlay
    if (this.slowMotionActive) {
      this.ctx.fillStyle = 'rgba(76, 222, 128, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    this.player.draw(this.ctx);
    this.ai.draw(this.ctx);
    this.ball.draw(this.ctx);
    
    this.drawSpeedometer();
    this.drawAbilityHints();
    
    if (this.countdownActive && this.countdown > 0) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
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

  private drawAbilityHints(): void {
    const abilities = this.player.getAssignedAbilities();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '14px Arial';
    
    const hints = abilities.map(a => `${a.key}: ${a.name}`).join(' | ');
    this.ctx.fillText(hints, 10, this.canvas.height - 10);
  }

  private drawSpeedometer(): void {
    const speed = this.ball.getSpeed();
    const maxDisplaySpeed = 15;
    const speedPercent = Math.min(speed / maxDisplaySpeed, 1);
    
    const x = this.canvas.width / 2 - 100;
    const y = 20;
    const width = 200;
    const height = 20;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(x, y, width, height);
    
    const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, '#4ade80');
    gradient.addColorStop(0.5, '#fbbf24');
    gradient.addColorStop(1, '#ef4444');
    
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

  private checkGameOver(): void {
    if (this.playerScore >= this.config.winScore || this.aiScore >= this.config.winScore) {
      this.stopGame();
      this.showGameOver();
    }
  }

  private showGameOver(): void {
    document.getElementById('gameContainer')!.classList.add('hidden');
    document.getElementById('gameOver')!.classList.remove('hidden');
    
    const won = this.playerScore > this.aiScore;
    document.getElementById('gameOverTitle')!.textContent = won ? '🎉 You Win!' : '😢 You Lose!';
    document.getElementById('finalScore')!.textContent = `Final Score: ${this.playerScore} - ${this.aiScore}`;
  }

  private saveScore(): void {
    const nameInput = document.getElementById('playerName') as HTMLInputElement;
    const name = nameInput.value.trim() || 'Anonymous';
    this.leaderboardManager.addEntry(name, this.playerScore);
    this.showMenu();
    nameInput.value = '';
  }
}