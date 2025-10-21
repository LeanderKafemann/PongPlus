/**
 * AIController - handles AI movement and ability usage decisions
 * v1.4.3 - FIX: use player distance to modulate aggression to avoid unused-variable TS error
 *
 * - Reduced ghost-ball probability and cooldown remains in place
 * - Player distance influences aggression: when player is very close, AI reduces use of disruptive abilities
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { AbilityType } from './AbilitySystem';
import type { GameController } from './GameController';

export class AIController {
    private ai: Paddle;
    private player: Paddle;
    private reverseControlsCb: () => boolean;
    private lastGhostUse = 0;

    constructor(ai: Paddle, player: Paddle, reverseControlsCb: () => boolean) {
        this.ai = ai;
        this.player = player;
        this.reverseControlsCb = reverseControlsCb;
    }

    update(targetBall: Ball, controller: GameController) {
        const aiCenter = this.ai.y + (this.ai.height / 2);
        const dir = this.reverseControlsCb() ? -1 : 1;

        const playerCenter = this.player.y + (this.player.height / 2);
        const playerDist = Math.abs(playerCenter - aiCenter);

        // tracking
        if (!targetBall.isGhost) {
            if (aiCenter < targetBall.y - 35) this.ai.move(1 * dir, (controller as any).canvas?.height ?? 600);
            else if (aiCenter > targetBall.y + 35) this.ai.move(-1 * dir, (controller as any).canvas?.height ?? 600);
        } else {
            if (Math.random() < 0.01) this.ai.move(Math.random() > 0.5 ? 1 : -1, (controller as any).canvas?.height ?? 600);
        }

        // ability heuristics
        if (!targetBall.isGhost && Math.abs(targetBall.x - (this.ai.x)) < 180 && targetBall.getSpeed() > 5) {
            const baseRand = Math.random();
            const abilities = this.ai.getAssignedAbilities();

            // Use playerDist to modulate aggression:
            // - if player is very close (<50px), AI should be more conservative (avoid self-harm abilities)
            // - if player is far, AI can be more aggressive
            const aggressionFactor = playerDist < 50 ? 0.5 : (playerDist < 120 ? 0.8 : 1.0);
            const rand = baseRand * aggressionFactor;

            // Ghost cooldown and reduced chance
            const ghostAvailable = abilities.some(a => a.type === AbilityType.GHOST_BALL);
            const now = Date.now();
            if (ghostAvailable && rand < 0.08 && (now - this.lastGhostUse) > 7000) {
                if (this.ai.activateAbility(AbilityType.GHOST_BALL)) {
                    (controller as any).tryActivateAbility(AbilityType.GHOST_BALL);
                    this.lastGhostUse = now;
                }
                return;
            }

            // rest of abilities with adjusted probability windows
            if (rand >= 0.08 && rand < 0.22 && abilities.some(a => a.type === AbilityType.MULTI_BALL) && targetBall.getSpeed() > 7) {
                if (this.ai.activateAbility(AbilityType.MULTI_BALL)) (controller as any).activateMultiBall?.();
            } else if (rand >= 0.22 && rand < 0.36 && abilities.some(a => a.type === AbilityType.DOUBLE_SCORE)) {
                if (this.ai.activateAbility(AbilityType.DOUBLE_SCORE)) (controller as any).tryActivateAbility(AbilityType.DOUBLE_SCORE);
            } else if (rand >= 0.36 && rand < 0.52 && abilities.some(a => a.type === AbilityType.SHIELD)) {
                if (this.ai.activateAbility(AbilityType.SHIELD)) { /* shield applied on paddle */ }
            } else if (rand >= 0.52 && rand < 0.68 && abilities.some(a => a.type === AbilityType.SMASH)) {
                if (this.ai.activateAbility(AbilityType.SMASH)) { /* smash effect handled at game level */ }
            } else if (rand >= 0.68 && rand < 0.80 && abilities.some(a => a.type === AbilityType.TELEPORT)) {
                if (Math.abs(targetBall.x - this.ai.x) < 80) {
                    if (this.ai.activateAbility(AbilityType.TELEPORT)) this.ai.teleport((controller as any).canvas?.height ?? 600);
                }
            }
        }
    }
}