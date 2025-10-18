# Changelog

All notable changes to PongPlus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.1] - 2025-01-18

### 🐛 Bug Fixes & Polish

#### Fixed
- 🐛 **Arrow Key Scrolling** - Prevented arrow keys from scrolling page during gameplay
- 🐛 **Magnet Effect** - Fixed magnet pulling balls too aggressively, now distance-based
- 🐛 **Multi-Ball** - Fixed multi-ball not working correctly, now properly clones balls
- 🐛 **Multi-Ball Colors** - Each multi-ball now has distinct color (yellow, green, blue)

#### Enhanced
- 🎨 **Footer Hover Effects** - Added smooth scale, glow, and animation to footer
- 🎨 **Author Name Animation** - Gradient shift animation on author name
- 🎨 **Improved Transitions** - All hover effects now smoother (0.4s ease)
- 🧹 **Removed Easter Egg Hints** - Easter eggs are now truly hidden

#### Changed
- 📅 **Timestamp Format** - Removed exact time from "Last Updated" (now YYYY-MM-DD only)
- 🎮 **Game Active State** - Body gets `.game-active` class to prevent scrolling
- 🧲 **Magnet Physics** - Now only affects balls on player's side with distance falloff

#### Technical
- 📦 **Ball Cloning** - Improved multi-ball angle calculation using proper trigonometry
- 🎯 **Magnet Force** - Distance-based force calculation: `force = 0.02 * (1 - distance/200)`
- 🔒 **Scroll Lock** - CSS `overflow: hidden` when game is active

---

## [1.2.0] - 2025-01-18

### 🎵 Music, Easter Eggs & Enhanced UI

#### Added
- ✅ **12 Unique Abilities** - Expanded from 8 to 12 different abilities
- ✅ **New Abilities:**
  - 🔄 **Reverse Controls (C)** - Opponent controls reversed for 3s, 9s cooldown
  - 🧲 **Magnet (M)** - Ball attracted to paddle for 2s, 7.5s cooldown
  - 💎 **Double Score (D)** - Next point counts double, 10s cooldown
  - ❄️ **Freeze (X)** - Freeze opponent for 1.5s, 8s cooldown

#### Enhanced
- 🎵 **Background Music System** - Procedural pentatonic melody
- 🎮 **Arrow Key Support** - Move with ↑↓ in addition to W/S
- 🎨 **Glassmorphism UI** - Modern blur, shadow, and opacity effects
- 🎯 **Active Effect Display** - Shows all active abilities on screen
- 🧊 **Visual Effect Overlays** - Color tints for each active ability
- ❄️ **Freeze Animation** - Ice crystals on frozen paddle

#### Easter Eggs
- 🎮 **Konami Code** - ↑↑↓↓←→←→BA for rainbow mode
- 🎯 **Secret Click** - Click title 10 times for ultra speed mode
- 🎵 **Music Toggle** - Floating music button (top-right)
- 🏓 **Type "pong"** - Increases ball size
- 🪩 **Type "disco"** - Activates disco mode with mirror ball
- ⚡ **Type "speed"** - Doubles maximum ball speed
- 👻 **Click Footer 7 times** - Reveals disco secret
- 👨‍💻 **Click Author 3 times** - Reveals type secrets

#### UI/UX Improvements
- 💎 **Rounded Elements** - All tables and containers have rounded corners
- ✨ **Backdrop Blur** - Glassmorphism effect on all UI elements
- 🌈 **Smooth Shadows** - Layered shadows for depth
- 🎨 **Hover Animations** - Interactive feedback on all buttons
- 📱 **Responsive Design** - Better mobile support

#### Technical
- 📦 **New Module:** `MusicManager.ts` - Background music system
- 🎯 **Effect System** - Centralized visual effect management
- 🧩 **Improved Collision** - Better magnet and freeze interactions
- 📝 **Enhanced Comments** - More JSDoc documentation

---

## [1.1.0] - 2025-01-18

### 🎲 Random Ability System

#### Added
- ✅ **8 Unique Abilities** - Expanded from 3 to 8 different abilities
- ✅ **Random Selection System** - Each game randomly selects 3 abilities
- ✅ **New Abilities:**
  - 🟣 **Teleport (R)** - Instant center repositioning, 8s cooldown
  - 🟢 **Slow Motion (F)** - 50% ball speed for 2s, 10s cooldown
  - 🟡 **Multi-Ball (T)** - Split ball into 3 for 3s, 12s cooldown
  - 🟠 **Giant Paddle (G)** - +50% paddle size for 4s, 8s cooldown
  - ⚪ **Ghost Ball (V)** - Ball invisible for 1.5s, 7s cooldown

