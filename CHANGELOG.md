# Changelog

All notable changes to PongPlus will be documented in this file.

---

## [1.3.2] - 2025-01-18

### 🐛 TypeScript Build Fix

#### Fixed
- 🐛 **TypeScript Errors** - Fixed LeaderboardEntry interface type mismatch
- 🔧 **Score Storage** - Changed to combined score string format ("X - Y")
- 📊 **Leaderboard Sorting** - Now correctly sorts by player score from combined string

#### Technical
- 🔧 **types.ts** - LeaderboardEntry.score is now a string (was playerScore/aiScore)
- 📝 **LeaderboardManager** - Stores scores as "playerScore - aiScore" string
- 🎯 **Sorting Logic** - Extracts player score from string for sorting

---

## [1.3.1] - 2025-01-18

### 🐛 Bug Fixes & Improvements

#### Fixed
- 🐛 **Reverse Controls** - Now only affects AI, not the player
- 🐛 **Active Effects Text** - Added black outline for better visibility
- 🐛 **Magnet Bug** - Fixed ball being pulled behind player's paddle
- 🐛 **AI Ghost Ball** - AI can now use Ghost Ball ability (25% chance)
- 🐛 **AI Multi-Ball** - AI can now use Multi-Ball ability (20% chance)

#### Enhanced
- 🎵 **Music Speed** - Much faster tempo: 100ms instead of 250ms per note
- 📊 **Leaderboard** - Now shows both player and AI scores (e.g., "5 - 3")
- 🎯 **Win Condition** - Changed from 5 to 10 points to win
- 📝 **Code Comments** - Added extensive JSDoc comments throughout

---

## [1.3.0] - 2025-01-18

### 📱 PWA Support & More Content

(... rest bleibt gleich ...)