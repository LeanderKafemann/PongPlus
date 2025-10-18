/**
 * PongPlus - Entry Point
 * @author LeanderKafemann
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @license MIT
 * @version 1.2.1
 */

import './style.css';
import { PongGame } from './game/PongGame';

// Display version in console with style
console.log('%c🏓 PongPlus v1.2.1', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cBy LeanderKafemann © 2025', 'color: #764ba2; font-size: 14px;');
console.log('%c🎵 Features: 12 Abilities • Background Music • Easter Eggs', 'color: #4ade80; font-size: 12px;');

// Initialize game when page loads
new PongGame();