/**
 * Vaporwave 2D Action Platformer Game Types & Interfaces
 */

export type FormType = 'DEFAULT' | 'FLIGHT' | 'INVINCIBLE' | 'HEAVY_PLASMA' | 'SPREAD';

export type BiomeType = 'city' | 'sky' | 'underwater' | 'underground' | 'matrix';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  lives: number;
  energy: number; // 0 to 100 for Super Nova
  score: number;
  combo: number;
  comboTimer: number;
  form: FormType;
  formTimeLeft: number; // in seconds
  formDuration: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  isGrounded: boolean;
  facing: 1 | -1; // 1 = right, -1 = left
  aimDirection: Vector2D; // normalized aim vector (8-way: 0, 45, 90, 135, etc.)
  isCrouching: boolean;
  isDashing: boolean;
  dashCooldown: number;
  dashDuration: number;
  invincibleTimer: number; // i-frames after hit or when in invincible form
  jumpCount: number;
  maxJumps: number;
  stats: PlayerStats;
  trail: { x: number; y: number; alpha: number; form: FormType; facing: number }[];
  shootCooldown: number;
  flightFuel: number; // for Flight form
  animationFrame: number;
  state: 'idle' | 'run' | 'jump' | 'fall' | 'crouch' | 'dash' | 'flight' | 'hurt';
}

export type ProjectileOwner = 'player' | 'enemy' | 'boss';

export interface Projectile extends Rect {
  id: string;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  owner: ProjectileOwner;
  type: 'standard' | 'plasma_beam' | 'spread_bullet' | 'homing_missile' | 'bouncing_vhs' | 'sniper_beam' | 'boss_energy_ball' | 'glitch_wave' | 'flame_wave' | 'torpedo' | 'lightning_bolt' | 'magma_blob' | 'feather_blade';
  life: number;
  maxLife: number;
  penetrating?: boolean;
  bouncesLeft?: number;
  targetEnemyId?: string;
  trail: { x: number; y: number; color: string; size: number }[];
  radius?: number;
}

export type EnemyType = 
  | 'SURVEILLANCE_DRONE' 
  | 'GLITCH_WALKER' 
  | 'RIOT_CLEANER' 
  | 'CYBER_SNIPER' 
  | 'NEON_SLIME' 
  | 'TURRET_ORB'
  | 'AERO_HARPY'
  | 'DEEP_JELLY'
  | 'DRILL_BOT'
  | 'NEO_NINJA';

export interface Enemy extends Rect {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  isGrounded: boolean;
  attackCooldown: number;
  stateTimer: number;
  behaviorState: string;
  shieldActive?: boolean; // For Riot Cleaner
  aimLaserAngle?: number; // For Cyber Sniper
  aimProgress?: number;
  pointsValue: number;
  isGlitching: number; // visual glitch duration
  customData?: Record<string, any>;
}

export type BossPhase = 1 | 2 | 3;
export type BossArchetype = 'TITAN' | 'WYRM' | 'KRAKEN' | 'VALKYRIE';

export interface Boss extends Rect {
  id: string;
  name: string;
  title: string;
  bossType: BossArchetype;
  hp: number;
  maxHp: number;
  phase: BossPhase;
  vx: number;
  vy: number;
  facing: 1 | -1;
  attackTimer: number;
  currentAttack: string;
  attackPhaseTime: number;
  glitchIntensity: number;
  shieldHp: number;
  maxShieldHp: number;
  isVulnerable: boolean;
  summonMinionsTimer: number;
  floatingAngle: number;
  segments?: { x: number; y: number; size: number; angle: number }[]; // For Mecha-Wyrm & Kraken tentacles
  subParts: {
    name: string;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    hp: number;
    maxHp: number;
  }[];
}

export type PlatformType = 
  | 'SOLID' 
  | 'ONE_WAY' 
  | 'GLITCH' 
  | 'JUMP_PAD' 
  | 'LASER_GATE' 
  | 'STEAM_VENT' 
  | 'ACID_POOL'
  | 'POD_DISPENSER' 
  | 'END_GATE' 
  | 'START_PORTAL';

export interface Platform extends Rect {
  id: string;
  type: PlatformType;
  color?: string;
  isActive?: boolean;
  timer?: number;
  period?: number;
  jumpForce?: number;
  dispenserOpened?: boolean;
  powerupDrop?: FormType | 'HEALTH' | 'ENERGY' | 'LIFE';
  customLabel?: string;
}

export interface PowerupItem extends Rect {
  id: string;
  type: FormType | 'HEALTH' | 'ENERGY' | 'LIFE';
  vx: number;
  vy: number;
  isGrounded: boolean;
  life: number;
  bobAngle: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'pixel' | 'ring' | 'smoke' | 'spark' | 'text' | 'glitch_box' | 'star' | 'bubble' | 'feather' | 'water_splash';
  text?: string;
  gravity?: number;
  fade?: boolean;
}

export interface LevelData {
  levelNumber: number;
  totalLevels: number;
  biome: BiomeType;
  theme: string;
  title: string;
  subtitle: string;
  description: string;
  width: number;
  height: number;
  platforms: Platform[];
  enemies: Enemy[];
  boss?: Boss;
  powerups: PowerupItem[];
  decorations: {
    x: number;
    y: number;
    type: 'neon_sign' | 'palm' | 'billboard' | 'statue' | 'grid_pillar' | 'vending_machine' | 'coral' | 'crystal' | 'cloud' | 'stalactite' | 'torii';
    text?: string;
    color?: string;
    scale?: number;
  }[];
  startPoint: Vector2D;
  endPoint: Vector2D;
  gravityMultiplier: number;
  windSpeed: number;
}

export interface GameSettings {
  crtFilter: boolean;
  bloom: boolean;
  screenShake: boolean;
  bgmVolume: number;
  sfxVolume: number;
  showFps: boolean;
}

export interface ControlsState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  shoot: boolean;
  shootPressed: boolean;
  dash: boolean;
  dashPressed: boolean;
  nova: boolean;
  novaPressed: boolean;
}
