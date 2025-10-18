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

export enum AbilityType {
  SMASH = 'smash',
  SHIELD = 'shield',
  SPEED_BOOST = 'speedBoost'
}

export interface Ability {
  type: AbilityType;
  name: string;
  cooldown: number;
  duration: number;
  key: string;
}