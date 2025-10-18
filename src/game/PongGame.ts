/**
 * PongGame - Main game logic with random abilities
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.2.0
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
  private playerScore: number = 0;
  private aiScore: number = 0;
  private keys: { [key: string]: boolean } = {};
  private animationId: number | null = null;
  private paused: boolean = false;
  private gameRunning: boolean = false;
  private soundManager: SoundManager;
  private leaderboardManager: LeaderboardManager;
  private musicManager: MusicManager;
  private abilitySystem: AbilitySystem;
  private config: GameConfig;
  private countdown: number = 0;
  private countdownActive: boolean = false;
  private slowMotionActive: boolean = false;
  private reverseControlsActive: boolean = false;
  private magnetActive: boolean = false;
  private doubleScoreActive: boolean = false;
  private freezeActive: boolean = false;
  
  // Easter Eggs
  private konamiCode: string[] = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  private konamiProgress: number = 0;
  private secretClicks: number = 0;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.soundManager = new SoundManager();
    this.leaderboardManager = new LeaderboardManager();
    this.musicManager = new MusicManager();
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
    this.setupEasterEggs();
    this.setupMusicToggle();
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => { 
      this.keys[e.key] = true;
      this.checkKonamiCode(e.key);
      
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

  private activateKonamiCode(): void {
    document.body.classList.add('konami-active');
    alert('🎉 Konami Code Activated! Rainbow Mode Enabled!');
    this.soundManager.play('score');
  }

  private setupEasterEggs(): void {
    // Secret click counter on title
    const title = document.querySelector('h1');
    if (title) {
      title.addEventListener('click', () => {
        this.secretClicks++;
        if (this.secretClicks === 10) {
          title.classList.add('shake');
          alert('🎮 You found a secret! Ultra Speed Mode unlocked for next game!');
          this.config.paddleSpeed = 12;
          setTimeout(() => title.classList.remove('shake'), 500);
          this.secretClicks = 0;
        }
      });
    }
  }

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
      case AbilityType.REVERSE_CONTROLS:
        this.reverseControlsActive = true;
        this.soundManager.play('reverseControls');
        setTimeout(() => {
          this.reverseControlsActive = false;
        }, 3000);
        break;
      case AbilityType.MAGNET:
        this.magnetActive = true;
        this.soundManager.play('magnet');
        setTimeout(() => {
          this.magnetActive = false;
        }, 2000);
        break;
      case AbilityType.DOUBLE_SCORE:
        this.doubleScoreActive = true;
        this.soundManager.play('doubleScore');
        break;
      case AbilityType.FREEZE:
        this.freezeActive = true;
        this.soundManager.play('freeze');
        setTimeout(() => {
          this.freezeActive = false;
        }, 1500);
        break;
      case AbilityType.MULTI_BALL:
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
    this.musicManager.stop();
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
    
    // Start music
    this.musicManager.start();
    
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
      `<div class="ability-badge" style="background: ${a.color};">
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
    // Player controls with arrow keys OR W/S
    const upPressed = this.keys['w'] || this.keys['W'] || this.keys['ArrowUp'];
    const downPressed = this.keys['s'] || this.keys['S'] || this.keys['ArrowDown'];
    
    // Reverse controls if active
    const direction = this.reverseControlsActive ? -1 : 1;
    
    if (upPressed) this.player.move(-1 * direction, this.canvas.height);
    if (downPressed) this.player.move(1 * direction, this.canvas.height);

    this.player.update();
    
    // AI can't move if frozen
    if (!this.freezeActive) {
      this.ai.update();
      
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
        } else if (random < 0.4 && abilities.some(a => a.type === AbilityType.FREEZE)) {
          // AI uses freeze on player
          this.ai.activateAbility(AbilityType.FREEZE);
        }
      }
    }

    // Magnet effect - pull ball towards player paddle
    if (this.magnetActive) {
      const paddleCenter = this.player.y + this.player.height / 2;
      const dy = paddleCenter - this.ball.y;
      this.ball.speedY += dy * 0.02;
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
      const points = this.doubleScoreActive ? 2 : 1;
      this.aiScore += points;
      this.doubleScoreActive = false;
      this.soundManager.play('score');
      this.updateScore();
      this.checkGameOver();
      if (this.gameRunning) {
        this.ball.reset(this.canvas.width, this.canvas.height);
      }
    } 
    else if (this.ball.x + this.ball.radius >= this.canvas.width) {
      const points = this.doubleScoreActive ? 2 : 1;
      this.playerScore += points;
      this.doubleScoreActive = false;
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
    
    // Freeze effect overlay
    if (this.freezeActive) {
      this.ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Reverse controls indicator
    if (this.reverseControlsActive) {
      this.ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Magnet effect
    if (this.magnetActive) {
      const gradient = this.ctx.createRadialGradient(
        this.player.x, this.player.y + this.player.height / 2, 0,
        this.player.x, this.player.y + this.player.height / 2, 150
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      this.ctx.fillStyle = gradient;
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
    
    // Draw frozen AI with ice effect
    if (this.freezeActive) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.7;
      this.ai.draw(this.ctx);
      this.ctx.restore();
      
      // Ice crystals
      this.ctx.fillStyle = 'rgba(96, 165, 250, 0.5)';
      for (let i = 0; i < 5; i++) {
        const x = this.ai.x + Math.random() * this.ai.width;
        const y = this.ai.y + Math.random() * this.ai.height;
        this.ctx.fillRect(x, y, 3, 3);
      }
    } else {
      this.ai.draw(this.ctx);
    }
    
    this.ball.draw(this.ctx);
    
    this.drawSpeedometer();
    this.drawAbilityHints();
    this.drawActiveEffects();
    
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

  private drawActiveEffects(): void {
    const effects: string[] = [];
    
    if (this.slowMotionActive) effects.push('🟢 Slow Motion');
    if (this.reverseControlsActive) effects.push('🔄 Reversed');
    if (this.magnetActive) effects.push('🧲 Magnet');
    if (this.doubleScoreActive) effects.push('💎 Double Score');
    if (this.freezeActive) effects.push('❄️ Frozen');
    
    if (effects.length > 0) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      effects.forEach((effect, index) => {
        this.ctx.fillText(effect, this.canvas.width / 2, 60 + index * 25);
      });
      this.ctx.textAlign = 'left';
    }
  }

  private drawAbilityHints(): void {
    const abilities = this.player.getAssignedAbilities();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '14px Arial';
    
    const hints = abilities.map(a => `${a.key}: ${a.name}`).join(' | ');
    this.ctx.fillText(hints, 10, this.canvas.height - 10);
    
    // Arrow keys hint
    this.ctx.fillText('↑↓ or W/S: Move', 10, this.canvas.height - 30);
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
      this.musicManager.stop();
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