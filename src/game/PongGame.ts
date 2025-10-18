/**
 * PongGame - Main game logic
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { SoundManager } from '../managers/SoundManager';
import { LeaderboardManager } from '../managers/LeaderboardManager';
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
  private config: GameConfig;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.soundManager = new SoundManager();
    this.leaderboardManager = new LeaderboardManager();

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
      
      if (e.key === ' ' && this.gameRunning && !this.paused) {
        e.preventDefault();
        if (this.player.smash()) {
          this.soundManager.play('smash');
        }
      }
    });
    window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
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

  private startGame(): void {
    this.stopGame();
    
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
    
    this.gameLoop();
  }

  private stopGame(): void {
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private togglePause(): void {
    if (!this.gameRunning) return;
    
    this.paused = !this.paused;
    document.getElementById('pauseBtn')!.textContent = this.paused ? 'Resume' : 'Pause';
    if (!this.paused) this.gameLoop();
  }

  private gameLoop(): void {
    if (this.paused || !this.gameRunning) return;
    
    this.update();
    this.draw();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    if (this.keys['w'] || this.keys['W']) this.player.move(-1, this.canvas.height);
    if (this.keys['s'] || this.keys['S']) this.player.move(1, this.canvas.height);

    this.player.update();
    this.ai.update();

    const aiCenter = this.ai.y + this.ai.height / 2;
    if (aiCenter < this.ball.y - 35) this.ai.move(1, this.canvas.height);
    else if (aiCenter > this.ball.y + 35) this.ai.move(-1, this.canvas.height);

    if (Math.abs(this.ball.x - this.ai.x) < 100 && this.ball.getSpeed() > 6) {
      this.ai.smash();
    }

    this.ball.update();

    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
      this.ball.speedY *= -1;
      this.ball.y = Math.max(this.ball.radius, Math.min(this.canvas.height - this.ball.radius, this.ball.y));
      this.soundManager.play('wallHit');
    }

    const playerCollision = this.checkCollision(this.ball, this.player);
    const aiCollision = this.checkCollision(this.ball, this.ai);

    if (playerCollision || aiCollision) {
      const paddle = playerCollision ? this.player : this.ai;
      
      const hitPos = (this.ball.y - paddle.y) / paddle.height;
      this.ball.speedY = (hitPos - 0.5) * 10;
      this.ball.speedX *= -1;
      
      if (paddle.getIsSmashing()) {
        this.ball.speedX *= 1.5;
        this.ball.speedY *= 1.2;
        this.soundManager.play('smash');
      } else {
        this.ball.speedX *= 1.05;
        this.soundManager.play('paddleHit');
      }
      
      if (playerCollision) {
        this.ball.x = this.player.x + this.player.width + this.ball.radius;
      } else {
        this.ball.x = this.ai.x - this.ball.radius;
      }
    }

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
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('Press SPACE to smash!', 10, this.canvas.height - 10);
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