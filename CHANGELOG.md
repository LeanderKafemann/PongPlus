# Changelog

All notable changes to PongPlus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Fixed reverse controls (AI only), magnet bug, active effects text visibility
- AI can now use Ghost Ball and Multi-Ball
- Music 2.5x faster, win score changed to 10
- Added JSDoc comments throughout codebase

## [1.3.0] - 2025-01-18
- PWA support with offline capability
- Added 3 new abilities (Mini Paddle, Gravity, Super Smash) - total 15
- Added 5 new easter eggs, button hover effects
- Faster music, custom scrollbar

## [1.2.1] - 2025-01-18
- Fixed arrow key scrolling, magnet physics, multi-ball
- Enhanced footer hover effects, removed easter egg hints

## [1.2.0] - 2025-01-18
- Added background music, 4 new abilities (total 12)
- Glassmorphism UI, 8 easter eggs
- Arrow key support, visual effect overlays

## [1.1.0] - 2025-01-18
- Random ability system (8 abilities)
- Dynamic key bindings, AI ability usage
- Enhanced README

## [1.0.0] - 2025-01-18
- Initial release with core Pong gameplay
- 3 fixed abilities, AI opponent
- Visual effects, sound system, leaderboard

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.3.2)

---

**Maintained by:** [@LeanderKafemann](https://github.com/LeanderKafemann)

**Last Updated:** 2025-01-18