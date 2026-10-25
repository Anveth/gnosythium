export const VIEW = { width: 1280, height: 720, renderScale: 2 } as const;
export const ART_SCALE = 3;
export const MAGE_ART = { width: 64, height: 80, pixelsToWorld: 0.4 } as const;

export const BALANCE = {
  gravity: 1350,
  player: {
    maxHealth: 100,
    maxEssence: 100,
    speed: 270,
    shieldSpeed: 140,
    jumpSpeed: 700,
    minimumJumpMs: 160,
    jumpReleaseSpeed: 360,
    airJumpSpeed: 620,
    airJumpCooldownMs: 2500,
    coyoteMs: 100,
    jumpBufferMs: 120,
    invulnerabilityMs: 600,
    essenceRegen: 12,
    essenceRegenDelayMs: 800,
  },
  bolt: { cost: 0, damage: 24, speed: 670, windupMs: 130, animationMs: 320, cooldownMs: 600, lifetimeMs: 1450 },
  healing: { cost: 25, health: 35, channelMs: 1050, cooldownMs: 5000 },
  airBurst: {
    cost: 18, cooldownMs: 4200, windupMs: 90, animationMs: 300, radius: 185,
    impulse: 720, airborneMultiplier: 1.15, displacementMs: 440, airborneMs: 1400,
    impactDamage: 32, impactSpeed: 260,
  },
  groundSmash: {
    cost: 24, cooldownMs: 6200, fallSpeed: 1300, recoveryMs: 240, maximumDiveMs: 1800,
    radius: 125, centerRadius: 36, heightTolerance: 65, damage: 20, centerBonus: 24,
  },
  shield: {
    drainPerSecond: 16, hitCost: 20, breakCooldownMs: 850,
    minimumHoldMs: 120, minimumRestMs: 100, raiseIntervalMs: 240,
  },
  enemy: {
    health: 96,
    speed: 76,
    chaseSpeed: 240,
    jumpSpeed: 740,
    detectionRange: 600,
    attackRange: 76,
    attackWindupMs: 320,
    comboWindupMs: 300,
    attackActiveMs: 320,
    attackRecoveryMs: 420,
    lungeSpeed: 390,
    damage: 30,
    stunMs: 160,
    staggerCooldownMs: 1100,
    jumpCooldownMs: 550,
  },
  enemyBolt: { speed: 360, damage: 18, windupMs: 650, cooldownMs: 1900, lifetimeMs: 2400, range: 600 },
} as const;

export const COLORS = {
  sky: 0x0c141c,
  stone: 0x222e35,
  stoneTop: 0x566362,
  gold: 0xc5ac76,
  magic: 0x9de5ad,
  magicLight: 0xe5ffe4,
  hostileMagic: 0xd58476,
  danger: 0xe19a80,
} as const;
