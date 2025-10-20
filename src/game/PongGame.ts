/**
 * Thin wrapper for backward compatibility.
 * PongGame now delegates to GameController (split for maintainability).
 */

import { GameController } from './GameController';

export class PongGame {
    private controller: GameController;

    constructor() {
        this.controller = new GameController();
        // start button in UI will call controller.startGame()
    }
}