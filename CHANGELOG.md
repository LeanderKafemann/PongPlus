# Changelog

All notable changes to PongPlus will be documented in this file.

---

## [1.3.3] - 2025-01-18

### 🐛 Critical Fixes & Easter Egg

#### Fixed
- 🐛 **Leaderboard Error** - Fixed `score.split is not a function` error with migration system
- 🐛 **Old Score Migration** - Automatically converts old numeric scores to new string format
- 🐛 **Service Worker Path** - Fixed SW registration path for GitHub Pages deployment
- 🤖 **AI Teleport Spam** - AI now only uses teleport when far from ball AND ball is very close

#### Added
- 🎮 **New Easter Egg** - Double-click score display during game for instant win!

#### Technical
- 🔄 **Score Migration** - `getEntries()` now converts old `{ score: number }` to new `{ score: "X - Y" }` format
- 📁 **SW Paths** - Service Worker now uses `/PongPlus/` prefix for GitHub Pages
- 🎯 **AI Logic** - Teleport only when `distanceFromBall > 150` AND `ball distance < 80`

---

## [1.3.2] - 2025-01-18
- Fixed TypeScript build errors with LeaderboardEntry interface

## [1.3.1] - 2025-01-18
- Fixed reverse controls, magnet bug, active effects visibility
- AI uses Ghost Ball & Multi-Ball, faster music, win score to 10

## [1.3.0] - 2025-01-18
- PWA support, 15 abilities, 5 new easter eggs

## [1.2.1] - 2025-01-18
- Fixed arrow scrolling, magnet, multi-ball

## [1.2.0] - 2025-01-18
- Background music, 12 abilities, glassmorphism UI

## [1.1.0] - 2025-01-18
- Random ability system (8 abilities)

## [1.0.0] - 2025-01-18
- Initial release

---

**Maintained by:** [@LeanderKafemann](https://github.com/LeanderKafemann)

**Last Updated:** 2025-01-18