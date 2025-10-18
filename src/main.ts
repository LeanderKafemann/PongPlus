/**
 * PongPlus - Entry Point
 * @author LeanderKafemann
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @license MIT
 * @version 1.1.0
 */

import './style.css';
import { PongGame } from './game/PongGame';

// Display version in console
console.log('%c🏓 PongPlus v1.1.0', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cBy LeanderKafemann © 2025', 'color: #764ba2; font-size: 12px;');

// Initialize game when page loads
new PongGame();