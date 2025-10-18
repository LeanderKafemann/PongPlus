/**
 * LeaderboardManager - Handles persistent score storage
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.3.3
 */

import type { LeaderboardEntry } from '../game/types';

export class LeaderboardManager {
    private storageKey = 'pongplus_leaderboard';

    /**
     * Get all leaderboard entries from localStorage
     * Handles migration from old format (number score) to new format (string score)
     * @returns Array of leaderboard entries sorted by player score (descending)
     */
    getEntries(): LeaderboardEntry[] {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];

        const entries = JSON.parse(data);

        // Migrate old entries to new format
        return entries.map((entry: any) => {
            // Old format: { name, score: number, date }
            // New format: { name, score: "X - Y", date }
            if (typeof entry.score === 'number') {
                return {
                    name: entry.name,
                    score: `${entry.score} - 0`, // Convert old score to new format
                    date: entry.date
                };
            }
            return entry;
        });
    }

    /**
     * Add a new leaderboard entry
     * @param name - Player name
     * @param playerScore - Player's final score
     * @param aiScore - AI's final score
     */
    addEntry(name: string, playerScore: number, aiScore: number): void {
        const entries = this.getEntries();

        // Create new entry with combined score string
        entries.push({
            name,
            score: `${playerScore} - ${aiScore}`, // Combined score string
            date: new Date().toLocaleDateString()
        });

        // Sort by player score (extract from "X - Y" string)
        entries.sort((a, b) => {
            const scoreA = parseInt(a.score.split(' - ')[0]);
            const scoreB = parseInt(b.score.split(' - ')[0]);
            return scoreB - scoreA;
        });

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