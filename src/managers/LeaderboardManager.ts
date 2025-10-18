/**
 * LeaderboardManager - Handles persistent score storage
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.3.1
 */

import type { LeaderboardEntry } from '../game/types';

export class LeaderboardManager {
    private storageKey = 'pongplus_leaderboard';

    /**
     * Get all leaderboard entries from localStorage
     * @returns Array of leaderboard entries sorted by player score (descending)
     */
    getEntries(): LeaderboardEntry[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Add a new leaderboard entry
     * @param name - Player name
     * @param playerScore - Player's final score
     * @param aiScore - AI's final score
     */
    addEntry(name: string, playerScore: number, aiScore: number): void {
        const entries = this.getEntries();

        // Create new entry with both scores
        entries.push({
            name,
            playerScore,
            aiScore,
            date: new Date().toLocaleDateString()
        });

        // Sort by player score (descending)
        entries.sort((a, b) => b.playerScore - a.playerScore);

        // Keep only top 10
        localStorage.setItem(this.storageKey, JSON.stringify(entries.slice(0, 10)));
    }

    /**
     * Clear all leaderboard entries
     */
    clear(): void {
        localStorage.removeItem(this.storageKey);
    }
}