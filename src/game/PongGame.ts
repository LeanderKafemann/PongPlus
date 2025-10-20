/**
 * Thin wrapper for backward compatibility.
 * PongGame now delegates to GameController (split for maintainability).
 *
 * - Removed unused 'controller' property; instantiate controller without storing to avoid "declared but never read".
 */

import { GameController } from './GameController';

export class PongGame {
    constructor() {
        // instantiate the game controller; no private field saved here to prevent unused-property errors
        new GameController();
    }
}