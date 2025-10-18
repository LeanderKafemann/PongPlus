/**
 * LeaderboardManager - Handles persistent score storage
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

import type { LeaderboardEntry } from '../game/types';

export class LeaderboardManager {
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