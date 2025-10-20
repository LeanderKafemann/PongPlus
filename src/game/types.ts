/**
 * Shared types and interfaces
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.4.0
 */

/**
 * Leaderboard entry with player name, combined score, date and game mode
 * score: formatted "player - ai"
 * mode: "standard" | "arcade"
 */
export interface LeaderboardEntry {
    name: string;
    score: string;     // Combined score string (e.g., "5 - 3")
    date: string;      // Date of the game
    mode?: 'standard' | 'arcade';
}

/**
 * Game configuration settings
 */
export interface GameConfig {
    canvasWidth: number;   // Canvas width in pixels
    canvasHeight: number;  // Canvas height in pixels
    winScore: number;      // Points needed to win
    paddleSpeed: number;   // Base paddle movement speed
}