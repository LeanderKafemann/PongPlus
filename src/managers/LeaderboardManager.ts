/**
 * LeaderboardManager - Handles persistent score storage
 * - robust migration from old numeric score formats
 * - supports storing mode (standard / arcade)
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.4.0
 */

import type { LeaderboardEntry } from '../game/types';

export class LeaderboardManager {
    private storageKey = 'pongplus_leaderboard';

    /**
     * Get all leaderboard entries from localStorage
     * Handles migration from old formats to the new { score: "X - Y", mode?: string } format.
     * Optionally can sort by 'player' (default) or 'ai'.
     * @param sortBy 'player' | 'ai'
     */
    getEntries(sortBy: 'player' | 'ai' = 'player'): LeaderboardEntry[] {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];

        let entries: any[] = JSON.parse(data);

        // Migrate old entries:
        // - Old format 1: { name, score: number, date }
        // - Old format 2: { name, playerScore, aiScore, date }
        entries = entries.map((entry: any) => {
            if (typeof entry.score === 'number') {
                // old single-number score -> convert to "X - 0"
                return {
                    name: entry.name,
                    score: `${entry.score} - 0`,
                    date: entry.date || new Date().toLocaleDateString(),
                    mode: entry.mode || 'standard'
                } as LeaderboardEntry;
            }
            if (typeof entry.playerScore === 'number' && typeof entry.aiScore === 'number') {
                return {
                    name: entry.name,
                    score: `${entry.playerScore} - ${entry.aiScore}`,
                    date: entry.date || new Date().toLocaleDateString(),
                    mode: entry.mode || 'standard'
                } as LeaderboardEntry;
            }
            // If already in the new format ensure fields exist
            return {
                name: entry.name,
                score: typeof entry.score === 'string' ? entry.score : `${entry.score || 0} - ${entry.aiScore ?? 0}`,
                date: entry.date || new Date().toLocaleDateString(),
                mode: entry.mode || 'standard'
            } as LeaderboardEntry;
        });

        // Sort by requested key descending
        entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
            const parse = (s: string, idx: 0 | 1) => {
                if (typeof s !== 'string') return 0;
                const parts = s.split(' - ').map(p => parseInt(p, 10));
                return Number.isNaN(parts[idx]) ? 0 : parts[idx];
            };
            const aVal = parse(a.score, sortBy === 'player' ? 0 : 1);
            const bVal = parse(b.score, sortBy === 'player' ? 0 : 1);
            return bVal - aVal;
        });

        return entries as LeaderboardEntry[];
    }

    /**
     * Add a new leaderboard entry
     * @param name - Player name
     * @param playerScore - Player's final score
     * @param aiScore - AI's final score
     * @param mode - 'standard' | 'arcade'
     */
    addEntry(name: string, playerScore: number, aiScore: number, mode: 'standard' | 'arcade' = 'standard'): void {
        const entries = this.getEntries(); // returns sorted array but we will push new then re-sort

        // Create new entry with combined score string
        entries.push({
            name,
            score: `${playerScore} - ${aiScore}`,
            date: new Date().toLocaleDateString(),
            mode
        } as LeaderboardEntry);

        // Sort by player score descending
        entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
            const parsePlayer = (s: string) => {
                const v = s.split(' - ')[0];
                const n = parseInt(v, 10);
                return Number.isNaN(n) ? 0 : n;
            };
            return parsePlayer(b.score) - parsePlayer(a.score);
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