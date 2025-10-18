/**
 * PongPlus - A Modern TypeScript Pong Game
 * @author LeanderKafemann
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @license MIT
 */

import './style.css';

/**
 * SoundManager handles all audio effects in the game
 * Uses Web Audio API to generate sounds without external files
 */
class SoundManager {
  private sounds: { [key: string]: AudioBuffer } = {};
  private audioContext: AudioContext;
  private enabled: boolean = true;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.createSounds();
  }

  /**
   * Creates audio buffers for different game sounds
   */
  private createSounds() {
    this.sounds.paddleHit = this.createTone(440, 0.1); // A4 note
    this.sounds.wallHit = this.createTone(220, 0.1);   // A3 note
    this.sounds.score = this.createTone(330, 0.3);     // E4 note
  }

  /**
   * Generates a tone using sine wave with exponential decay
   * @param frequency - Frequency in Hz
   * @param duration - Duration in seconds
   * @returns AudioBuffer containing the generated tone
   */
  private createTone(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * Math.exp(-3 * i / numSamples);
    }

    return buffer;
  }

  /**
   * Plays a sound effect
   * @param soundName - Name of the sound to play
   */
  play(soundName: string) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[soundName];
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  /**
   * Toggles sound on/off
   * @returns Current sound state
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

/**
 * Represents a leaderboard entry
 */
interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

/**
 * LeaderboardManager handles persistent score storage
 * Uses localStorage to save top 10 scores
 */
class LeaderboardManager {
  private storageKey = 'pongplus_leaderboard';

  /**
   * Retrieves all leaderboard entries from localStorage
   * @returns Array of leaderboard entries
   */
  getEntries(): LeaderboardEntry[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Adds a new entry to the leaderboard and sorts by score
   * @param name - Player name
   * @param score - Player score
   */
  addEntry(name: string, score: number): void {
    const entries = this.getEntries();
    entries.push({ name, score, date: new Date().toLocaleDateString() });
    entries.sort((a, b) => b.score - a.score);
    localStorage.setItem(this.storageKey, JSON.stringify(entries.slice(0, 10)));
  }

  /**
   * Clears all leaderboard entries
   */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Paddle represents a player or AI controlled paddle
 */
class Paddle {
  constructor(
    public x: number,
    public y: number,
    public width: number = 10,
    public height: number = 100,
    public speed: number = 5
  ) {}

  /**
   * Renders the paddle on the canvas
   * @param ctx - Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Moves the paddle up or down
   * @param direction - -1 for up, 1 for down
   * @param canvasHeight - Height of the canvas for boundary checking
   */
  move(direction: number, canvasHeight: number): void {
    this.y += direction * this.speed;
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
  }
}

/**
 * Ball represents the game ball with physics and visual effects
 */
class Ball {
  private trailPositions: { x: number; y: number }[] = [];
  private maxTrailLength: number = 8;

  constructor(
    public x: number,
    public y: number,
    public radius: number = 8,
    public speedX: number = 4,
    public speedY: number = 4
  ) {}

  /**
   * Draws the ball with a motion trail effect that intensifies with speed
   * @param ctx - Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Calculate current speed for trail intensity
    const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    const initialSpeed = Math.sqrt(4 * 4 + 4 * 4); // Initial speed magnitude
    const speedMultiplier = currentSpeed / initialSpeed;

    // Draw motion trail (fades based on age and speed)
    this.trailPositions.forEach((pos, index) => {
      const alpha = (index / this.trailPositions.length) * 0.4 * speedMultiplier;
      const size = this.radius * (0.5 + (index / this.trailPositions.length) * 0.5);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw main ball with glow effect when fast
    if (speedMultiplier > 1.5) {
      // Add glow effect for high speed
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 200, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw main ball
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Updates ball position and trail
   */
  update(): void {
    // Add current position to trail
    this.trailPositions.push({ x: this.x, y: this.y });
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.shift();
    }

    // Update position
    this.x += this.speedX;
    this.y += this.speedY;
  }

  /**
   * Resets the ball to center with random direction
   * @param canvasWidth - Canvas width
   * @param canvasHeight - Canvas height
   */
  reset(canvasWidth: number, canvasHeight: number): void {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.speedY = (Math.random() - 0.5) * 8;
    this.trailPositions = []; // Clear trail on reset
  }
}

/**
 * PongGame - Main game class that handles all game logic
 */
class PongGame {
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
  private soundManager: SoundManager;
  private leaderboardManager: LeaderboardManager;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.soundManager = new SoundManager();
    this.leaderboardManager = new LeaderboardManager();

    // Initialize paddles
    const paddleOffset = 20;
    this.player = new Paddle(paddleOffset, this.canvas.height / 2 - 50);
    this.ai = new Paddle(this.canvas.width - paddleOffset - 10, this.canvas.height / 2 - 50);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);

