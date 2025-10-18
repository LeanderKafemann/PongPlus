/**
 * Shared types and interfaces
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.3.2
 */

/**
 * Leaderboard entry with player name, both scores, and date
 */
export interface LeaderboardEntry {
    name: string;
    score: string;     // Combined score string (e.g., "5 - 3")
    date: string;      // Date of the game
}

/**
 * Game configuration settings
 */
export interface GameConfig {
    canvasWidth: number;   // Canvas width in pixels
    canvasHeight: number;  // Canvas height in pixels
    winScore: number;      // Points needed to win (10)
    paddleSpeed: number;   // Base paddle movement speed
}