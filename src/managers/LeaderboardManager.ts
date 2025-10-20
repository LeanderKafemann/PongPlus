/**
 * LeaderboardManager - Handles persistent score storage
 * - robust migration from old numeric score formats
 * - supports storing mode (standard / arcade)
 * v1.4.1
 */

import type { LeaderboardEntry } from '../game/types';

export class LeaderboardManager {
    private storageKey = 'pongplus_leaderboard';

    getEntries(sortBy: 'player' | 'ai' = 'player'): LeaderboardEntry[] {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];
        let entries: any[] = JSON.parse(data);

        entries = entries.map((entry: any) => {
            if (typeof entry.score === 'number') {
                return { name: entry.name, score: `${entry.score} - 0`, date: entry.date || new Date().toLocaleDateString(), mode: entry.mode || 'standard' } as LeaderboardEntry;
            }
            if (typeof entry.playerScore === 'number' && typeof entry.aiScore === 'number') {
                return { name: entry.name, score: `${entry.playerScore} - ${entry.aiScore}`, date: entry.date || new Date().toLocaleDateString(), mode: entry.mode || 'standard' } as LeaderboardEntry;
            }
            return { name: entry.name, score: typeof entry.score === 'string' ? entry.score : `${entry.score || 0} - ${entry.aiScore ?? 0}`, date: entry.date || new Date().toLocaleDateString(), mode: entry.mode || 'standard' } as LeaderboardEntry;
        });

        entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
            const parse = (s: string, idx: 0 | 1) => {
                const parts = (typeof s === 'string' ? s.split(' - ') : ['0', '0']).map(p => parseInt(p, 10));
                return Number.isNaN(parts[idx]) ? 0 : parts[idx];
            };
            const aVal = parse(a.score, sortBy === 'player' ? 0 : 1);
            const bVal = parse(b.score, sortBy === 'player' ? 0 : 1);
            return bVal - aVal;
        });

        return entries as LeaderboardEntry[];
    }

    addEntry(name: string, playerScore: number, aiScore: number, mode: 'standard' | 'arcade' = 'standard'): void {
        const entries = this.getEntries();
        entries.push({ name, score: `${playerScore} - ${aiScore}`, date: new Date().toLocaleDateString(), mode } as LeaderboardEntry);
        entries.sort((a, b) => {
            const pa = parseInt(a.score.split(' - ')[0], 10) || 0;
            const pb = parseInt(b.score.split(' - ')[0], 10) || 0;
            return pb - pa;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(entries.slice(0, 10)));
    }

    clear(): void {
        localStorage.removeItem(this.storageKey);
    }
}