    this.setupControls();
    this.setupUI();
  }

  /**
   * Sets up keyboard event listeners
   */
  private setupControls(): void {
    window.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
  }

  /**
   * Sets up UI button event listeners
   */
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

  /**
   * Shows the main menu screen
   */
  private showMenu(): void {
    document.getElementById('menu')!.classList.remove('hidden');
    document.getElementById('gameContainer')!.classList.add('hidden');
    document.getElementById('leaderboard')!.classList.add('hidden');
    document.getElementById('gameOver')!.classList.add('hidden');
  }

  /**
   * Displays the leaderboard with all entries
   */
  private showLeaderboard(): void {
    document.getElementById('menu')!.classList.add('hidden');
    document.getElementById('leaderboard')!.classList.remove('hidden');
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

  /**
   * Starts a new game
   */
  private startGame(): void {
    document.getElementById('menu')!.classList.add('hidden');
    document.getElementById('gameContainer')!.classList.remove('hidden');
    
    // Reset scores and ball
    this.playerScore = 0;
    this.aiScore = 0;
    this.updateScore();
    this.ball.reset(this.canvas.width, this.canvas.height);
    this.paused = false;
    
    this.gameLoop();
  }

  /**
   * Toggles game pause state
   */
  private togglePause(): void {
    this.paused = !this.paused;
    document.getElementById('pauseBtn')!.textContent = this.paused ? 'Resume' : 'Pause';
    if (!this.paused) this.gameLoop();
  }

  /**
   * Main game loop - updates and renders the game
   */
  private gameLoop(): void {
    if (this.paused) return;
    
    this.update();
    this.draw();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Updates game state (physics, AI, collisions)
   */
  private update(): void {
    // Player controls (W/S keys)
    if (this.keys['w'] || this.keys['W']) this.player.move(-1, this.canvas.height);
    if (this.keys['s'] || this.keys['S']) this.player.move(1, this.canvas.height);

    // AI logic - follows ball with slight delay
    const aiCenter = this.ai.y + this.ai.height / 2;
    if (aiCenter < this.ball.y - 35) this.ai.move(1, this.canvas.height);
    else if (aiCenter > this.ball.y + 35) this.ai.move(-1, this.canvas.height);

    // Update ball position
    this.ball.update();

    // Wall collision (top and bottom)
    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
      this.ball.speedY *= -1;
      this.soundManager.play('wallHit');
    }

    // Paddle collision - increases speed by 5% on each hit
    if (this.checkCollision(this.ball, this.player) || this.checkCollision(this.ball, this.ai)) {
      this.ball.speedX *= -1.05; // Reverse direction and increase speed
      this.soundManager.play('paddleHit');
    }

    // Scoring - left side (AI scores)
    if (this.ball.x - this.ball.radius <= 0) {
      this.aiScore++;
      this.soundManager.play('score');
      this.updateScore();
      this.checkGameOver();
      this.ball.reset(this.canvas.width, this.canvas.height);
    } 
    // Scoring - right side (Player scores)
    else if (this.ball.x + this.ball.radius >= this.canvas.width) {
      this.playerScore++;
      this.soundManager.play('score');
      this.updateScore();
      this.checkGameOver();
      this.ball.reset(this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Checks for collision between ball and paddle
   * @param ball - The ball object
   * @param paddle - The paddle object
   * @returns True if collision detected
   */
  private checkCollision(ball: Ball, paddle: Paddle): boolean {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
  }

  /**
   * Renders all game objects on canvas
   */
  private draw(): void {
    // Clear canvas with dark background
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw center line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Draw game objects
    this.player.draw(this.ctx);
    this.ai.draw(this.ctx);
    this.ball.draw(this.ctx);
  }

  /**
   * Updates the score display
   */
  private updateScore(): void {
    document.getElementById('playerScore')!.textContent = this.playerScore.toString();
    document.getElementById('aiScore')!.textContent = this.aiScore.toString();
  }

  /**
   * Checks if game is over (first to 5 wins)
   */
  private checkGameOver(): void {
    const winScore = 5;
    if (this.playerScore >= winScore || this.aiScore >= winScore) {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.showGameOver();
    }
  }

  /**
   * Displays the game over screen
   */
  private showGameOver(): void {
    document.getElementById('gameContainer')!.classList.add('hidden');
    document.getElementById('gameOver')!.classList.remove('hidden');
    
    const won = this.playerScore > this.aiScore;
    document.getElementById('gameOverTitle')!.textContent = won ? '🎉 You Win!' : '😢 You Lose!';
    document.getElementById('finalScore')!.textContent = `Final Score: ${this.playerScore} - ${this.aiScore}`;
  }

  /**
   * Saves the player's score to the leaderboard
   */
  private saveScore(): void {
    const nameInput = document.getElementById('playerName') as HTMLInputElement;
    const name = nameInput.value.trim() || 'Anonymous';
    this.leaderboardManager.addEntry(name, this.playerScore);
    this.showMenu();
    nameInput.value = '';
  }
}

// Initialize game when page loads
new PongGame();