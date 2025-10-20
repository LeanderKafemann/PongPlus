/**
 * AbilitySystem - defines ability pool and selection
 * v1.4.0
 */

export enum AbilityType {
    SMASH = 'SMASH',
    SUPER_SMASH = 'SUPER_SMASH',
    SHIELD = 'SHIELD',
    SPEED_BOOST = 'SPEED_BOOST',
    TELEPORT = 'TELEPORT',
    SLOW_MOTION = 'SLOW_MOTION',
    GHOST_BALL = 'GHOST_BALL',
    GIANT_PADDLE = 'GIANT_PADDLE',
    REVERSE_CONTROLS = 'REVERSE_CONTROLS',
    MAGNET = 'MAGNET',
    DOUBLE_SCORE = 'DOUBLE_SCORE',
    FREEZE = 'FREEZE',
    MULTI_BALL = 'MULTI_BALL',
    MINI_PADDLE = 'MINI_PADDLE',
    GRAVITY = 'GRAVITY'
}

export type Ability = {
    type: AbilityType;
    name: string;
    key: string;
    color: string;
    icon: string;
};

const ABILITIES: Ability[] = [
    { type: AbilityType.SMASH, name: 'Smash', key: 'SPACE', color: '#f97316', icon: '💥' },
    { type: AbilityType.SUPER_SMASH, name: 'Super Smash', key: 'B', color: '#ef4444', icon: '💥' },
    { type: AbilityType.SHIELD, name: 'Shield', key: 'E', color: '#60a5fa', icon: '🛡️' },
    { type: AbilityType.SPEED_BOOST, name: 'Speed Boost', key: 'Q', color: '#a3e635', icon: '⚡' },
    { type: AbilityType.TELEPORT, name: 'Teleport', key: 'R', color: '#f472b6', icon: '🌀' },
    { type: AbilityType.SLOW_MOTION, name: 'Slow Motion', key: 'F', color: '#34d399', icon: '🐢' },
    { type: AbilityType.GHOST_BALL, name: 'Ghost Ball', key: 'V', color: '#94a3b8', icon: '👻' },
    { type: AbilityType.GIANT_PADDLE, name: 'Giant Paddle', key: 'G', color: '#facc15', icon: '📏' },
    { type: AbilityType.REVERSE_CONTROLS, name: 'Reverse Controls', key: 'C', color: '#fb7185', icon: '🔁' },
    { type: AbilityType.MAGNET, name: 'Magnet', key: 'M', color: '#7c3aed', icon: '🧲' },
    { type: AbilityType.DOUBLE_SCORE, name: 'Double Score', key: 'D', color: '#06b6d4', icon: '💎' },
    { type: AbilityType.FREEZE, name: 'Freeze', key: 'X', color: '#60a5fa', icon: '❄️' },
    { type: AbilityType.MULTI_BALL, name: 'Multi-Ball', key: 'T', color: '#f59e0b', icon: '🟡' },
    { type: AbilityType.MINI_PADDLE, name: 'Mini Paddle', key: 'N', color: '#a78bfa', icon: '🔻' },
    { type: AbilityType.GRAVITY, name: 'Gravity', key: 'Y', color: '#06b6d4', icon: '🌍' }
];

export class AbilitySystem {
    selectRandomAbilities(count = 3): Ability[] {
        const pool = [...ABILITIES];
        const out: Ability[] = [];
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            out.push(pool.splice(idx, 1)[0]);
        }
        return out;
    }
}