#### Enhanced
- 🎨 **Ability Display** - Shows selected abilities at game start
- 🎯 **Dynamic Key Bindings** - Keys adapt to selected abilities
- 🤖 **AI Ability Usage** - AI can now use all random abilities strategically
- 📊 **Visual Feedback** - Each ability has unique color and icon
- 🔊 **New Sound Effects** - Added sounds for all new abilities

#### Improved
- 📖 **Massively Enhanced README** - Professional badges, better structure
- 🎨 **Better Documentation** - More examples, clearer explanations
- 📊 **Version Display** - Version shown in title, footer, and console
- 🎮 **Gameplay Variety** - No two games are the same!

#### Technical
- 📦 **New Module:** `AbilitySystem.ts` - Manages random ability selection
- 🎯 **Type Safety** - Full TypeScript support for all abilities
- 🧩 **Modular Design** - Easy to add more abilities in the future

---

## [1.0.0] - 2025-01-18

### 🎉 Initial Release

#### Added
- ✅ Core Pong gameplay mechanics
- ✅ Player vs AI mode
- ✅ HTML5 Canvas rendering with 60 FPS
- ✅ TypeScript with strict mode
- ✅ Vite build system for fast development

#### Features
- 🎮 **Smooth Physics Engine**
  - Ball physics with speed acceleration
  - Collision detection with circular precision
  - Spin mechanics based on paddle hit position
  - Speed limiting to prevent tunneling

- 🎯 **Special Abilities System** (3 fixed)
  - Smash (SPACE): 50% speed boost, 2s cooldown
  - Shield (E): 1.5s invincibility, 5s cooldown
  - Speed Boost (Q): 80% faster movement, 4s cooldown
  - Visual cooldown indicators below paddles

- 🤖 **Intelligent AI Opponent**
  - Adaptive ball tracking
  - Strategic ability usage
  - Balanced difficulty

- 🎨 **Visual Effects**
  - Ball motion trail with 8-position history
  - Speed-based glow effect (activates at >1.5x speed)
  - Rounded paddles with smooth edges
  - Animated countdown: 3-2-1
  - Real-time speedometer with color gradient

- 🔊 **Sound System**
  - Web Audio API sound generation
  - Dynamic sound effects
  - Toggle sound on/off

- 🏆 **Leaderboard System**
  - Persistent localStorage
  - Top 10 scores
  - Player names with date stamps
  - Clear leaderboard option

- 🎮 **UI/UX**
  - Responsive design
  - Pause/Resume functionality
  - Game state management
  - Smooth screen transitions
  - Controls overlay

#### Technical
- 📦 **Modular Architecture**
  - Separated concerns: Game, Ball, Paddle, Managers
  - TypeScript interfaces for type safety
  - Clean code structure

- 🚀 **Deployment**
  - GitHub Actions CI/CD pipeline
  - Automatic deployment to GitHub Pages
  - Optimized production builds

- 📝 **Documentation**
  - Comprehensive README
  - JSDoc comments throughout codebase
  - Tutorial documentation
  - Changelog

#### Bug Fixes
- 🐛 Fixed ball tunneling through paddles at high speeds
- 🐛 Fixed game continuing after game over when navigating to leaderboard
- 🐛 Fixed TypeScript compilation errors with HTMLTableSectionElement
- 🐛 Prevented multiple collisions per paddle hit

---

## [Unreleased]

### Planned Features
- 🎯 Multiplayer mode (local)
- 🌐 Online multiplayer support
- 🎨 Customizable themes & color schemes
- 🏅 Achievements system
- 📱 Mobile touch controls
- 💾 Cloud save synchronization
- 🌍 Multiple languages support
- 🎲 Even more abilities (15+ total)
- 🏆 Tournaments and leagues
- 🎬 Replay system

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backwards compatible)
- **PATCH** version: Bug fixes (backwards compatible)

Format: `MAJOR.MINOR.PATCH` (e.g., 1.2.1)

---

**Maintained by:** [@LeanderKafemann](https://github.com/LeanderKafemann)

**Last Updated:** 2025-01-18