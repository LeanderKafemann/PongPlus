# Changelog

All notable changes to PongPlus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2025-01-18

### 📱 PWA Support & More Content

#### Added - PWA
- 📱 **Progressive Web App** - Full PWA support with offline capability
- 📦 **Service Worker** - Caches all assets for offline play
- 🔧 **Manifest.json** - Installable on mobile and desktop
- 📲 **Install Button** - In-game prompt to install app
- 🎨 **PWA Icons** - 8 icon sizes (72px to 512px)

#### Added - 15 Abilities (3 new)
- 🔻 **Mini Paddle (N)** - Opponent paddle -50% for 3s, 7.5s cooldown
- 🌍 **Gravity (Y)** - Ball curves downward for 2s, 9s cooldown
- 💥 **Super Smash (B)** - +100% ball speed!, 15s cooldown

#### Added - 5 New Easter Eggs
- 💚 **Type "matrix"** - Matrix mode with green text for 15s
- 👑 **Type "god"** - God mode: huge paddle + speed for 10s
- 🎯 **Click Canvas 20x** - AI confusion mode
- ⏸️ **Pause 15 times** - All cooldowns -50% next game
- 🎲 **Random combinations** - Stack multiple easter eggs!

#### Enhanced
- 🎵 **2x Faster Music** - Tempo increased from 500ms to 250ms per note
- 🎨 **Button Hover Effects** - Ripple animation on all buttons
- 🎯 **AI Ghost Ball Fix** - AI can't track invisible balls anymore
- 📜 **Scrollbar Styling** - Custom styled scrollbar with gradient
- 🖱️ **Menu Hover** - Menu box has hover animation
- 📊 **Footer Polish** - No more overlapping on hover

#### Fixed
- 🐛 **Arrow Key Scrolling** - Uses scrollbar instead of arrow keys
- 🐛 **Footer Overlap** - Fixed z-index and transform issues
- 🐛 **Game Visibility** - Bottom of game always visible
- 🐛 **AI Ghost Tracking** - AI now confused when ball is ghost

#### Technical
- 📦 **vite-plugin-pwa** - Added to dependencies
- 🔧 **Service Worker** - Full offline caching
- 📱 **Install Prompt** - beforeinstallprompt event handling
- 🎯 **Body Scroll Control** - `.game-active` class management

---

## [1.2.1] - 2025-01-18

### 🐛 Bug Fixes & Polish

#### Fixed
- 🐛 **Arrow Key Scrolling** - Prevented page scrolling during gameplay
- 🐛 **Magnet Effect** - Distance-based force calculation
- 🐛 **Multi-Ball** - Proper ball cloning with colors
- 🐛 **Multi-Ball Colors** - Yellow, green, blue distinction

#### Enhanced
- 🎨 **Footer Hover Effects** - Smooth scale and glow
- 🎨 **Author Name Animation** - Gradient shift
- 🧹 **Hidden Easter Eggs** - Removed all hints

#### Changed
- 📅 **Timestamp Format** - YYYY-MM-DD only (no time)
- 🎮 **Game Active State** - Body class for scroll prevention
- 🧲 **Magnet Physics** - Distance falloff formula

---

## [1.2.0] - 2025-01-18

### 🎵 Music, Easter Eggs & Enhanced UI

#### Added
- ✅ **12 Unique Abilities** - Expanded from 8 to 12
- 🎵 **Background Music** - Pentatonic melody
- 🎮 **Arrow Key Support** - ↑↓ in addition to W/S
- 🎨 **Glassmorphism UI** - Modern blur effects
- 🎯 **8 Easter Eggs** - Hidden secrets

---

## [1.1.0] - 2025-01-18

### 🎲 Random Ability System

#### Added
- ✅ **8 Unique Abilities** - Random selection system
- 🎨 **Ability Display** - Shows selected at start

---

## [1.0.0] - 2025-01-18

### 🎉 Initial Release

#### Added
- ✅ Core Pong gameplay
- ✅ Player vs AI
- ✅ 3 fixed abilities

---

**Maintained by:** [@LeanderKafemann](https://github.com/LeanderKafemann)

**Last Updated:** 2025-01-18