/**
 * AIController - handles AI movement and ability usage decisions
 * v1.4.2
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { AbilityType } from './AbilitySystem';
import type { GameController } from './GameController';

export class AIController {
    private ai: Paddle;
    private player: Paddle;
    private reverseControlsCb: () => boolean;

    constructor(ai: Paddle, player: Paddle, reverseControlsCb: () => boolean) {
        this.ai = ai;
        this.player = player;
        this.reverseControlsCb = reverseControlsCb;
    }

    update(targetBall: Ball, controller: GameController) {
        const aiCenter = this.ai.y + (this.ai.height / 2);
        const dir = this.reverseControlsCb() ? -1 : 1;

        // simple tracking
        if (!targetBall.isGhost) {
            if (aiCenter < targetBall.y - 35) this.ai.move(1 * dir, (controller as any).canvas?.height ?? 600);
            else if (aiCenter > targetBall.y + 35) this.ai.move(-1 * dir, (controller as any).canvas?.height ?? 600);
        } else {
            if (Math.random() < 0.02) this.ai.move(Math.random() > 0.5 ? 1 : -1, (controller as any).canvas?.height ?? 600);
        }

        // ability heuristics
        if (!targetBall.isGhost && Math.abs(targetBall.x - (this.ai.x)) < 180 && targetBall.getSpeed() > 5) {
            const rand = Math.random();
            const abilities = this.ai.getAssignedAbilities();

            if (rand < 0.15 && abilities.some(a => a.type === AbilityType.GHOST_BALL)) {
                if (this.ai.activateAbility(AbilityType.GHOST_BALL)) {
                    // notify controller to enact ghost globally
                    (controller as any).tryActivateAbility(AbilityType.GHOST_BALL);
                }
            } else if (rand >= 0.15 && rand < 0.3 && abilities.some(a => a.type === AbilityType.MULTI_BALL)) {
                if (this.ai.activateAbility(AbilityType.MULTI_BALL)) (controller as any).activateMultiBall();
            } else if (rand >= 0.3 && rand < 0.45 && abilities.some(a => a.type === AbilityType.DOUBLE_SCORE)) {
                if (this.ai.activateAbility(AbilityType.DOUBLE_SCORE)) (controller as any).tryActivateAbility(AbilityType.DOUBLE_SCORE);
            } else if (rand >= 0.45 && rand < 0.6 && abilities.some(a => a.type === AbilityType.TELEPORT)) {
                if (Math.abs(targetBall.x - this.ai.x) < 80) {
                    if (this.ai.activateAbility(AbilityType.TELEPORT)) this.ai.teleport((controller as any).canvas?.height ?? 600);
                }
            } else if (rand >= 0.6 && rand < 0.75 && abilities.some(a => a.type === AbilityType.SHIELD)) {
                if (this.ai.activateAbility(AbilityType.SHIELD)) {
                    // shield applied on paddle itself
                }
            }
        }
    }
}