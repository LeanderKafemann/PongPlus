/**
 * AbilitySystem - Manages random ability selection
 * @copyright 2025 LeanderKafemann. All rights reserved.
 * @version 1.3.0
 */

export enum AbilityType {
  SMASH = 'smash',
  SHIELD = 'shield',
  SPEED_BOOST = 'speedBoost',
  TELEPORT = 'teleport',
  SLOW_MOTION = 'slowMotion',
  MULTI_BALL = 'multiBall',
  GIANT_PADDLE = 'giantPaddle',
  GHOST_BALL = 'ghostBall',
  REVERSE_CONTROLS = 'reverseControls',
  MAGNET = 'magnet',
  DOUBLE_SCORE = 'doubleScore',
  FREEZE = 'freeze',
  MINI_PADDLE = 'miniPaddle',
  GRAVITY = 'gravity',
  SUPER_SMASH = 'superSmash'
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
  },
  {
    type: AbilityType.REVERSE_CONTROLS,
    name: 'Reverse Controls',
    description: 'Opponent controls reversed 3s',
    icon: '🔄',
    color: '#ec4899',
    key: 'C',
    cooldownMax: 540,
    duration: 180
  },
  {
    type: AbilityType.MAGNET,
    name: 'Magnet',
    description: 'Ball attracted to paddle 2s',
    icon: '🧲',
    color: '#8b5cf6',
    key: 'M',
    cooldownMax: 450,
    duration: 120
  },
  {
    type: AbilityType.DOUBLE_SCORE,
    name: 'Double Score',
    description: 'Next point counts double',
    icon: '💎',
    color: '#06b6d4',
    key: 'D',
    cooldownMax: 600
  },
  {
    type: AbilityType.FREEZE,
    name: 'Freeze',
    description: 'Freeze opponent for 1.5s',
    icon: '❄️',
    color: '#60a5fa',
    key: 'X',
    cooldownMax: 480,
    duration: 90
  },
  {
    type: AbilityType.MINI_PADDLE,
    name: 'Mini Paddle',
    description: 'Opponent paddle -50% for 3s',
    icon: '🔻',
    color: '#fb923c',
    key: 'N',
    cooldownMax: 450,
    duration: 180
  },
  {
    type: AbilityType.GRAVITY,
    name: 'Gravity',
    description: 'Ball curves downward for 2s',
    icon: '🌍',
    color: '#22d3ee',
    key: 'Y',
    cooldownMax: 540,
    duration: 120
  },
  {
    type: AbilityType.SUPER_SMASH,
    name: 'Super Smash',
    description: '+100% ball speed!',
    icon: '💥',
    color: '#dc2626',
    key: 'B',
    cooldownMax: 900
  }
];

export class AbilitySystem {
  private selectedAbilities: Ability[] = [];

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