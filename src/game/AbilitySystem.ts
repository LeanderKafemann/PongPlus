/**
 * AbilitySystem - Manages random ability selection
 * @copyright 2025 LeanderKafemann. All rights reserved.
 */

export enum AbilityType {
  SMASH = 'smash',
  SHIELD = 'shield',
  SPEED_BOOST = 'speedBoost',
  TELEPORT = 'teleport',
  SLOW_MOTION = 'slowMotion',
  MULTI_BALL = 'multiBall',
  GIANT_PADDLE = 'giantPaddle',
  GHOST_BALL = 'ghostBall'
}

export interface Ability {
  type: AbilityType;
  name: string;
  description: string;
  icon: string;
  color: string;
  key: string;
  cooldownMax: number;
  duration?: number;
}

export const ALL_ABILITIES: Ability[] = [
  {
    type: AbilityType.SMASH,
    name: 'Smash',
    description: '+50% ball speed instantly',
    icon: '🔴',
    color: '#ff6b6b',
    key: 'SPACE',
    cooldownMax: 120
  },
  {
    type: AbilityType.SHIELD,
    name: 'Shield',
    description: '1.5s complete immunity',
    icon: '🔵',
    color: '#64c8ff',
    key: 'E',
    cooldownMax: 300,
    duration: 90
  },
  {
    type: AbilityType.SPEED_BOOST,
    name: 'Speed Boost',
    description: '+80% paddle speed for 2s',
    icon: '⚡',
    color: '#ffeb3b',
    key: 'Q',
    cooldownMax: 240,
    duration: 120
  },
  {
    type: AbilityType.TELEPORT,
    name: 'Teleport',
    description: 'Instant center position',
    icon: '🟣',
    color: '#a855f7',
    key: 'R',
    cooldownMax: 480
  },
  {
    type: AbilityType.SLOW_MOTION,
    name: 'Slow Motion',
    description: '50% ball speed for 2s',
    icon: '🟢',
    color: '#4ade80',
    key: 'F',
    cooldownMax: 600,
    duration: 120
  },
  {
    type: AbilityType.MULTI_BALL,
    name: 'Multi-Ball',
    description: 'Split into 3 balls for 3s',
    icon: '🟡',
    color: '#fbbf24',
    key: 'T',
    cooldownMax: 720,
    duration: 180
  },
  {
    type: AbilityType.GIANT_PADDLE,
    name: 'Giant Paddle',
    description: '+50% paddle size for 4s',
    icon: '🟠',
    color: '#f97316',
    key: 'G',
    cooldownMax: 480,
    duration: 240
  },
  {
    type: AbilityType.GHOST_BALL,
    name: 'Ghost Ball',
    description: 'Ball invisible for 1.5s',
    icon: '⚪',
    color: '#d1d5db',
    key: 'V',
    cooldownMax: 420,
    duration: 90
  }
];

export class AbilitySystem {
  private selectedAbilities: Ability[] = [];

  /**
   * Randomly selects 3 unique abilities for the game
   */
  selectRandomAbilities(): Ability[] {
    const shuffled = [...ALL_ABILITIES].sort(() => Math.random() - 0.5);
    this.selectedAbilities = shuffled.slice(0, 3);
    return this.selectedAbilities;
  }

  getSelectedAbilities(): Ability[] {
    return this.selectedAbilities;
  }

  getAbilityByType(type: AbilityType): Ability | undefined {
    return this.selectedAbilities.find(a => a.type === type);
  }
}