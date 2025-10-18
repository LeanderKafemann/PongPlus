/**
 * PongPlus - Entry Point
 * @author LeanderKafemann
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @license MIT
 * @version 1.3.1
 */

import './style.css';
import { PongGame } from './game/PongGame';

// Display version in console
console.log('%c🏓 PongPlus v1.3.1 PWA', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cBy LeanderKafemann © 2025', 'color: #764ba2; font-size: 14px;');
console.log('%c📱 Installable • 🎵 Music • 15 Abilities • 🎮 Easter Eggs', 'color: #4ade80; font-size: 12px;');

// Initialize game
new PongGame();