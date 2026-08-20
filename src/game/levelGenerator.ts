/**
 * Level, Enemy & Multi-Boss Generator for Dungeon Fighter: Arad Chronicles (地下城勇士)
 * 10 Handcrafted Themed Stages across 4 Arad Realms (Grand Flores, Underfoot, Behemoth, Sky Tower)
 * Boss Fights every 3 levels + Ultimate Level 10 Lord of Light Siegheart
 */

import { LevelData, Platform, Enemy, Boss, PowerupItem, FormType, BiomeType, BossArchetype } from './types';

export interface StageMeta {
  levelNumber: number;
  biome: BiomeType;
  title: string;
  subtitle: string;
  description: string;
  isBoss: boolean;
  bossName?: string;
  bossArchetype?: BossArchetype;
}

export const STAGE_CATALOG: StageMeta[] = [
  {
    levelNumber: 1,
    biome: 'city',
    title: 'ZONE 01: 格兰之森 · 幽暗密林',
    subtitle: 'GRAND FLORES // SHADOW FOREST',
    description: '穿行于月影森林与古老精灵遗迹，熟悉 8 向剑气斩击与鬼影步闪避，扫荡森林哥布林。',
    isBoss: false
  },
  {
    levelNumber: 2,
    biome: 'city',
    title: 'ZONE 02: 雷鸣废墟 · 哥布林要塞',
    subtitle: 'THUNDER RUINS // GOBLIN FORTRESS',
    description: '深入雷鸣废墟要塞，迎战精钢巨斧牛头护卫与暗咒魔法师，借助升腾魔法阵突破石壁。',
    isBoss: false
  },
  {
    levelNumber: 3,
    biome: 'matrix',
    title: 'ZONE 03: 领主之渊 · 牛头王萨乌塔',
    subtitle: 'BOSS CHAMBER // TAU KING SHAUTA',
    description: '格兰之森霸主决战！牛头王拥有狂暴践踏、巨斧横扫冲撞、落石震地波与血气狂暴三阶段！',
    isBoss: true,
    bossName: '牛头王萨乌塔 (TAU KING SHAUTA)',
    bossArchetype: 'TITAN'
  },
  {
    levelNumber: 4,
    biome: 'underground',
    title: 'ZONE 04: 暗黑城 · 幽冥地底通道',
    subtitle: 'UNDERFOOT // CATACOMBS ENTRANCE',
    description: '潜入暗黑城古老地下矿坑与暗夜迷宫，小心滚烫熔岩沟渠与破土而出的掘地魔虫。',
    isBoss: false
  },
  {
    levelNumber: 5,
    biome: 'underground',
    title: 'ZONE 05: 暗黑城 · 熔岩矿脉深渊',
    subtitle: 'UNDERFOOT // MAGMA SHAFT',
    description: '充斥高能紫水晶与地心火浆的深坑，迎战暗影影武者与高阶暗黑僵尸，获取阿修罗邪光斩。',
    isBoss: false
  },
  {
    levelNumber: 6,
    biome: 'underground',
    title: 'ZONE 06: 地心熔炉 · 狂龙赫斯',
    subtitle: 'MAGMA REACTOR // FURIOUS DRAGON HEISS',
    description: '熔岩穴领主决战！多节熔岩机械巨龙穿梭潜行，喷吐炽烈熔岩龙息与全屏震地冲击波！',
    isBoss: true,
    bossName: '狂龙赫斯 (MAGMA DRAGON HEISS)',
    bossArchetype: 'WYRM'
  },
  {
    levelNumber: 7,
    biome: 'underwater',
    title: 'ZONE 07: 天帷巨兽 · 神庙外围浮岛',
    subtitle: 'BEHEMOTH // CELESTIAL SHRINES',
    description: '登上飞天巨兽背脊上的失落神殿！处于失重浮游环境，借助神圣气泡泉避开电光水母。',
    isBoss: false
  },
  {
    levelNumber: 8,
    biome: 'underwater',
    title: 'ZONE 08: 天帷巨兽 · 堕落之殿海沟',
    subtitle: 'BEHEMOTH // ABYSSAL TEMPLE TRENCH',
    description: '深入堕落使徒殿堂深水走廊，迎战密集深海水母群与激光魔眼，获取剑神万剑归宗秘传。',
    isBoss: false
  },
  {
    levelNumber: 9,
    biome: 'underwater',
    title: 'ZONE 09: 使徒之巢 · 第八使徒罗特斯',
    subtitle: 'APOSTLE LAIR // APOSTLE LOTUS',
    description: '天帷巨兽支配者决战！第八使徒长脚罗特斯，拥有千条激光触手横扫、深渊漩涡与深海震爆！',
    isBoss: true,
    bossName: '第八使徒 · 长脚罗特斯 (APOSTLE LOTUS)',
    bossArchetype: 'KRAKEN'
  },
  {
    levelNumber: 10,
    biome: 'sky',
    title: 'ZONE 10: 天空之城 · 光之城主赛格哈特',
    subtitle: 'SKY TOWER ZENITH // LORD OF LIGHT SIEGHEART',
    description: '终极史诗决战：天空之城神圣圣殿！直面不灭光之铠甲领主，迎战极光圣剑天罚与神圣雷暴！',
    isBoss: true,
    bossName: '光之城主 · 赛格哈特 (LORD OF LIGHT SIEGHEART)',
    bossArchetype: 'VALKYRIE'
  }
];

