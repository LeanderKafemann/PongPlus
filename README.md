# 🏓 PongPlus

A modern TypeScript implementation of the classic Pong game with advanced features, abilities, and stunning visual effects.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/LeanderKafemann/PongPlus)

## 🎮 [Play Now](https://leanderkafemann.github.io/PongPlus/)

---

## ✨ Features

### Core Gameplay
- 🎯 **Classic Pong Mechanics** - Smooth paddle and ball physics
- 🤖 **Smart AI Opponent** - Challenging AI with ability usage
- 🏆 **Persistent Leaderboard** - Top 10 scores saved locally
- 🔊 **Dynamic Sound Effects** - Generated audio using Web Audio API
- 📊 **Real-time Speed Display** - Visual speedometer with color gradients

### Special Abilities
| Ability | Key | Cooldown | Duration | Effect |
|---------|-----|----------|----------|--------|
| 🔴 **Smash** | SPACE | 2s | Instant | Increases ball speed by 50% |
| 🔵 **Shield** | E | 5s | 1.5s | Blocks ball completely |
| ⚡ **Speed Boost** | Q | 4s | 2s | Increases paddle speed by 80% |

### Visual Effects
- 🌈 **Ball Trail Animation** - Motion blur that intensifies with speed
- 💥 **Speed-based Glow** - Red glow effect at high velocities
- 🎨 **Rounded Paddles** - Smooth, modern paddle design
- 📊 **Cooldown Indicators** - Visual cooldown bars below paddles
- ⏱️ **3-2-1 Countdown** - Animated countdown before game start

---

## 🎮 Controls

### Movement
- **W** - Move paddle up
- **S** - Move paddle down

### Abilities
- **SPACE** - Smash (red)
- **E** - Shield (blue)
- **Q** - Speed Boost (yellow)

### Game Controls
- **Pause Button** - Pause/Resume game
- **ESC** - Return to menu (during pause)

---

## 🚀 Quick Start

### Play Online
Visit [https://leanderkafemann.github.io/PongPlus/](https://leanderkafemann.github.io/PongPlus/)

### Local Development

```bash
# Clone the repository
git clone https://github.com/LeanderKafemann/PongPlus.git
cd PongPlus

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview