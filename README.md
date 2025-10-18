# 🏓 PongPlus

<div align="center">

![PongPlus Banner](https://img.shields.io/badge/PongPlus-v1.3.1-blueviolet?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Play-Now-success?style=for-the-badge&logo=github)](https://leanderkafemann.github.io/PongPlus/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Installable-blue?style=for-the-badge&logo=pwa)](https://leanderkafemann.github.io/PongPlus/)

**A modern, installable Progressive Web App (PWA) - TypeScript Pong game**

*With 15 random abilities, stunning visual effects, background music, and 13+ hidden easter eggs*

[🎮 Play Now](https://leanderkafemann.github.io/PongPlus/) • [📱 Install as App](https://leanderkafemann.github.io/PongPlus/) • [📖 Tutorial](docs/index.html) • [🐛 Report Bug](https://github.com/LeanderKafemann/PongPlus/issues) • [💡 Request Feature](https://github.com/LeanderKafemann/PongPlus/issues)
</div>

---

## 🌟 What Makes PongPlus Special?

PongPlus is a **Progressive Web App** - install it on any device and play offline! It's a complete reimagination of classic Pong with modern game mechanics:

- 📱 **Progressive Web App** - Install on mobile or desktop, play offline
- 🎲 **15 Random Abilities** - Each game features 3 random abilities from a pool of 15
- 🤖 **Smart AI Opponent** - Adaptive difficulty with strategic ability usage
- 🎨 **Stunning Visual Effects** - Motion trails, glows, and dynamic animations
- 🔊 **Procedural Audio** - Real-time sound generation via Web Audio API
- 🎵 **Background Music** - Soothing pentatonic melody during gameplay
- 📊 **Live Statistics** - Real-time speed tracking and visual feedback
- 🏆 **Persistent Leaderboard** - Your high scores, saved forever
- 🎮 **Hidden Easter Eggs** - 13+ secret codes and combinations to discover

### 📱 Progressive Web App (NEW!)

<table>
<tr>
<td width="50%">

#### Installable
- **One-Click Install** on any device
- **Offline Play** - Works without internet
- **Native Feel** - Runs like a desktop app
- **Auto Updates** - Always the latest version

</td>
<td width="50%">

#### Cross-Platform
- 🖥️ **Desktop** - Windows, Mac, Linux
- 📱 **Mobile** - iOS, Android
- 🌐 **Web** - Any modern browser
- 💾 **Local Storage** - Saves all progress

</td>
</tr>
</table>

---

## ✨ Features

### 🎯 Core Gameplay

<table>
<tr>
<td width="50%">

#### Classic Mechanics Enhanced
- **Smooth 60 FPS** rendering
- **Realistic physics** with acceleration
- **Spin mechanics** based on paddle contact
- **AI opponent** with human-like reactions
- **5-point match** system

</td>
<td width="50%">

#### Modern Additions
- **3-2-1 Countdown** before each match
- **Speed limiter** prevents ball tunneling
- **Circular collision** detection
- **Pause/Resume** functionality
- **Multiple game states**

</td>
</tr>
</table>

### 🎲 Random Ability System

Each game randomly selects **3 abilities** from this pool:

| Icon | Ability | Key | Effect | Cooldown |
|------|---------|-----|--------|----------|
| 🔴 | **Smash** | SPACE | +50% ball speed instantly | 2s |
| 🔵 | **Shield** | E | 1.5s complete ball immunity | 5s |
| ⚡ | **Speed Boost** | Q | +80% paddle speed for 2s | 4s |
| 🟣 | **Teleport** | R | Instant center repositioning | 8s |
| 🟢 | **Slow Motion** | F | 50% ball speed for 2s | 10s |
| 🟡 | **Multi-Ball** | T | Split ball into 3 for 3s | 12s |
| 🟠 | **Giant Paddle** | G | +50% paddle size for 4s | 8s |
| ⚪ | **Ghost Ball** | V | Ball invisible for 1.5s | 7s |
| 🔄 | **Reverse Controls** | C | Opponent controls reversed 3s | 9s |
| 🧲 | **Magnet** | M | Ball attracted to paddle 2s | 7.5s |
| 💎 | **Double Score** | D | Next point counts double | 10s |
| ❄️ | **Freeze** | X | Freeze opponent for 1.5s | 8s |
| 🔻 | **Mini Paddle** | N | Opponent paddle -50% for 3s | 7.5s |
| 🌍 | **Gravity** | Y | Ball curves downward for 2s | 9s |
| 💥 | **Super Smash** | B | +100% ball speed! | 15s |

**Strategy Changes Every Game!** 🎯

### 🎨 Visual Effects

<table>
<tr>
<td width="33%">

#### Ball Effects
- **8-position trail** animation
- **Speed-based glow** (red at high speed)
- **Multi-colored** balls (Multi-Ball)
- **Transparency** effects (Ghost Ball)
- **Gravity curve** visualization

</td>
<td width="33%">

#### Paddle Effects
- **Rounded corners** for modern look
- **Color coding** by active ability
- **Shield glow** (blue aura)
- **Size morphing** (Giant/Mini Paddle)
- **Freeze crystals** (ice effect)

</td>
<td width="33%">

#### UI Elements
- **Gradient speedometer**
- **Multi-bar cooldown indicators**
- **Countdown overlay**
- **Ability name display**
- **Active effects HUD**

</td>
</tr>
</table>

### 🔊 Audio System

Powered by **Web Audio API** with procedural generation.<br/>

Toggle sound on/off anytime during gameplay.

### 🏆 Leaderboard System

- **Top 10 scores** saved locally (localStorage)
- **Player names** with timestamps
- **Persistent** across browser sessions
- **Clear all** option available

---

## 🎮 Controls

### 🕹️ Movement

<li>W / ↑ → Move paddle UP<br/>
<li>S / ↓ → Move paddle DOWN

### ⚡ Abilities (Random 3 per game)

<li>SPACE → Primary Ability (varies)<br/>
<li>E → Secondary Ability (varies)<br/>
<li>Q → Tertiary Ability (varies)

*Additional keys: R, F, T, G, V, C, M, D, X, N, Y, B depending on abilities*

### 🎛️ Game Controls

<li>Pause Button → Pause/Resume game<br/>
<li>ESC → Return to menu<br/>
<li>Sound Toggle → Toggle audio on/off

---

## 🚀 Quick Start

### 🌐 Play Online (Recommended)

**[Click here to play instantly!](https://leanderkafemann.github.io/PongPlus/)**

No installation required—runs in any modern browser.

### 💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/LeanderKafemann/PongPlus.git
cd PongPlus

# 2. Install dependencies
npm install

# 3. Start development server (with hot reload)
npm run dev
# → Opens at http://localhost:5173

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

### 📋 System Requirements

<li>Node.js 18.0.0 or higher<br/>
<li>npm 9.0.0 or higher<br/>
<li>Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### 📁 Project Structure

see [Project Structure](docs/structure.struct) for detailed overview.

<table> <tr> <td align="center" width="20%"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript"/> <br><strong>TypeScript 5.0</strong> <br><sub>Type-safe development</sub> </td> <td align="center" width="20%"> <img src="https://vitejs.dev/logo.svg" width="48" height="48" alt="Vite"/> <br><strong>Vite</strong> <br><sub>Lightning-fast builds</sub> </td> <td align="center" width="20%"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="48" height="48" alt="HTML5"/> <br><strong>HTML5 Canvas</strong> <br><sub>2D rendering</sub> </td> <td align="center" width="20%"> <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Web_Audio_API_logo.png" width="48" height="48" alt="Web Audio"/> <br><strong>Web Audio API</strong> <br><sub>Sound generation</sub> </td> <td align="center" width="20%"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="48" height="48" alt="GitHub"/> <br><strong>GitHub Actions</strong> <br><sub>CI/CD automation</sub> </td> </tr> </table>

Additional Technologies:

<li>🎨 CSS3 - Modern styling with gradients & animations<br/>
<li>💾 LocalStorage API - Client-side data persistence<br/>
<li>🚀 GitHub Pages - Free hosting & automatic deployment<br/>
<li>📦 ES Modules - Modern JavaScript module system<br/>

## 🎯 Game Mechanics Deep Dive
### ⚽ Ball Physics

<li>Initial Speed:   4 units/frame<br/>
<li>Acceleration:    +5% per paddle hit<br/>
<li>Maximum Speed:   12 units/frame (anti-tunneling)<br/>
<li>Smash Boost:     +50% instant<br/>
<li>Trail Length:    8 position history

### Spin System

Hit position on paddle affects ball angle

<li>Top third → Upward angle<br/>
<li>Middle → Straight<br/>
<li>Bottom third → Downward angle

### 🏓 Paddle Mechanics

<li>Base Speed:       6 units/frame<br/>
<li>Speed Boost:      +80% (10.8 units/frame)<br/>
<li>Giant Paddle:     +50% size (150px height)<br/>
<li>Shield Duration:  1.5 seconds<br/>
<li>Teleport:         Instant center snap

### 🤖 AI Behavior

The AI adapts to ball speed and position:
```Python

if ball_distance < 100 and ball_speed > 6:
    use_random_ability(30% chance)
    
if predicted_miss:
    use_teleport_if_available()
    
if ball_very_fast:
    use_shield_if_available(40% chance)
```

Difficulty Balance:<br/>
AI intentionally has slight delay (~35px) for fair gameplay.

---
## 📊 Version History

See CHANGELOG.md for detailed version history.

## 🤝 Contributing

Contributions are welcome! Here's how:

### 🐛 Report Bugs

Found a bug? Open an issue with:

<li>Description of the bug<br/>
<li>Steps to reproduce<br/>
<li>Expected vs actual behavior<br/>
<li>Screenshots if applicable

### 💡 Suggest Features

Have an idea? Open an issue with:

<li>Feature description<br/>
<li>Use case / Why it's useful<br/>
<li>Mockups if you have them

### 🔨 Submit Code

    Fork the repository
    Create branch: git checkout -b feature/AmazingFeature
    Make changes and test thoroughly
    Commit: git commit -m '✨ Add AmazingFeature'
    Push: git push origin feature/AmazingFeature
    Open Pull Request with clear description

Code Standards:

    ✅ TypeScript strict mode
    ✅ JSDoc comments
    ✅ Consistent formatting
    ✅ Test your changes

## 📝 License

This project is licensed under the MIT License.<br/>
See LICENSE file for details.

## 👤 Author
<div align="center">

LeanderKafemann

![GitHub](https://img.shields.io/badge/GitHub-LeanderKafemann-black?style=for-the-badge&logo=github) ![Portfolio](https://img.shields.io/badge/Portfolio-View-blue?style=for-the-badge&logo=githubpages)

Passionate about game development, TypeScript, and creating engaging user experiences
</div>

## 🙏 Acknowledgments

<li>🎮 Atari Pong (1972) - The original inspiration<br/>
<li>🎨 Modern Web Standards - Enabling rich browser experiences<br/>
<li>🌐 Open Source Community - For tools and inspiration<br/>
<li>💻 TypeScript Team - For excellent type safety<br/>
<li>⚡ Vite Team - For blazing-fast development

<div align="center">

⭐ Star this repo if you enjoy the game! ⭐

Made with ❤️ and TypeScript

© 2025 LeanderKafemann. All rights reserved.

v1.3.1

</div> 