export function generateLevel(levelNum: number): LevelData {
  const isBossLevel = levelNum % 3 === 0 || levelNum === 10;
  const loopCount = Math.floor((levelNum - 1) / 10);
  const normalizedStage = ((levelNum - 1) % 10) + 1;

  const meta = STAGE_CATALOG[normalizedStage - 1] || {
    levelNumber: levelNum,
    biome: ['city', 'underground', 'underwater', 'sky', 'matrix'][levelNum % 5] as BiomeType,
    title: `ZONE ${levelNum.toString().padStart(2, '0')}: 无尽赛博超空间 (Loop ${loopCount + 1})`,
    subtitle: `INFINITE CYBERSPACE // ZONE ${levelNum}`,
    description: '超空间无尽挑战，敌人弹幕速度与血量大幅强化！',
    isBoss: isBossLevel,
    bossName: isBossLevel ? `HYPER CORE OVERLORD // MK-${levelNum}` : undefined,
    bossArchetype: (['TITAN', 'WYRM', 'KRAKEN', 'VALKYRIE'][(levelNum / 3) % 4 | 0] || 'TITAN') as BossArchetype
  };

  const biome = meta.biome;
  const isBoss = isBossLevel;

  // Level dimensions
  const levelWidth = isBoss ? 2800 : 3800 + (normalizedStage % 3) * 600;
  const levelHeight = 920;
  const groundY = 760;

  const platforms: Platform[] = [];
  const enemies: Enemy[] = [];
  const powerups: PowerupItem[] = [];
  const decorations: LevelData['decorations'] = [];

  // Environmental physics parameters
  const gravityMultiplier = biome === 'underwater' ? 0.72 : 1.0;
  const windSpeed = biome === 'sky' ? 1.2 : 0;

  // Color Palette Theme
  let groundColor = '#ff2a8d';
  let platformColor = '#00f0ff';
  let accentColor = '#b026ff';

  if (biome === 'underground') {
    groundColor = '#3a1f10';
    platformColor = '#ffaa00';
    accentColor = '#ff0055';
  } else if (biome === 'underwater') {
    groundColor = '#003366';
    platformColor = '#00ffcc';
    accentColor = '#0099ff';
  } else if (biome === 'sky') {
    groundColor = '#1e1b4b';
    platformColor = '#38bdf8';
    accentColor = '#f472b6';
  } else if (biome === 'matrix') {
    groundColor = '#0f172a';
    platformColor = '#22c55e';
    accentColor = '#a855f7';
  }

  // --- 1. ARENA & PLATFORMS GENERATION ---
  if (isBoss) {
    // Boss Arena Layout
    platforms.push({
      id: 'boss_ground',
      type: 'SOLID',
      x: 0,
      y: groundY,
      width: levelWidth,
      height: 160,
      color: groundColor
    });

    // Multi-tier Platforms for Boss fights
    platforms.push(
      // Left low/mid/high platforms
      {
        id: 'boss_plat_l1',
        type: 'ONE_WAY',
        x: 260,
        y: 580,
        width: 240,
        height: 18,
        color: platformColor
      },
      {
        id: 'boss_plat_l2',
        type: 'ONE_WAY',
        x: 180,
        y: 400,
        width: 200,
        height: 18,
        color: accentColor
      },
      // Right low/mid/high platforms
      {
        id: 'boss_plat_r1',
        type: 'ONE_WAY',
        x: levelWidth - 500,
        y: 580,
        width: 240,
        height: 18,
        color: platformColor
      },
      {
        id: 'boss_plat_r2',
        type: 'ONE_WAY',
        x: levelWidth - 380,
        y: 400,
        width: 200,
        height: 18,
        color: accentColor
      },
      // Center Sky Glitch Bridge
      {
        id: 'boss_plat_center',
        type: 'GLITCH',
        x: levelWidth / 2 - 140,
        y: 360,
        width: 280,
        height: 18,
        color: '#ffe600',
        timer: 0,
        period: 240,
        isActive: true
      },
      // Left & Right Rapid Evade Jump Pads
      {
        id: 'boss_jump_pad_l',
        type: 'JUMP_PAD',
        x: 120,
        y: groundY - 14,
        width: 56,
        height: 14,
        jumpForce: -22,
        color: '#00ffcc'
      },
      {
        id: 'boss_jump_pad_r',
        type: 'JUMP_PAD',
        x: levelWidth - 180,
        y: groundY - 14,
        width: 56,
        height: 14,
        jumpForce: -22,
        color: '#00ffcc'
      }
    );

    // Initial Boss Arena Powerup Dispensers
    const bossDrops: FormType[] = biome === 'underwater' 
      ? ['SPREAD', 'FLIGHT', 'HEAVY_PLASMA']
      : biome === 'underground' 
      ? ['HEAVY_PLASMA', 'INVINCIBLE', 'SPREAD']
      : ['FLIGHT', 'INVINCIBLE', 'HEAVY_PLASMA', 'SPREAD'];

    platforms.push(
      {
        id: 'boss_pod_l',
        type: 'POD_DISPENSER',
        x: 360,
        y: 330,
        width: 44,
        height: 44,
        powerupDrop: bossDrops[0],
        dispenserOpened: false
      },
      {
        id: 'boss_pod_r',
        type: 'POD_DISPENSER',
        x: levelWidth - 410,
        y: 330,
        width: 44,
        height: 44,
        powerupDrop: bossDrops[1] || 'HEAVY_PLASMA',
        dispenserOpened: false
      }
    );

  } else {
    // Regular Exploration Stage
    let currentX = 0;
    let groundSegment = 0;

    while (currentX < levelWidth - 450) {
      const segWidth = 600 + Math.random() * 450;
      const heightVar = Math.sin(groundSegment * 1.35) * (biome === 'sky' ? 80 : 50);
      const curY = groundY + heightVar;

      // Solid Floor Segment
      platforms.push({
        id: `ground_${groundSegment}`,
        type: 'SOLID',
        x: currentX,
        y: curY,
        width: segWidth,
        height: levelHeight - curY,
        color: groundColor
      });

      // Biome-specific elevated structures
      const elevatedY1 = curY - 160;
      const elevatedY2 = curY - 320;

      // Mid-level one-way platforms
      platforms.push({
        id: `oneway_${groundSegment}_1`,
        type: 'ONE_WAY',
        x: currentX + 70,
        y: elevatedY1,
        width: 220,
        height: 18,
        color: platformColor
      });

      // Glitch platform (Blinks on synth beat)
      if (groundSegment % 2 === 1) {
        platforms.push({
          id: `glitch_${groundSegment}`,
          type: 'GLITCH',
          x: currentX + 340,
          y: elevatedY1 - 40,
          width: 180,
          height: 16,
          color: '#ffe600',
          timer: (groundSegment * 40) % 200,
          period: 180,
          isActive: true
        });
      }

      // High-level Platform
      if (groundSegment > 0) {
        platforms.push({
          id: `oneway_${groundSegment}_2`,
          type: 'ONE_WAY',
          x: currentX + 180,
          y: elevatedY2,
          width: 260,
          height: 18,
          color: accentColor
        });
      }

      // Interactive Mechanics based on Biome
      if (biome === 'underground') {
        // Acid pools in pits
        if (groundSegment % 2 === 1) {
          platforms.push({
            id: `acid_${groundSegment}`,
            type: 'ACID_POOL',
            x: currentX + 100,
            y: curY - 10,
            width: 140,
            height: 20,
            color: '#10b981'
          });
        }
        // Jump Pad
        platforms.push({
          id: `jump_pad_${groundSegment}`,
          type: 'JUMP_PAD',
          x: currentX + segWidth - 110,
          y: curY - 14,
          width: 52,
          height: 14,
          jumpForce: -23,
          color: '#ffaa00'
        });
      } else if (biome === 'underwater') {
        // Deep Sea Bubble Elevator / Updraft Current
        platforms.push({
          id: `bubble_vent_${groundSegment}`,
          type: 'STEAM_VENT',
          x: currentX + 160,
          y: curY - 140,
          width: 70,
          height: 140,
          timer: 0,
          period: 140,
          isActive: true
        });
      } else if (biome === 'sky') {
        // Cloud Wind Boosters
        platforms.push({
          id: `sky_vent_${groundSegment}`,
          type: 'STEAM_VENT',
          x: currentX + 180,
          y: curY - 200,
          width: 80,
          height: 200,
          timer: 0,
          period: 160,
          isActive: true
        });
        platforms.push({
          id: `jump_pad_${groundSegment}`,
          type: 'JUMP_PAD',
          x: currentX + segWidth - 100,
          y: curY - 14,
          width: 54,
          height: 14,
          jumpForce: -25,
          color: '#38bdf8'
        });
      } else {
        // City Standard
        if (groundSegment % 2 === 0) {
          platforms.push({
            id: `jump_pad_${groundSegment}`,
            type: 'JUMP_PAD',
            x: currentX + segWidth - 120,
            y: curY - 14,
            width: 54,
            height: 14,
            jumpForce: -22,
            color: '#00ffcc'
          });
        } else {
          platforms.push({
            id: `steam_vent_${groundSegment}`,
            type: 'STEAM_VENT',
            x: currentX + 140,
            y: curY - 90,
            width: 60,
            height: 90,
            timer: 0,
            period: 120,
            isActive: true
          });
        }
      }

      // Laser Gate Barriers
      if (groundSegment > 1 && groundSegment % 2 === 1) {
        platforms.push({
          id: `laser_gate_${groundSegment}`,
          type: 'LASER_GATE',
          x: currentX + segWidth - 190,
          y: curY - 180,
          width: 24,
          height: 180,
          timer: (groundSegment * 50) % 180,
          period: 180,
          isActive: true
        });
      }

      // Floating VHS Cassette Dispenser Pods
      const formDrops: FormType[] = ['FLIGHT', 'INVINCIBLE', 'HEAVY_PLASMA', 'SPREAD'];
      const chosenForm = formDrops[groundSegment % formDrops.length];
      platforms.push({
        id: `pod_${groundSegment}`,
        type: 'POD_DISPENSER',
        x: currentX + 240,
        y: elevatedY2 - 80,
        width: 44,
        height: 44,
        powerupDrop: chosenForm,
        dispenserOpened: false
      });

      // --- SPAWN BIOME-SPECIFIC ENEMIES ---
      // 1. Air Enemies
      if (biome === 'sky') {
        // Aero Harpy Drone
        enemies.push({
          id: `harpy_${groundSegment}`,
          type: 'AERO_HARPY',
          x: currentX + 250,
          y: curY - 380,
          width: 46,
          height: 38,
          vx: (Math.random() > 0.5 ? 1 : -1) * (2.0 + loopCount * 0.4),
          vy: 0,
          hp: 45 + loopCount * 20,
          maxHp: 45 + loopCount * 20,
          facing: -1,
          isGrounded: false,
          attackCooldown: 70,
          stateTimer: 0,
          behaviorState: 'dive',
          pointsValue: 320,
          isGlitching: 0
        });
      } else if (biome === 'underwater') {
        // Deep Sea Pulse Jellyfish
        enemies.push({
          id: `jelly_${groundSegment}`,
          type: 'DEEP_JELLY',
          x: currentX + 220,
          y: curY - 300,
          width: 42,
          height: 48,
          vx: 0,
          vy: -1,
          hp: 40 + loopCount * 15,
          maxHp: 40 + loopCount * 15,
          facing: -1,
          isGrounded: false,
          attackCooldown: 90,
          stateTimer: 0,
          behaviorState: 'pulse',
          pointsValue: 280,
          isGlitching: 0
        });
      } else {
        // Standard Surveillance Drone
        enemies.push({
          id: `drone_${groundSegment}`,
          type: 'SURVEILLANCE_DRONE',
          x: currentX + 200,
          y: curY - 340,
          width: 42,
          height: 32,
          vx: (Math.random() > 0.5 ? 1 : -1) * (1.5 + loopCount * 0.3),
          vy: 0,
          hp: 30 + loopCount * 15,
          maxHp: 30 + loopCount * 15,
          facing: -1,
          isGrounded: false,
          attackCooldown: 80,
          stateTimer: 0,
          behaviorState: 'patrol',
          pointsValue: 200,
          isGlitching: 0
        });
      }

      // 2. Ground & Heavy Enemies
      if (biome === 'underground') {
        // Drill Bot (Burrows and charges)
        enemies.push({
          id: `drill_${groundSegment}`,
          type: 'DRILL_BOT',
          x: currentX + 300,
          y: curY - 48,
          width: 48,
          height: 48,
          vx: -2.0,
          vy: 0,
          hp: 75 + loopCount * 30,
          maxHp: 75 + loopCount * 30,
          facing: -1,
          isGrounded: true,
          attackCooldown: 100,
          stateTimer: 0,
          behaviorState: 'drill_charge',
          pointsValue: 450,
          isGlitching: 0
        });
        // Neo Ninja (High platforms)
        if (groundSegment % 2 === 1) {
          enemies.push({
            id: `ninja_${groundSegment}`,
            type: 'NEO_NINJA',
            x: currentX + 200,
            y: elevatedY2 - 56,
            width: 36,
            height: 56,
            vx: 0,
            vy: 0,
            hp: 55 + loopCount * 25,
            maxHp: 55 + loopCount * 25,
            facing: -1,
            isGrounded: true,
            attackCooldown: 80,
            stateTimer: 0,
            behaviorState: 'teleport_strike',
            pointsValue: 500,
            isGlitching: 0
          });
        }
      } else {
        // Glitch Walker or Riot Cleaner
        if (groundSegment % 2 === 0) {
          enemies.push({
            id: `walker_${groundSegment}`,
            type: 'GLITCH_WALKER',
            x: currentX + 280,
            y: curY - 58,
            width: 46,
            height: 58,
            vx: -1.2 - loopCount * 0.2,
            vy: 0,
            hp: 60 + loopCount * 25,
            maxHp: 60 + loopCount * 25,
            facing: -1,
            isGrounded: true,
            attackCooldown: 100,
            stateTimer: 0,
            behaviorState: 'march',
            pointsValue: 350,
            isGlitching: 0
          });
        } else {
          enemies.push({
            id: `riot_${groundSegment}`,
            type: 'RIOT_CLEANER',
            x: currentX + 320,
            y: curY - 64,
            width: 52,
            height: 64,
            vx: -0.8,
            vy: 0,
            hp: 110 + loopCount * 40,
            maxHp: 110 + loopCount * 40,
            facing: -1,
            isGrounded: true,
            attackCooldown: 140,
            stateTimer: 0,
            behaviorState: 'shield_up',
            shieldActive: true,
            pointsValue: 500,
            isGlitching: 0
          });
        }
      }

      // 3. Cyber Sniper
      if (groundSegment >= 1 && groundSegment % 2 === 1) {
        enemies.push({
          id: `sniper_${groundSegment}`,
          type: 'CYBER_SNIPER',
          x: currentX + 220,
          y: elevatedY2 - 54,
          width: 38,
          height: 54,
          vx: 0,
          vy: 0,
          hp: 45 + loopCount * 20,
          maxHp: 45 + loopCount * 20,
          facing: -1,
          isGrounded: true,
          attackCooldown: 160,
          stateTimer: 0,
          behaviorState: 'aiming',
          aimLaserAngle: Math.PI,
          aimProgress: 0,
          pointsValue: 400,
          isGlitching: 0
        });
      }

      // 4. Slimes / Small critters
      if (Math.random() > 0.45) {
        enemies.push({
          id: `slime_${groundSegment}`,
          type: 'NEON_SLIME',
          x: currentX + 130,
          y: curY - 28,
          width: 36,
          height: 28,
          vx: -1.8,
          vy: 0,
          hp: 25 + loopCount * 10,
          maxHp: 25 + loopCount * 10,
          facing: -1,
          isGrounded: true,
          attackCooldown: 60,
          stateTimer: 0,
          behaviorState: 'hopping',
          pointsValue: 150,
          isGlitching: 0
        });
      }

      // --- DECORATIONS ACCORDING TO BIOME ---
      if (biome === 'city') {
        decorations.push({
          x: currentX + 100,
          y: curY - 260,
          type: 'neon_sign',
          text: ['夜間飛行', '90s VAPOR', '電脳都市', 'TOKYO 1988', '記憶再燃', 'NEO FUTURE'][groundSegment % 6],
          color: ['#ff007f', '#00f0ff', '#ffe600', '#b026ff'][groundSegment % 4],
          scale: 1.2
        });
        if (groundSegment % 2 === 0) {
          decorations.push({ x: currentX + 450, y: curY - 140, type: 'palm', scale: 1.4 });
        }
      } else if (biome === 'underground') {
        decorations.push({
          x: currentX + 120,
          y: curY - 220,
          type: 'crystal',
          color: '#ec4899',
          scale: 1.3
        });
        decorations.push({
          x: currentX + 380,
          y: 40,
          type: 'stalactite',
          scale: 1.5
        });
      } else if (biome === 'underwater') {
        decorations.push({
          x: currentX + 80,
          y: curY - 180,
          type: 'coral',
          color: '#06b6d4',
          scale: 1.4
        });
      } else if (biome === 'sky') {
        decorations.push({
          x: currentX + 140,
          y: curY - 300,
          type: 'cloud',
          scale: 1.6
        });
        if (groundSegment % 3 === 0) {
          decorations.push({
            x: currentX + 350,
            y: curY - 240,
            type: 'torii',
            color: '#f43f5e',
            scale: 1.5
          });
        }
      }

      const gapWidth = 140 + Math.random() * 100;
      currentX += segWidth + gapWidth;
      groundSegment++;
    }

    // Final Stage Exit Portal
    const endX = levelWidth - 500;
    platforms.push({
      id: 'end_ground',
      type: 'SOLID',
      x: endX,
      y: groundY,
      width: 500,
      height: 160,
      color: groundColor
    });

    platforms.push({
      id: 'level_end_gate',
      type: 'END_GATE',
      x: levelWidth - 220,
      y: groundY - 110,
      width: 70,
      height: 110,
      color: '#00ffcc',
      customLabel: `GO TO ZONE ${(levelNum + 1).toString().padStart(2, '0')}`
    });
  }

  // Common Start Portal
  platforms.push({
    id: 'start_portal',
    type: 'START_PORTAL',
    x: 80,
    y: groundY - 100,
    width: 60,
    height: 100,
    color: '#00f0ff'
  });

  // --- BOSS ENTITY GENERATION (4 DISTINCT BOSSES) ---
  let boss: Boss | undefined = undefined;
  if (isBoss) {
    const bossArchetype: BossArchetype = meta.bossArchetype || 'TITAN';
    const bossMaxHp = 1800 + (levelNum - 3) * 600 + loopCount * 1200;

    if (bossArchetype === 'TITAN') {
      // Stage 03 Boss: GLITCH TITAN (Holographic Greek Statue)
      boss = {
        id: `boss_titan_${levelNum}`,
        name: 'GLITCH TITAN',
        title: meta.bossName || 'AESTHETIC-99 // 巨型全息故障神像',
        bossType: 'TITAN',
        hp: bossMaxHp,
        maxHp: bossMaxHp,
        phase: 1,
        x: levelWidth - 680,
        y: 240,
        width: 220,
        height: 280,
        vx: 0,
        vy: 0,
        facing: -1,
        attackTimer: 100,
        currentAttack: 'idle',
        attackPhaseTime: 0,
        glitchIntensity: 0.2,
        shieldHp: 400,
        maxShieldHp: 400,
        isVulnerable: true,
        summonMinionsTimer: 200,
        floatingAngle: 0,
        subParts: [
          { name: 'Core Prism', offsetX: 70, offsetY: 100, width: 80, height: 80, hp: 500, maxHp: 500 },
          { name: 'Left Wing', offsetX: -40, offsetY: 40, width: 50, height: 100, hp: 300, maxHp: 300 },
          { name: 'Right Wing', offsetX: 210, offsetY: 40, width: 50, height: 100, hp: 300, maxHp: 300 }
        ]
      };
    } else if (bossArchetype === 'WYRM') {
      // Stage 06 Boss: MECHA-WYRM (Subterranean Magma Driller)
      const segments: { x: number; y: number; size: number; angle: number }[] = [];
      for (let i = 0; i < 8; i++) {
        segments.push({ x: levelWidth - 600 + i * 40, y: 350, size: 45 - i * 3, angle: 0 });
      }

      boss = {
        id: `boss_wyrm_${levelNum}`,
        name: 'MECHA-WYRM',
        title: meta.bossName || 'MAGMA-06 // 地底熔岩机械巨蠕虫',
        bossType: 'WYRM',
        hp: bossMaxHp,
        maxHp: bossMaxHp,
        phase: 1,
        x: levelWidth - 700,
        y: 300,
        width: 240,
        height: 180,
        vx: -3,
        vy: 2,
        facing: -1,
        attackTimer: 80,
        currentAttack: 'burrow_sweep',
        attackPhaseTime: 0,
        glitchIntensity: 0.3,
        shieldHp: 500,
        maxShieldHp: 500,
        isVulnerable: true,
        summonMinionsTimer: 180,
        floatingAngle: 0,
        segments,
        subParts: [
          { name: 'Drill Maw', offsetX: 0, offsetY: 40, width: 90, height: 90, hp: 600, maxHp: 600 },
          { name: 'Magma Core', offsetX: 100, offsetY: 30, width: 70, height: 70, hp: 500, maxHp: 500 }
        ]
      };
    } else if (bossArchetype === 'KRAKEN') {
      // Stage 09 Boss: KRAKEN MECHA (Deep Sea Bio-Mechanical Dreadnought)
      const segments: { x: number; y: number; size: number; angle: number }[] = [];
      for (let i = 0; i < 6; i++) {
        segments.push({ x: levelWidth - 650 + (i % 3) * 60, y: 400 + Math.floor(i / 3) * 60, size: 30, angle: 0 });
      }

      boss = {
        id: `boss_kraken_${levelNum}`,
        name: 'KRAKEN MECHA',
        title: meta.bossName || 'POSEIDON-09 // 深海机械巨怪克拉肯',
        bossType: 'KRAKEN',
        hp: bossMaxHp,
        maxHp: bossMaxHp,
        phase: 1,
        x: levelWidth - 660,
        y: 200,
        width: 260,
        height: 280,
        vx: 0,
        vy: 1,
        facing: -1,
        attackTimer: 90,
        currentAttack: 'tentacle_sweep',
        attackPhaseTime: 0,
        glitchIntensity: 0.35,
        shieldHp: 600,
        maxShieldHp: 600,
        isVulnerable: true,
        summonMinionsTimer: 160,
        floatingAngle: 0,
        segments,
        subParts: [
          { name: 'Optic Eye Core', offsetX: 90, offsetY: 70, width: 80, height: 80, hp: 800, maxHp: 800 },
          { name: 'Left Siphon', offsetX: -30, offsetY: 120, width: 60, height: 80, hp: 400, maxHp: 400 },
          { name: 'Right Siphon', offsetX: 230, offsetY: 120, width: 60, height: 80, hp: 400, maxHp: 400 }
        ]
      };
    } else {
      // Stage 10 Zenith Boss: NEO-GENESIS VALKYRIE (Goddess of Cyberspace)
      boss = {
        id: `boss_valkyrie_${levelNum}`,
        name: 'NEO-GENESIS VALKYRIE',
        title: meta.bossName || 'AXIOM-ZERO // 平流层源初矩阵女武神',
        bossType: 'VALKYRIE',
        hp: bossMaxHp * 1.25,
        maxHp: bossMaxHp * 1.25,
        phase: 1,
        x: levelWidth - 650,
        y: 180,
        width: 200,
        height: 260,
        vx: 0,
        vy: 0,
        facing: -1,
        attackTimer: 70,
        currentAttack: 'divine_blades',
        attackPhaseTime: 0,
        glitchIntensity: 0.4,
        shieldHp: 800,
        maxShieldHp: 800,
        isVulnerable: true,
        summonMinionsTimer: 140,
        floatingAngle: 0,
        subParts: [
          { name: 'Prism Halo', offsetX: 50, offsetY: -30, width: 100, height: 60, hp: 800, maxHp: 800 },
          { name: 'Seraph Wings', offsetX: -50, offsetY: 40, width: 300, height: 160, hp: 1000, maxHp: 1000 }
        ]
      };
    }
  }

  return {
    levelNumber: levelNum,
    totalLevels: 10,
    biome,
    theme: meta.title,
    title: meta.title,
    subtitle: meta.subtitle,
    description: meta.description,
    width: levelWidth,
    height: levelHeight,
    platforms,
    enemies,
    boss,
    powerups,
    decorations,
    startPoint: { x: 120, y: groundY - 80 },
    endPoint: { x: levelWidth - 200, y: groundY - 80 },
    gravityMultiplier,
    windSpeed
  };
}
