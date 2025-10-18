import './style.css';

// Sound Manager (without external library)
class SoundManager {
  private sounds: { [key: string]: AudioBuffer } = {};
  private audioContext: AudioContext;
  private enabled: boolean = true;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.createSounds();
  }

  private createSounds() {
    this.sounds.paddleHit = this.createTone(440, 0.1);
    this.sounds.wallHit = this.createTone(220, 0.1);
    this.sounds.score = this.createTone(330, 0.3);
  }

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

  play(soundName: string) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[soundName];
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Leaderboard Manager
interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

class LeaderboardManager {
  private storageKey = 'pongplus_leaderboard';

  getEntries(): LeaderboardEntry[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addEntry(name: string, score: number): void {
    const entries = this.getEntries();
    entries.push({ name, score, date: new Date().toLocaleDateString() });
    entries.sort((a, b) => b.score - a.score);
    localStorage.setItem(this.storageKey, JSON.stringify(entries.slice(0, 10)));
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// Game Objects
class Paddle {
  constructor(
    public x: number,
    public y: number,
    public width: number = 10,
    public height: number = 100,
    public speed: number = 5
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(direction: number, canvasHeight: number): void {
    this.y += direction * this.speed;
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
  }
}

class Ball {
  constructor(
    public x: number,
    public y: number,
    public radius: number = 8,
    public speedX: number = 4,
    public speedY: number = 4
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(): void {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  reset(canvasWidth: number, canvasHeight: number): void {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.speedY = (Math.random() - 0.5) * 8;
  }
}

// Main Game Class
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

    const paddleOffset = 20;
    this.player = new Paddle(paddleOffset, this.canvas.height / 2 - 50);
    this.ai = new Paddle(this.canvas.width - paddleOffset - 10, this.canvas.height / 2 - 50);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);

    this.setupControls();
    this.setupUI();
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
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
    document.getElementById('menu')!.classList.remove('hidden');
    document.getElementById('gameContainer')!.classList.add('hidden');
    document.getElementById('leaderboard')!.classList.add('hidden');
    document.getElementById('gameOver')!.classList.add('hidden');
  }

  private showLeaderboard(): void {
    document.getElementById('menu')!.classList.add('hidden');
    document.getElementById('leaderboard')!.classList.remove('hidden');
    const tbody = document.getElementById('leaderboardBody')!;
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
    document.getElementById('menu')!.classList.add('hidden');
    document.getElementById('gameContainer')!.classList.remove('hidden');
    this.playerScore = 0;
    this.aiScore = 0;
    this.updateScore();
    this.ball.reset(this.canvas.width, this.canvas.height);
    this.paused = false;
    this.gameLoop();
  }

  private togglePause(): void {
    this.paused = !this.paused;
    document.getElementById('pauseBtn')!.textContent = this.paused ? 'Resume' : 'Pause';
    if (!this.paused) this.gameLoop();
  }

  private gameLoop(): void {
    if (this.paused) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    if (this.keys['w'] || this.keys['W']) this.player.move(-1, this.canvas.height);
    if (this.keys['s'] || this.keys['S']) this.player.move(1, this.canvas.height);

    const aiCenter = this.ai.y + this.ai.height / 2;
    if (aiCenter < this.ball.y - 35) this.ai.move(1, this.canvas.height);
    else if (aiCenter > this.ball.y + 35) this.ai.move(-1, this.canvas.height);

    this.ball.update();

    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
      this.ball.speedY *= -1;
      this.soundManager.play('wallHit');
    }

    if (this.checkCollision(this.ball, this.player) || this.checkCollision(this.ball, this.ai)) {
      this.ball.speedX *= -1.05;
      this.soundManager.play('paddleHit');
    }

    if (this.ball.x - this.ball.radius <= 0) {
      this.aiScore++;
      this.soundManager.play('score');
      this.updateScore();
      this.checkGameOver();
      this.ball.reset(this.canvas.width, this.canvas.height);
    } else if (this.ball.x + this.ball.radius >= this.canvas.width) {
      this.playerScore++;
      this.soundManager.play('score');
      this.updateScore();
      this.checkGameOver();
      this.ball.reset(this.canvas.width, this.canvas.height);
    }
  }

  private checkCollision(ball: Ball, paddle: Paddle): boolean {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
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
  }

  private updateScore(): void {
    document.getElementById('playerScore')!.textContent = this.playerScore.toString();
    document.getElementById('aiScore')!.textContent = this.aiScore.toString();
  }

  private checkGameOver(): void {
    const winScore = 5;
    if (this.playerScore >= winScore || this.aiScore >= winScore) {
      if (this.animationId) cancelAnimationFrame(this.animationId);
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

// Initialize game
new PongGame();