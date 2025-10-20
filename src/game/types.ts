/**
 * Shared types and interfaces
 * @version 1.4.0
 */

export interface LeaderboardEntry {
    name: string;
    score: string;     // "player - ai"
    date: string;
    mode?: 'standard' | 'arcade';
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    winScore: number;
    paddleSpeed: number;
}