/**
 * Shared types and interfaces
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  winScore: number;
  paddleSpeed: number;
}