# Changelog

All notable changes to PongPlus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2025-10-20

### 🛠 Major Fixes & Features

#### Added
- 🕹️ Arcade Mode — new game mode (toggle in menu). In Arcade Mode the game continues until the AI reaches 10 points. Mode is saved with leaderboard entries.
- 🏆 Leaderboard entries now include mode (standard | arcade).
- 🎁 New Easter Egg — double-click the score display during gameplay to instantly win.

#### Fixed / Improved
- 🤖 AI heuristics: smarter teleport usage, reduced multi-ball and mini-paddle spam, added conditional use of Double-Score and Ghost Ball under sensible conditions.
- 🧲 Magnet bug: magnet now only pulls balls that are in front of (and on the player's side of) the paddle; respects mini/giant paddle states.
- 👻 Ghost Ball: actually invisible now (no rendering), but still collidable.
- 📊 Leaderboard migration: robust migration logic to convert old formats (numeric score or playerScore/aiScore) into new "X - Y" string format; sort by player or AI supported.
- 📝 Increased inline JSDoc comments for main managers and game loop functions for better maintainability.
- 🧭 Service Worker paths adjusted for GitHub Pages hosting (repo root prefix).
- 🎯 HUD: power-up / effect HUD position adjusted to improve readability; effect text has outline for contrast.

#### Technical
- 🔧 Music tempo configurable in MusicManager (default faster tempo).
- 🔁 Save mode in leaderboard entries for better analytics.
- 🧩 Refactoring and minor API changes:
  - LeaderboardManager.addEntry(name, playerScore, aiScore, mode)
  - LeaderboardManager.getEntries(sortBy?: 'player' | 'ai')

---

## [1.3.3] - 2025-01-18

- Fixed leaderboard split-string migration and SW path errors
- added AI teleport spam fix
- added easter egg

## [1.3.2] - 2025-01-18

- TypeScript build fix: LeaderboardEntry schema corrected (score: string), sorting logic added.

## [1.3.1] - 2025-01-18

- Reverse controls affects AI only.
- Active effects text gets outline for readability.
- Magnet bug fixed.
- AI now can use Ghost Ball and Multi-Ball where appropriate.
- Music tempo increased.

## [1.3.0] - 2025-01-18

- PWA support, 15 abilities, many easter eggs, music & UI enhancements.

## [1.2.1] - 2025-01-18

- Various bug fixes and polish.

## [1.2.0] - 2025-01-18

- Background music & UI upgrades.

## [1.1.0] - 2025-01-18

- Random ability system added.

## [1.0.0] - 2025-01-18

- Initial release.

---

**Maintained by:** [@LeanderKafemann](https://github.com/LeanderKafemann)

**Last Updated:** 2025-10-20