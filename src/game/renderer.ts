/**
 * Dungeon Fighter: Arad Chronicles (地下城勇士)
 * 2D Parallax Renderer & Dark-Fantasy Gothic Dungeon Sprite Engine
 * Clean, high-contrast, zero-light-pollution atmospheric dungeon visuals
 * 4 Arad Realms (Grand Flores, Underfoot, Behemoth, Sky Tower)
 * 4 Epic Bosses (Tau King Shauta, Magma Dragon Heiss, Apostle Lotus, Lord of Light Siegheart)
 */

import { Player, Projectile, Enemy, Boss, Platform, PowerupItem, Particle, LevelData, GameSettings, FormType, BiomeType, BossArchetype } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private animTick: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  public render(
    player: Player,
    projectiles: Projectile[],
    particles: Particle[],
    level: LevelData,
    cameraX: number,
    cameraY: number,
    settings: GameSettings,
    screenShake: { x: number; y: number }
  ) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    this.animTick++;

    // Clear Screen & Frame Setup
    ctx.save();

    // Apply Screen Shake
    if (settings.screenShake) {
      ctx.translate(screenShake.x, screenShake.y);
    }

    // 1. Atmospheric Parallax Dungeon Background (Clean, high contrast, zero light pollution)
    this.renderParallaxBackground(cameraX, cameraY, level);

    // 2. World Coordinate Transform
    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Render Stage Platforms & Dungeon Traps
    this.renderPlatforms(level.platforms, level.biome);

    // Render Powerup & Awakening Soul Gems
    this.renderPowerups(level.powerups);

    // Render Dungeon Enemies
    this.renderEnemies(level.enemies);

    // Render Dungeon Boss (if present)
    if (level.boss) {
      this.renderBoss(level.boss);
    }

    // Render Slayer Hero (鬼剑士 · 阿拉德勇士)
    this.renderPlayer(player);

    // Render Sword Waves & Magical Projectiles
    this.renderProjectiles(projectiles);

    // Render Particles, Blood Bursts & Floating Damage Numbers
    this.renderParticles(particles);

    ctx.restore(); // Restore world transform

    // 3. Post Processing (Subtle Gothic Vignette / Optional Scanlines)
    if (settings.crtFilter) {
      this.renderGothicCRTOverlay(cw, ch);
    } else {
      this.renderVignette(cw, ch);
    }

    ctx.restore();
  }

  // ==========================================
  // 1. CLEAN PARALLAX DUNGEON BACKGROUNDS
  // ==========================================
  private renderParallaxBackground(camX: number, camY: number, level: LevelData) {
    const biome = level.biome || 'city';

    switch (biome) {
      case 'sky':
        this.renderSkyTowerBackground(camX, camY);
        break;
      case 'underwater':
        this.renderBehemothBackground(camX, camY);
        break;
      case 'underground':
        this.renderUnderfootBackground(camX, camY);
        break;
      case 'matrix':
        this.renderDimensionalRiftBackground(camX, camY);
        break;
      default:
        this.renderGrandFloresBackground(camX, camY);
        break;
    }
  }

  // --- A. 格兰之森 · 幽暗密林 (Grand Flores Dark Forest) ---
  private renderGrandFloresBackground(camX: number, _camY: number) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const t = this.animTick * 0.02;

    // Deep Midnight Gothic Sky (Navy -> Dark Charcoal Forest Mist)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#060814');
    skyGrad.addColorStop(0.45, '#0b1329');
    skyGrad.addColorStop(0.8, '#0f1f1d');
    skyGrad.addColorStop(1, '#050f0e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Pale Silver Crescent Moon (Arad Moon)
    const moonX = cw * 0.75 - (camX * 0.015) % (cw * 0.3);
    const moonY = ch * 0.22;
    ctx.save();
    ctx.fillStyle = '#f1f5f9';
    ctx.shadowColor = '#94a3b8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
    ctx.fill();
    // Moon shadow to make it a crescent
    ctx.fillStyle = '#0b1329';
    ctx.beginPath();
    ctx.arc(moonX + 10, moonY - 4, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Floating Ancient Forest Will-o'-Wisps (Soft, gentle glow)
    ctx.fillStyle = 'rgba(110, 231, 183, 0.35)';
    for (let i = 0; i < 16; i++) {
      const wx = ((i * 147.3 + Math.sin(t + i) * 20 - camX * 0.05) % cw + cw) % cw;
      const wy = (i * 83.1 + Math.cos(t * 1.2 + i) * 15) % (ch * 0.7);
      ctx.beginPath();
      ctx.arc(wx, wy, 2 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    // Parallax Layer 1: Distant Ancient Elven Forest Mountain Ridge (Speed 0.06)
    const mountOffset = (camX * 0.06) % 500;
    ctx.fillStyle = '#08101a';
    ctx.beginPath();
    ctx.moveTo(0, ch);
    for (let bx = -500; bx < cw + 500; bx += 100) {
      const x = bx - mountOffset;
      const h = 180 + Math.sin(bx * 0.02) * 50;
      ctx.lineTo(x, ch * 0.65 - h);
    }
    ctx.lineTo(cw, ch);
    ctx.closePath();
    ctx.fill();

    // Parallax Layer 2: Gothic Forest Tree Canopy Silhouettes & Ruined Pillars (Speed 0.16)
    const treeOffset = (camX * 0.16) % 360;
    ctx.fillStyle = '#04090f';
    for (let bx = -360; bx < cw + 360; bx += 120) {
      const x = bx - treeOffset;
      const treeH = 260 + (bx % 80);
      const treeY = ch * 0.75 - treeH;

      // Tree Trunk
      ctx.fillRect(x + 20, treeY + 60, 16, treeH);

      // Branch Canopy
      ctx.beginPath();
      ctx.arc(x + 28, treeY + 50, 45, 0, Math.PI * 2);
      ctx.arc(x + 10, treeY + 70, 35, 0, Math.PI * 2);
      ctx.arc(x + 48, treeY + 65, 38, 0, Math.PI * 2);
      ctx.fill();

      // Ancient Elven Stone Pillar (occasionally)
      if (bx % 240 === 0) {
        ctx.fillStyle = '#0a1622';
        ctx.fillRect(x + 80, ch * 0.75 - 140, 24, 140);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 76, ch * 0.75 - 148, 32, 10);
        ctx.fillStyle = '#04090f';
      }
    }
  }

  // --- B. 暗黑城 · 地底暗影与熔岩穴 (Underfoot & Magma Catacombs) ---
  private renderUnderfootBackground(camX: number, _camY: number) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const t = this.animTick * 0.04;

    // Dark Subterranean Stone Crypt Gradient with Molten Hearth
    const caveGrad = ctx.createLinearGradient(0, 0, 0, ch);
    caveGrad.addColorStop(0, '#09080c');
    caveGrad.addColorStop(0.55, '#120d18');
    caveGrad.addColorStop(0.85, '#220e14');
    caveGrad.addColorStop(1, '#3b0d10');
    ctx.fillStyle = caveGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Parallax Layer 1: Dark Gothic Castle Brick Masonry & Archways (Speed 0.08)
    const archOffset = (camX * 0.08) % 280;
    ctx.fillStyle = '#0e0b14';
    ctx.strokeStyle = '#1a1424';
    ctx.lineWidth = 2;
    for (let bx = -280; bx < cw + 280; bx += 140) {
      const x = bx - archOffset;
      // Gothic Pointed Arch
      ctx.beginPath();
      ctx.moveTo(x, ch);
      ctx.lineTo(x, ch * 0.35);
      ctx.quadraticCurveTo(x + 45, ch * 0.2, x + 90, ch * 0.35);
      ctx.lineTo(x + 90, ch);
      ctx.fill();
      ctx.stroke();

      // Hanging Iron Chains
      ctx.strokeStyle = '#332a40';
      ctx.beginPath();
      ctx.moveTo(x + 45, ch * 0.28);
      ctx.lineTo(x + 45, ch * 0.42);
      ctx.stroke();
    }

    // Parallax Layer 2: Flickering Iron Wall Torches (Speed 0.18)
    const torchOffset = (camX * 0.18) % 240;
    for (let bx = -240; bx < cw + 240; bx += 120) {
      const x = bx - torchOffset;
      const ty = ch * 0.52;

      // Iron Torch Sconce
      ctx.fillStyle = '#292524';
      ctx.fillRect(x + 8, ty, 6, 20);
      ctx.fillRect(x + 4, ty, 14, 4);

      // Warm Torch Flame (Organic, warm amber glow)
      const flameWobble = Math.sin(t * 3 + bx) * 2;
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x + 11 + flameWobble, ty - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 11 + flameWobble, ty - 5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // --- C. 天帷巨兽 · 海潮巨兽神殿 (Behemoth Oceanic Temple) ---
  private renderBehemothBackground(camX: number, _camY: number) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const t = this.animTick * 0.025;

    // Atmospheric Dusk Sky & Oceanic Stratosphere
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#091322');
    skyGrad.addColorStop(0.4, '#0f2438');
    skyGrad.addColorStop(0.75, '#163547');
    skyGrad.addColorStop(1, '#0c1b26');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Distant Behemoth Whale Ribs & Floating Shrine Islands (Speed 0.07)
    const whaleOffset = (camX * 0.07) % 600;
    ctx.fillStyle = '#0a1926';
    for (let bx = -600; bx < cw + 600; bx += 300) {
      const x = bx - whaleOffset;
      const y = ch * 0.62;

      // Colossal Whale Backbone Arch
      ctx.beginPath();
      ctx.moveTo(x - 80, y);
      ctx.quadraticCurveTo(x, y - 110, x + 80, y);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#081420';
      ctx.stroke();

      // Ancient Shrine Roof on island
      ctx.fillStyle = '#061019';
      ctx.fillRect(x - 20, y - 35, 40, 35);
      ctx.fillRect(x - 28, y - 40, 56, 6);
    }

    // Cascading Ethereal Waterfalls (Speed 0.15)
    const waterOffset = (camX * 0.15) % 400;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    for (let bx = -400; bx < cw + 400; bx += 180) {
      const x = bx - waterOffset;
      const wy = ch * 0.55;
      ctx.fillRect(x, wy, 12, ch * 0.45);

      // Water spray mist
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(x + 6 + Math.sin(t * 2 + bx) * 4, wy + 80, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    }
  }

  // --- D. 天空之城 · 光之圣殿 (Sky Tower & Citadel of Light) ---
  private renderSkyTowerBackground(camX: number, _camY: number) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const t = this.animTick * 0.02;

    // Majestic Twilight Citadel Gradient (Rich Royal Indigo -> Twilight Amber Horizon)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#0f0c22');
    skyGrad.addColorStop(0.45, '#1e1840');
    skyGrad.addColorStop(0.75, '#2e2552');
    skyGrad.addColorStop(1, '#3b2848');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Distant Floating Stone Towers & Soaring Marble Pillars (Speed 0.08)
    const towerOffset = (camX * 0.08) % 400;
    for (let bx = -400; bx < cw + 400; bx += 160) {
      const x = bx - towerOffset;
      const h = 200 + (bx % 90);
      const ty = ch * 0.7 - h;

      // Dark Marble Tower Silhouette
      ctx.fillStyle = '#151028';
      ctx.fillRect(x, ty, 44, h + ch * 0.3);

      // Pointed Gothic Spire Roof
      ctx.beginPath();
      ctx.moveTo(x - 4, ty);
      ctx.lineTo(x + 22, ty - 45);
      ctx.lineTo(x + 48, ty);
      ctx.closePath();
      ctx.fillStyle = '#1e1638';
      ctx.fill();

      // Soft Stained Glass Cathedral Window Glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.fillRect(x + 16, ty + 30, 12, 28);
    }

    // Drifting Celestial Clouds (Parallax Speed 0.16)
    const cloudOffset = (camX * 0.16) % 500;
    for (let bx = -500; bx < cw + 500; bx += 220) {
      const x = bx - cloudOffset;
      const cy = ch * 0.72 + Math.sin(bx * 0.05 + t) * 10;
      this.drawGothicCloud(ctx, x, cy, 140, 'rgba(30, 24, 64, 0.6)');
    }
  }

  // --- E. 异次元裂缝 · 远古封印深渊 (Dimensional Rift & Matrix Crypt) ---
  private renderDimensionalRiftBackground(camX: number, _camY: number) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const t = this.animTick * 0.03;

    // Deep Dark Arcane Void
    ctx.fillStyle = '#06040c';
    ctx.fillRect(0, 0, cw, ch);

    // Swirling Arcane Runes & Constellations
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const rx = cw * 0.5 + Math.cos(t * 0.3 + i) * 80 - (camX * 0.05) % cw;
      const ry = ch * 0.45 + Math.sin(t * 0.3 + i) * 60;
      ctx.beginPath();
      ctx.arc(rx, ry, 60 + i * 25, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawGothicCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, w * 0.22, 0, Math.PI * 2);
    ctx.arc(x + w * 0.25, y - w * 0.12, w * 0.3, 0, Math.PI * 2);
    ctx.arc(x + w * 0.55, y, w * 0.24, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  // ==========================================
  // 2. CRISP GOTHIC DUNGEON PLATFORMS & TRAPS
  // ==========================================
  private renderPlatforms(platforms: Platform[], biome: BiomeType) {
    const ctx = this.ctx;
    const t = this.animTick * 0.06;

    platforms.forEach(plat => {
      ctx.save();

      switch (plat.type) {
        case 'SOLID': {
          // Dark Hewn Gothic Stone Slab (High contrast, clean texture)
          ctx.fillStyle = '#131926';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // Top Stone Masonry Highlight Edge
          ctx.fillStyle = biome === 'underground' ? '#9a3412' : biome === 'sky' ? '#d97706' : biome === 'underwater' ? '#0284c7' : '#059669';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);

          // Subtle stone brick vertical division lines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let gx = plat.x; gx < plat.x + plat.width; gx += 48) {
            ctx.beginPath();
            ctx.moveTo(gx, plat.y);
            ctx.lineTo(gx, plat.y + plat.height);
            ctx.stroke();
          }
          break;
        }

        case 'ONE_WAY': {
          // Ancient Gothic Iron Grating / Runic Wooden Bridge
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

          // Iron rivets
          ctx.fillStyle = '#94a3b8';
          for (let rx = plat.x + 8; rx < plat.x + plat.width; rx += 20) {
            ctx.fillRect(rx, plat.y + 2, 3, 3);
          }
          break;
        }

        case 'GLITCH': {
          // Arcane Shifting Phantom Floor
          if (plat.isActive) {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
          } else {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
          }
          break;
        }

        case 'JUMP_PAD': {
          // Ancient Leap Magic Circle (升腾魔法阵)
          ctx.fillStyle = '#0b0f19';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

          // Pulsing Mystic Runic Sigil
          const sigilBob = Math.sin(t * 6) * 3;
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.moveTo(plat.x + plat.width / 2, plat.y - 4 + sigilBob);
          ctx.lineTo(plat.x + 12, plat.y + plat.height - 2);
          ctx.lineTo(plat.x + plat.width - 12, plat.y + plat.height - 2);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'STEAM_VENT': {
          // Holy Geyser / Mana Spring
          if (plat.isActive) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

            for (let i = 0; i < 4; i++) {
              const sx = plat.x + 10 + ((i * 19 + t * 20) % (plat.width - 20));
              const sy = plat.y + plat.height - ((t * 35 + i * 25) % plat.height);
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }

        case 'ACID_POOL': {
          // Dungeon Magma Cauldron / Cursed Blood Pool
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
          break;
        }

        case 'LASER_GATE': {
          // Arcane Sealing Barrier (封印结界)
          if (plat.isActive) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.fillRect(plat.x + 6, plat.y, plat.width - 12, plat.height);
          }
          break;
        }

        case 'POD_DISPENSER': {
          // Ancient Dungeon Golden Treasure Chest (地下城宝箱)
          if (!plat.dispenserOpened) {
            ctx.fillStyle = '#292524';
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

            // Chest lock & golden rims
            ctx.fillStyle = '#eab308';
            ctx.fillRect(plat.x + plat.width / 2 - 4, plat.y + plat.height / 2 - 4, 8, 8);
            ctx.fillRect(plat.x + 4, plat.y + 4, plat.width - 8, 3);
          }
          break;
        }

        case 'END_GATE': {
          // Dungeon Clearance Portal (地下城通关之门)
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

          ctx.font = 'bold 12px "Courier New", monospace';
          ctx.fillStyle = '#6ee7b7';
          ctx.textAlign = 'center';
          ctx.fillText(plat.customLabel || 'GATE >>', plat.x + plat.width / 2, plat.y + plat.height / 2 + 4);
          break;
        }
      }

      ctx.restore();
    });
  }

  // ==========================================
  // 3. AWAKENING SOUL GEMS & POWERUPS
  // ==========================================
  private renderPowerups(powerups: PowerupItem[]) {
    const ctx = this.ctx;

    powerups.forEach(pw => {
      const cy = pw.y + Math.sin(pw.bobAngle) * 5;
      ctx.save();
      ctx.translate(pw.x + pw.width / 2, cy + pw.height / 2);

      let color = '#38bdf8';
      let label = '剑';

      switch (pw.type) {
        case 'FLIGHT':
          color = '#38bdf8';
          label = '神'; // 剑神
          break;
        case 'INVINCIBLE':
          color = '#ef4444';
          label = '狂'; // 狂战士
          break;
        case 'HEAVY_PLASMA':
          color = '#eab308';
          label = '修'; // 阿修罗
          break;
        case 'SPREAD':
          color = '#a855f7';
          label = '泣'; // 鬼泣
          break;
        case 'HEALTH':
          color = '#10b981';
          label = '血';
          break;
        case 'ENERGY':
          color = '#f59e0b';
          label = '魔';
          break;
        case 'LIFE':
          color = '#fbbf24';
          label = '命';
          break;
      }

      // Runic Soul Gem Diamond
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(16, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(-16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Symbol
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 0);

      ctx.restore();
    });
  }

  // ==========================================
  // 4. DUNGEON MONSTERS (DNF ENEMY CLASSES)
  // ==========================================
  private renderEnemies(enemies: Enemy[]) {
    const ctx = this.ctx;
    const t = this.animTick * 0.06;

    enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
      ctx.scale(e.facing, 1);

      if (e.isGlitching > 0) {
        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
      }

      switch (e.type) {
        case 'RIOT_CLEANER': {
          // 巨斧牛头护卫 (Tau Guard with Tower Shield & Battleaxe)
          ctx.fillStyle = '#451a03';
          ctx.fillRect(-16, -24, 28, 48);

          // Bull Horns
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(-10, -24);
          ctx.lineTo(-20, -36);
          ctx.lineTo(-4, -28);
          ctx.moveTo(4, -28);
          ctx.lineTo(20, -36);
          ctx.lineTo(10, -24);
          ctx.fill();

          // Spiked Steel Tower Shield
          if (e.shieldActive) {
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.fillRect(8, -26, 12, 52);
            ctx.strokeRect(8, -26, 12, 52);
            // Shield Spikes
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(20, -15, 6, 6);
            ctx.fillRect(20, 10, 6, 6);
          }
          break;
        }

        case 'CYBER_SNIPER': {
          // 烈焰彼诺修幻影 / 魔法师 (Fire Mage Phantom)
          ctx.fillStyle = '#831843';
          ctx.fillRect(-12, -22, 24, 44);

          // Pointy Witch/Wizard Hat
          ctx.fillStyle = '#be123c';
          ctx.beginPath();
          ctx.moveTo(-18, -20);
          ctx.lineTo(0, -42);
          ctx.lineTo(18, -20);
          ctx.closePath();
          ctx.fill();

          // Fire Magic Staff
          ctx.fillStyle = '#78350f';
          ctx.fillRect(10, -24, 4, 48);
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(12, -28, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Laser Aim Line
          if (e.aimLaserAngle !== undefined && (e.aimProgress || 0) > 0.3) {
            ctx.save();
            ctx.strokeStyle = `rgba(239, 68, 68, ${e.aimProgress})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(12, -28);
            ctx.lineTo(12 + Math.cos(e.aimLaserAngle) * 500, -28 + Math.sin(e.aimLaserAngle) * 500);
            ctx.stroke();
            ctx.restore();
          }
          break;
        }

        case 'NEO_NINJA': {
          // 暗咒暗杀猫妖 / 影武者 (Shadow Stalker Ninja)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-10, -20, 20, 40);

          // Glowing Purple Scarf & Claws
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-4, -12);
          ctx.lineTo(-20 + Math.sin(t * 6) * 3, -6);
          ctx.stroke();

          // Glowing Purple Eyes
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(2, -16, 6, 4);
          break;
        }

        case 'AERO_HARPY':
        case 'SURVEILLANCE_DRONE': {
          // 天空之城翼魔 / 石像鬼 (Gargoyle Sky Demon)
          ctx.fillStyle = '#334155';
          ctx.fillRect(-10, -10, 20, 20);

          // Stone Demon Wings
          const wingFlap = Math.sin(t * 8) * 0.35;
          ctx.save();
          ctx.rotate(wingFlap);
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(-16, -8);
          ctx.lineTo(20, 0);
          ctx.lineTo(-16, 8);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Glowing Red Eye
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(4, -4, 5, 5);
          break;
        }

        case 'DEEP_JELLY': {
          // 暗黑电光水母 (Electric Mana Jelly)
          ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.arc(0, -8, 15, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Tentacles
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 6, 0);
            ctx.lineTo(i * 6 + Math.sin(t * 3 + i) * 4, 16);
            ctx.stroke();
          }
          break;
        }

        case 'DRILL_BOT': {
          // 岩穴掘地魔虫 (Burrowing Rock Worm)
          ctx.fillStyle = '#292524';
          ctx.fillRect(-16, -14, 24, 28);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(8, -12);
          ctx.lineTo(24, 0);
          ctx.lineTo(8, 12);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'TURRET_ORB': {
          // 悬空城激光魔眼 (Laser Beholder)
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Central Eye
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(4, 0, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        default: {
          // 哥布林投石兵 (Goblin Hurler)
          ctx.fillStyle = '#15803d'; // Goblin Green Skin
          ctx.fillRect(-10, -18, 20, 36);

          // Leather Cap
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-12, -22, 24, 8);

          // Wooden Club / Throwing Stone
          ctx.fillStyle = '#451a03';
          ctx.fillRect(8, -6, 12, 6);
          break;
        }
      }

      ctx.restore();
    });
  }

  // ==========================================
  // 5. FOUR EPIC DUNGEON BOSSES
  // ==========================================
  private renderBoss(boss: Boss) {
    const ctx = this.ctx;
    const t = this.animTick * 0.05;
    const cx = boss.x + boss.width / 2;
    const cy = boss.y + boss.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(boss.facing, 1);

    const bType: BossArchetype = boss.bossType || 'TITAN';

    if (bType === 'TITAN') {
      // 1. 牛头王萨乌塔 (TAU KING SHAUTA)
      ctx.save();
      // Massive Minotaur Body
      ctx.fillStyle = boss.phase === 3 ? '#7f1d1d' : '#451a03';
      ctx.fillRect(-50, -70, 100, 140);

      // Golden Battle Horns
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(-35, -70);
      ctx.lineTo(-75, -115);
      ctx.lineTo(-20, -85);
      ctx.moveTo(35, -70);
      ctx.lineTo(75, -115);
      ctx.lineTo(20, -85);
      ctx.fill();

      // Giant Double-sided Battleaxe
      ctx.fillStyle = '#78716c';
      ctx.fillRect(40, -100, 12, 180);
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      // Axe Blade
      ctx.beginPath();
      ctx.arc(46, -60, 45, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(46, -60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing Furious Red Eyes
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(-22, -45, 14, 8);
      ctx.fillRect(8, -45, 14, 8);
      ctx.shadowBlur = 0;

      ctx.restore();

    } else if (bType === 'WYRM') {
      // 2. 狂龙赫斯 (FURIOUS MAGMA DRAGON HEISS)
      if (boss.segments) {
        boss.segments.forEach((seg, idx) => {
          ctx.save();
          ctx.translate(seg.x - cx, seg.y - cy);
          ctx.rotate(seg.angle);

          ctx.fillStyle = idx % 2 === 0 ? '#450a0a' : '#7f1d1d';
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, seg.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Dragon Bone Spines
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-3, -seg.size - 8, 6, 8);
          ctx.restore();
        });
      }

      // Dragon Horned Head
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();

      // Dragon Maw & Molten Fire
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(15, -10, 20, 20);

    } else if (bType === 'KRAKEN') {
      // 3. 第八使徒 · 长脚罗特斯 (APOSTLE LOTUS)
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;

      // Lotus Mantle
      ctx.beginPath();
      ctx.arc(0, -25, 55, Math.PI, 0);
      ctx.lineTo(45, 35);
      ctx.lineTo(-45, 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Giant Apostle Psychic Eye
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, -15, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.arc(0, -15, 10, 0, Math.PI * 2);
      ctx.fill();

      // Giant Waving Suction Tentacles
      for (let i = -3; i <= 3; i++) {
        const tx = i * 14;
        const wave = Math.sin(t * 3 + i) * 18;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(tx, 35);
        ctx.quadraticCurveTo(tx + wave, 85, tx - wave, 135);
        ctx.stroke();
      }

    } else {
      // 4. 光之城主 · 赛格哈特 (LORD OF LIGHT SIEGHEART)
      ctx.save();

      // Radiant 6 Light Wings
      for (let w = 0; w < 3; w++) {
        const wingAngle = Math.sin(t * 3 + w) * 0.2 + (w - 1) * 0.4;
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.scale(side, 1);
          ctx.rotate(wingAngle);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-10, -20);
          ctx.lineTo(-75 - w * 12, -55 - w * 18);
          ctx.lineTo(-45, 0);
          ctx.lineTo(-85, 30);
          ctx.lineTo(-15, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      // Golden Armor Body
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.fillRect(-15, -45, 30, 60);
      ctx.strokeRect(-15, -45, 30, 60);

      // Dual Holy Light Sabers
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-20, -10);
      ctx.lineTo(-50, 60);
      ctx.moveTo(20, -10);
      ctx.lineTo(50, 60);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================
  // 6. HERO: 鬼剑士 (SLAYER / ARAD CHAMPION)
  // ==========================================
  private renderPlayer(p: Player) {
    const ctx = this.ctx;
    const t = this.animTick * 0.06;
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    // Afterimage Ghost Trail (鬼影步残像)
    p.trail.forEach(tr => {
      ctx.save();
      ctx.globalAlpha = tr.alpha * 0.5;
      ctx.translate(tr.x + p.width / 2, tr.y + p.height / 2);
      ctx.scale(tr.facing, 1);
      ctx.fillStyle = tr.form === 'INVINCIBLE' ? '#ef4444' : '#64748b';
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    });

    // Hurt flicker
    if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer * 15) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(p.facing, 1);

    // Form: 剑神 (Blade Master) Orbiting Ethereal Swords (万剑归宗)
    if (p.stats.form === 'FLIGHT') {
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const bladeAngle = t * 3 + (i * Math.PI * 2) / 5;
        const bx = Math.cos(bladeAngle) * 36;
        const by = Math.sin(bladeAngle) * 22;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx - 8, by - 14);
        ctx.lineTo(bx + 8, by + 14);
        ctx.stroke();
      }
      ctx.restore();
    } else if (p.stats.form === 'INVINCIBLE') {
      // Form: 狂战士 (Berserker) Raging Blood Aura (血之狂暴)
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 32 + Math.sin(t * 5) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const isCrouching = p.isCrouching;
    const isRunning = p.state === 'run';
    const runCycle = Math.sin(p.animationFrame * 0.4) * 7;

    // 1. Slayer Boots & Trousers
    const legY = isCrouching ? 8 : 12;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8 + (isRunning ? -runCycle : 0), legY, 6, 16);
    ctx.fillRect(2 + (isRunning ? runCycle : 0), legY, 6, 16);

    // 2. Slayer Gothic Combat Coat (Dark Grey with Crimson Lining)
    const torsoY = isCrouching ? -6 : -14;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, torsoY, 20, isCrouching ? 14 : 22);
    // Crimson Scarf / Trim
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-10, torsoY, 4, isCrouching ? 14 : 22);

    // 3. Slayer Head & Silver-White Spiky Hair
    const headY = isCrouching ? -18 : -28;
    // Face
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(-6, headY + 2, 12, 12);

    // Red Headband
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-7, headY + 2, 14, 3);

    // Silver-White Spiky Hair
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-8, headY - 4, 16, 7);
    ctx.fillRect(-12 + Math.sin(t * 4) * 3, headY - 1, 6, 10);

    // 4. Demonic Red Cursed Left Arm (鬼手!)
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 6;
    ctx.fillRect(-12, torsoY + 4, 5, 14);
    ctx.shadowBlur = 0;

    // 5. Giant Zanbato Sword (泰拉石巨剑 / 鬼剑)
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(4, torsoY + 4, 22, 7);
    ctx.strokeRect(4, torsoY + 4, 22, 7);

    ctx.restore();
  }

  // ==========================================
  // 7. SWORD WAVES & PROJECTILES RENDERING
  // ==========================================
  private renderProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    projectiles.forEach(pr => {
      ctx.save();

      // Render Trail
      pr.trail.forEach((tr, idx) => {
        ctx.fillStyle = tr.color;
        ctx.globalAlpha = (idx / pr.trail.length) * 0.4;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, tr.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = pr.color;

      switch (pr.type) {
        case 'plasma_beam':
          // Giant Asura Wave Slash (修罗邪光斩)
          ctx.beginPath();
          ctx.arc(pr.x + pr.width / 2, pr.y + pr.height / 2, pr.width / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'spread_bullet':
          // Ghost Fire (冥炎之卡洛)
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(pr.x + pr.width / 2, pr.y + pr.height / 2, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'boss_energy_ball':
        case 'magma_blob':
        case 'torpedo':
          ctx.beginPath();
          ctx.arc(pr.x + pr.width / 2, pr.y + pr.height / 2, pr.width / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        default:
          // Crescent Sword Wave Slash (波动剑斩击)
          ctx.fillStyle = pr.color;
          ctx.fillRect(pr.x, pr.y, pr.width, pr.height);
          break;
      }

      ctx.restore();
    });
  }

  // ==========================================
  // 8. PARTICLES & FLOATING DAMAGE NUMBERS
  // ==========================================
  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;

    particles.forEach(pt => {
      ctx.save();
      const alpha = pt.life / pt.maxLife;
      ctx.globalAlpha = alpha;

      if (pt.type === 'text' && pt.text) {
        ctx.font = 'bold 15px "Segoe UI", sans-serif';
        ctx.fillStyle = pt.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(pt.text, pt.x, pt.y);
      } else if (pt.type === 'ring') {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }

      ctx.restore();
    });
  }

  // ==========================================
  // 9. CLEAN GOTHIC VIGNETTE & CRT OPTION
  // ==========================================
  private renderVignette(cw: number, ch: number) {
    const ctx = this.ctx;
    ctx.save();
    const vigGrad = ctx.createRadialGradient(cw / 2, ch / 2, cw * 0.45, cw / 2, ch / 2, cw * 0.75);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }

  private renderGothicCRTOverlay(cw: number, ch: number) {
    const ctx = this.ctx;
    ctx.save();
    // Very gentle scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let y = 0; y < ch; y += 4) {
      ctx.fillRect(0, y, cw, 1);
    }
    this.renderVignette(cw, ch);
    ctx.restore();
  }
}
