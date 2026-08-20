/**
 * Vaporwave 2D Action Platformer Game Engine & Physics Loop
 * Supports 10 Themed Stages with 4 Biomes (City, Underground, Ocean, Sky)
 * 4 Unique Boss Archetypes (Titan, Wyrm, Kraken, Valkyrie) & 9 Enemy Classes
 */

import { Player, Projectile, Enemy, Boss, PowerupItem, Particle, LevelData, GameSettings, ControlsState, FormType, Vector2D } from './types';
import { sound } from './audio';
import { generateLevel } from './levelGenerator';

export class GameEngine {
  public player: Player;
  public level: LevelData;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public cameraX: number = 0;
  public cameraY: number = 0;
  public screenShake = { x: 0, y: 0, intensity: 0 };
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public isBossDefeated: boolean = false;
  public isPaused: boolean = false;
  public settings: GameSettings;

  private gravity: number = 0.65;
  private maxFallSpeed: number = 14;
  private projectileIdCounter: number = 0;
  private enemyIdCounter: number = 0;
  private onStateChangeCallback?: () => void;

  constructor(settings: GameSettings, onStateChange?: () => void) {
    this.settings = settings;
    this.onStateChangeCallback = onStateChange;
    this.level = generateLevel(1);
    this.player = this.createInitialPlayer(this.level.startPoint);
  }

  private createInitialPlayer(startPos: Vector2D): Player {
    return {
      x: startPos.x,
      y: startPos.y,
      width: 32,
      height: 48,
      vx: 0,
      vy: 0,
      facing: 1,
      aimDirection: { x: 1, y: 0 },
      isGrounded: false,
      isCrouching: false,
      isDashing: false,
      dashCooldown: 0,
      dashDuration: 0,
      invincibleTimer: 0,
      jumpCount: 0,
      maxJumps: 2,
      stats: {
        hp: 100,
        maxHp: 100,
        lives: 3,
        energy: 0,
        score: 0,
        combo: 0,
        comboTimer: 0,
        form: 'DEFAULT',
        formTimeLeft: 0,
        formDuration: 20
      },
      trail: [],
      shootCooldown: 0,
      flightFuel: 100,
      animationFrame: 0,
      state: 'idle'
    };
  }

  public get camera() {
    return { x: this.cameraX, y: this.cameraY };
  }

  public resetGame(startLevel: number = 1) {
    this.restartGame(startLevel);
  }

  public loadLevel(levelNum: number) {
    this.selectLevel(levelNum);
  }

  public restartGame(startLevel: number = 1) {
    this.isGameOver = false;
    this.isVictory = false;
    this.isBossDefeated = false;
    this.projectiles = [];
    this.particles = [];
    this.level = generateLevel(startLevel);
    this.player = this.createInitialPlayer(this.level.startPoint);
    sound.startBGM(this.level.boss ? 'boss' : 'stage');
    this.notifyStateChange();
  }

  public selectLevel(levelNum: number) {
    const currentScore = this.player.stats.score;
    const currentLives = Math.max(3, this.player.stats.lives);
    this.isGameOver = false;
    this.isVictory = false;
    this.isBossDefeated = false;
    this.projectiles = [];
    this.particles = [];
    this.level = generateLevel(levelNum);
    this.player = this.createInitialPlayer(this.level.startPoint);
    this.player.stats.score = currentScore;
    this.player.stats.lives = currentLives;

    if (this.level.boss) {
      sound.playBossWarning();
      sound.startBGM('boss');
    } else {
      sound.startBGM('stage');
    }
    this.notifyStateChange();
  }

  public nextLevel() {
    const nextLevelNum = this.level.levelNumber + 1;
    const currentStats = { ...this.player.stats };
    this.projectiles = [];
    this.particles = [];
    this.level = generateLevel(nextLevelNum);
    this.player = this.createInitialPlayer(this.level.startPoint);
    this.player.stats = currentStats; // Retain score, lives, energy
    // Bonus HP on level clear
    this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + 40);

    if (this.level.boss) {
      sound.playBossWarning();
      sound.startBGM('boss');
    } else {
      sound.startBGM('stage');
    }
    this.notifyStateChange();
  }

  public setForm(form: FormType, durationSec: number = 20) {
    this.player.stats.form = form;
    this.player.stats.formTimeLeft = durationSec;
    this.player.stats.formDuration = durationSec;
    sound.playPowerup();

    // Create burst of transformation particles
    const color = form === 'FLIGHT' ? '#00f0ff' : form === 'INVINCIBLE' ? '#ffe600' : form === 'HEAVY_PLASMA' ? '#ff0055' : '#b026ff';
    this.spawnRadialParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, color, 30);
    this.spawnFloatingText(this.player.x, this.player.y - 20, `[ ${form} FORM ]`, color);
    this.notifyStateChange();
  }

  // --- MAIN GAME LOOP TICK ---
  public update(controls: ControlsState, viewWidth: number, viewHeight: number) {
    if (this.isPaused || this.isGameOver) return;

    const p = this.player;

    // 1. Update Combo Timer
    if (p.stats.comboTimer > 0) {
      p.stats.comboTimer -= 1 / 60;
      if (p.stats.comboTimer <= 0) {
        p.stats.combo = 0;
      }
    }

    // 2. Update Form Timer
    if (p.stats.form !== 'DEFAULT') {
      p.stats.formTimeLeft -= 1 / 60;
      if (p.stats.formTimeLeft <= 0) {
        p.stats.form = 'DEFAULT';
        this.spawnFloatingText(p.x, p.y - 20, 'FORM EXPIRED', '#8888aa');
      }
    }

    // 3. Update Timers & Cooldowns
    if (p.invincibleTimer > 0) p.invincibleTimer -= 1 / 60;
    if (p.dashCooldown > 0) p.dashCooldown -= 1 / 60;
    if (p.shootCooldown > 0) p.shootCooldown--;

    // 4. Screen Shake decay
    if (this.screenShake.intensity > 0) {
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.intensity *= 0.88;
      if (this.screenShake.intensity < 0.3) {
        this.screenShake.intensity = 0;
        this.screenShake.x = 0;
        this.screenShake.y = 0;
      }
    }

    // 5. Handle Player Movement & Physics
    this.updatePlayerPhysics(controls);

    // 6. Handle Player Actions (Shooting & Super Nova)
    this.updatePlayerActions(controls);

    // 7. Update Traps & Interactive Platforms
    this.updatePlatforms();

    // 8. Update Enemies
    this.updateEnemies();

    // 9. Update Boss (if present)
    if (this.level.boss) {
      this.updateBoss();
    }

    // 10. Update Projectiles & Collisions
    this.updateProjectiles();

    // 11. Update Powerup Items
    this.updatePowerupItems();

    // 12. Update Particles
    this.updateParticles();

    // 13. Update Camera
    this.updateCamera(viewWidth, viewHeight);

    // 14. Check Level Clear / Pitfall Death
    if (p.y > this.level.height + 100) {
      this.handlePlayerDeath('Fell into the Cyber Void');
    }
  }

  // --- PLAYER PHYSICS & CONTROLS ---
  private updatePlayerPhysics(controls: ControlsState) {
    const p = this.player;
    const isFlight = p.stats.form === 'FLIGHT';
    const isInvincible = p.stats.form === 'INVINCIBLE';
    const moveSpeed = isInvincible ? 8.5 : 6.0;
    const gravMult = this.level.gravityMultiplier || 1.0;

    // Crouch handling
    p.isCrouching = controls.down && p.isGrounded && !controls.left && !controls.right;

    // Aiming Direction Calculation (8-directional Contra style)
    let aimX = controls.right ? 1 : controls.left ? -1 : 0;
    let aimY = controls.up ? -1 : controls.down ? 1 : 0;

    if (aimX === 0 && aimY === 0) {
      aimX = p.facing;
    }

    const mag = Math.sqrt(aimX * aimX + aimY * aimY) || 1;
    p.aimDirection = { x: aimX / mag, y: aimY / mag };

    // Facing direction
    if (controls.right && !p.isCrouching) p.facing = 1;
    if (controls.left && !p.isCrouching) p.facing = -1;

    // DASH / TELEPORT SKILL (with i-frames)
    if (controls.dashPressed && p.dashCooldown <= 0 && !p.isDashing) {
      p.isDashing = true;
      p.dashDuration = 14; // frames
      p.dashCooldown = 0.8;
      p.invincibleTimer = 0.35;
      sound.playDash();
      this.addScreenShake(3);

      const dashDir = controls.left ? -1 : controls.right ? 1 : p.facing;
      p.vx = dashDir * 16;
      p.vy = isFlight ? (controls.up ? -12 : controls.down ? 12 : 0) : 0;
    }

    // Handle Active Dash
    if (p.isDashing) {
      p.dashDuration--;
      // Add Trail
      p.trail.push({
        x: p.x,
        y: p.y,
        alpha: 0.8,
        form: p.stats.form,
        facing: p.facing
      });

      if (p.dashDuration <= 0) {
        p.isDashing = false;
        p.vx *= 0.4;
      }
    } else {
      // Normal Horizontal Movement
      if (!p.isCrouching) {
        if (controls.right) {
          p.vx = moveSpeed;
        } else if (controls.left) {
          p.vx = -moveSpeed;
        } else {
          p.vx *= 0.7; // friction
        }
      } else {
        p.vx *= 0.5;
      }

      // Sky wind drift
      if (this.level.windSpeed) {
        p.vx += this.level.windSpeed * 0.15;
      }

      // Vertical Movement: Flight Mode vs Standard Platformer Gravity
      if (isFlight) {
        if (controls.up) {
          p.vy = -6.5;
        } else if (controls.down) {
          p.vy = 6.5;
        } else {
          p.vy *= 0.8;
        }
      } else {
        // Apply Gravity (adjusted for underwater buoyancy)
        p.vy += this.gravity * gravMult;
        const currentMaxFall = this.maxFallSpeed * gravMult;
        if (p.vy > currentMaxFall) p.vy = currentMaxFall;

        // Jump & Double Jump
        if (controls.jumpPressed) {
          const jumpImpulse = this.level.biome === 'underwater' ? -15.5 : -14.2;
          if (p.isGrounded) {
            p.vy = jumpImpulse;
            p.isGrounded = false;
            p.jumpCount = 1;
            sound.playJump();
          } else if (p.jumpCount < p.maxJumps) {
            p.vy = jumpImpulse * 0.92;
            p.jumpCount++;
            sound.playJump();
            this.spawnRadialParticles(p.x + p.width / 2, p.y + p.height, '#00f0ff', 10);
          }
        }
      }
    }

    // Update Player Trail decay
    p.trail.forEach(t => (t.alpha -= 0.08));
    p.trail = p.trail.filter(t => t.alpha > 0);

    // Apply Velocity with Platform Collision
    this.movePlayerWithCollision();

    // Update Animation State
    p.animationFrame++;
    if (p.isDashing) p.state = 'dash';
    else if (isFlight) p.state = 'flight';
    else if (!p.isGrounded && p.vy < 0) p.state = 'jump';
    else if (!p.isGrounded && p.vy >= 0) p.state = 'fall';
    else if (p.isCrouching) p.state = 'crouch';
    else if (Math.abs(p.vx) > 0.8) p.state = 'run';
    else p.state = 'idle';
  }

  // --- COLLISION RESOLUTION FOR PLAYER ---
  private movePlayerWithCollision() {
    const p = this.player;

    // Horizontal Movement
    p.x += p.vx;
    // Boundary check left
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }

    // Solid wall collisions
    for (const plat of this.level.platforms) {
      if (plat.type === 'SOLID' && this.checkRectOverlap(p, plat)) {
        if (p.vx > 0) {
          p.x = plat.x - p.width;
        } else if (p.vx < 0) {
          p.x = plat.x + plat.width;
        }
        p.vx = 0;
      }
    }

    // Vertical Movement
    p.y += p.vy;
    p.isGrounded = false;

    for (const plat of this.level.platforms) {
      if (!this.checkRectOverlap(p, plat)) continue;

      if (plat.type === 'SOLID') {
        if (p.vy >= 0 && p.y + p.height - p.vy <= plat.y + 14) {
          // Landed on top
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.jumpCount = 0;
        } else if (p.vy < 0) {
          // Hit ceiling
          p.y = plat.y + plat.height;
          p.vy = 0;
        }
      } else if (plat.type === 'ONE_WAY' || (plat.type === 'GLITCH' && plat.isActive)) {
        // Only land when falling from above
        if (p.vy >= 0 && p.y + p.height - p.vy <= plat.y + 14) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.jumpCount = 0;
        }
      } else if (plat.type === 'JUMP_PAD') {
        if (p.vy >= 0) {
          p.vy = plat.jumpForce || -22;
          p.isGrounded = false;
          p.jumpCount = 0;
          sound.playJumpPad();
          this.addScreenShake(4);
          this.spawnRadialParticles(plat.x + plat.width / 2, plat.y, '#00ffcc', 16);
        }
      } else if (plat.type === 'ACID_POOL') {
        this.damagePlayer(20, 'Corrosive Acid Hazard');
      } else if (plat.type === 'END_GATE') {
        // Reached Level Extraction Portal
        sound.startBGM('victory');
        this.nextLevel();
        return;
      }
    }
  }

  // --- PLAYER ACTIONS (SHOOTING & SUPER NOVA) ---
  private updatePlayerActions(controls: ControlsState) {
    const p = this.player;

    // 1. SUPER NOVA SKILL (Screen wipe ultimate)
    if (controls.novaPressed && p.stats.energy >= 100) {
      p.stats.energy = 0;
      sound.playSuperNova();
      this.addScreenShake(16);

      // Obliterate all enemy projectiles
      this.projectiles = this.projectiles.filter(pr => pr.owner === 'player');

      // Giant explosion shockwave particle
      this.particles.push({
        x: p.x + p.width / 2,
        y: p.y + p.height / 2,
        vx: 0,
        vy: 0,
        color: '#ff007f',
        size: 20,
        life: 40,
        maxLife: 40,
        type: 'ring'
      });

      // Deal massive damage to all onscreen enemies
      this.level.enemies.forEach(e => {
        this.damageEnemy(e, 260);
      });

      if (this.level.boss) {
        this.damageBoss(450);
      }

      this.spawnFloatingText(p.x, p.y - 30, '★ SYNTHWAVE NOVA ★', '#ff00ff');
      this.notifyStateChange();
    }

    // 2. WEAPON SHOOTING
    if (controls.shoot && p.shootCooldown <= 0) {
      this.firePlayerWeapon();
    }
  }

  private firePlayerWeapon() {
    const p = this.player;
    const spawnX = p.x + p.width / 2 + p.aimDirection.x * 20;
    const spawnY = p.y + (p.isCrouching ? 28 : 20) + p.aimDirection.y * 20;

    switch (p.stats.form) {
      case 'HEAVY_PLASMA': {
        // Giant Piercing Plasma Cannon
        p.shootCooldown = 18;
        sound.playShoot('plasma');
        this.addScreenShake(5);

        this.projectiles.push({
          id: `proj_${this.projectileIdCounter++}`,
          x: spawnX - 16,
          y: spawnY - 16,
          width: 32,
          height: 32,
          vx: p.aimDirection.x * 15,
          vy: p.aimDirection.y * 15,
          damage: 120,
          color: '#ff0055',
          owner: 'player',
          type: 'plasma_beam',
          life: 80,
          maxLife: 80,
          penetrating: true,
          trail: []
        });
        break;
      }

      case 'SPREAD': {
        // 5-Way Shotgun Spread
        p.shootCooldown = 14;
        sound.playShoot('spread');

        const baseAngle = Math.atan2(p.aimDirection.y, p.aimDirection.x);
        const spreadOffsets = [-0.35, -0.18, 0, 0.18, 0.35];

        spreadOffsets.forEach(angleOffset => {
          const finalAngle = baseAngle + angleOffset;
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: spawnX - 6,
            y: spawnY - 6,
            width: 12,
            height: 12,
            vx: Math.cos(finalAngle) * 14,
            vy: Math.sin(finalAngle) * 14,
            damage: 32,
            color: '#b026ff',
            owner: 'player',
            type: 'spread_bullet',
            life: 60,
            maxLife: 60,
            trail: []
          });
        });
        break;
      }

      case 'FLIGHT': {
        // Rapid Twin Blasters + Homing Micro-Missiles
        p.shootCooldown = 7;
        sound.playShoot('standard');

        // Main Blaster
        this.projectiles.push({
          id: `proj_${this.projectileIdCounter++}`,
          x: spawnX - 5,
          y: spawnY - 5,
          width: 14,
          height: 8,
          vx: p.aimDirection.x * 16,
          vy: p.aimDirection.y * 16,
          damage: 28,
          color: '#00f0ff',
          owner: 'player',
          type: 'standard',
          life: 65,
          maxLife: 65,
          trail: []
        });

        // Fire homing missile every 3rd shot
        if (p.animationFrame % 3 === 0) {
          const nearestEnemy = this.findNearestEnemy(p.x, p.y);
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: spawnX,
            y: spawnY - 12,
            width: 16,
            height: 8,
            vx: p.aimDirection.x * 8 + (Math.random() - 0.5) * 4,
            vy: -8,
            damage: 45,
            color: '#00ffcc',
            owner: 'player',
            type: 'homing_missile',
            targetEnemyId: nearestEnemy ? nearestEnemy.id : undefined,
            life: 90,
            maxLife: 90,
            trail: []
          });
        }
        break;
      }

      case 'INVINCIBLE': {
        // High-frequency Gold Lasers
        p.shootCooldown = 6;
        sound.playShoot('standard');

        this.projectiles.push({
          id: `proj_${this.projectileIdCounter++}`,
          x: spawnX - 7,
          y: spawnY - 7,
          width: 20,
          height: 10,
          vx: p.aimDirection.x * 18,
          vy: p.aimDirection.y * 18,
          damage: 50,
          color: '#ffe600',
          owner: 'player',
          type: 'standard',
          life: 65,
          maxLife: 65,
          trail: []
        });
        break;
      }

      default: {
        // Standard Rapid Cyan Blaster
        p.shootCooldown = 9;
        sound.playShoot('standard');

        this.projectiles.push({
          id: `proj_${this.projectileIdCounter++}`,
          x: spawnX - 6,
          y: spawnY - 6,
          width: 14,
          height: 8,
          vx: p.aimDirection.x * 14,
          vy: p.aimDirection.y * 14,
          damage: 30,
          color: '#00f0ff',
          owner: 'player',
          type: 'standard',
          life: 55,
          maxLife: 55,
          trail: []
        });
        break;
      }
    }
  }

  // --- TRAPS & INTERACTIVE PLATFORMS ---
  private updatePlatforms() {
    const p = this.player;

    this.level.platforms.forEach(plat => {
      // Glitch Platform Blinking
      if (plat.type === 'GLITCH' && plat.period) {
        plat.timer = ((plat.timer || 0) + 1) % plat.period;
        plat.isActive = plat.timer < plat.period * 0.65;
      }

      // Steam / Water Bubble Vent Updraft
      if (plat.type === 'STEAM_VENT') {
        plat.timer = ((plat.timer || 0) + 1) % (plat.period || 120);
        plat.isActive = plat.timer < 95;

        if (plat.isActive && this.checkRectOverlap(p, plat)) {
          p.vy = -14; // Boost player up
          p.isGrounded = false;
        }
      }

      // Laser Gate Hazard Damage
      if (plat.type === 'LASER_GATE') {
        plat.timer = ((plat.timer || 0) + 1) % (plat.period || 180);
        plat.isActive = plat.timer < 110;

        if (plat.isActive && this.checkRectOverlap(p, plat)) {
          this.damagePlayer(25, 'Electrocuted by Laser Gate');
        }
      }
    });
  }

  // --- ENEMIES UPDATE & BEHAVIOR AI ---
  private updateEnemies() {
    const p = this.player;

    this.level.enemies.forEach(e => {
      e.stateTimer++;
      if (e.isGlitching > 0) e.isGlitching--;

      // Face towards player
      e.facing = p.x < e.x ? -1 : 1;

      switch (e.type) {
        case 'AERO_HARPY': {
          // Sky Biome: Swoops in sinusoidal waves and fires feather blades
          e.x += e.vx;
          e.y += Math.sin(e.stateTimer * 0.08) * 3.5;
          if (Math.abs(e.x - p.x) > 650) {
            e.vx = e.x > p.x ? -2.5 : 2.5;
          }

          e.attackCooldown--;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 400) {
            e.attackCooldown = 90;
            sound.playShoot('spread');
            // Fan of 3 feather blades
            for (let i = -1; i <= 1; i++) {
              const angle = Math.atan2(p.y - e.y, p.x - e.x) + i * 0.22;
              this.projectiles.push({
                id: `proj_${this.projectileIdCounter++}`,
                x: e.x + e.width / 2,
                y: e.y + e.height / 2,
                width: 14,
                height: 10,
                vx: Math.cos(angle) * 7.5,
                vy: Math.sin(angle) * 7.5,
                damage: 22,
                color: '#38bdf8',
                owner: 'enemy',
                type: 'feather_blade',
                life: 90,
                maxLife: 90,
                trail: []
              });
            }
          }
          break;
        }

        case 'DEEP_JELLY': {
          // Ocean Biome: Drifts vertically in water, radiates pulsing electric ring
          e.y += Math.sin(e.stateTimer * 0.05) * 1.8;
          e.x += (Math.random() - 0.5) * 0.8;

          e.attackCooldown--;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 320) {
            e.attackCooldown = 120;
            // Radiate 4 lightning bolts
            for (let i = 0; i < 4; i++) {
              const ang = (i * Math.PI * 2) / 4 + e.stateTimer * 0.05;
              this.projectiles.push({
                id: `proj_${this.projectileIdCounter++}`,
                x: e.x + e.width / 2,
                y: e.y + e.height / 2,
                width: 12,
                height: 12,
                vx: Math.cos(ang) * 4.5,
                vy: Math.sin(ang) * 4.5,
                damage: 20,
                color: '#00ffcc',
                owner: 'enemy',
                type: 'lightning_bolt',
                life: 90,
                maxLife: 90,
                trail: []
              });
            }
          }
          break;
        }

        case 'DRILL_BOT': {
          // Underground Biome: Ground burrows, dashes at high speed, spits molten sparks
          e.x += e.vx;
          if (Math.abs(e.x - p.x) < 260 && Math.abs(e.y - p.y) < 80) {
            e.vx = (p.x < e.x ? -3.8 : 3.8);
          }

          e.attackCooldown--;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 300) {
            e.attackCooldown = 110;
            const dir = p.x < e.x ? -1 : 1;
            this.projectiles.push({
              id: `proj_${this.projectileIdCounter++}`,
              x: e.x + (dir === 1 ? e.width : 0),
              y: e.y + 14,
              width: 16,
              height: 16,
              vx: dir * 6,
              vy: -5,
              damage: 26,
              color: '#ffaa00',
              owner: 'enemy',
              type: 'magma_blob',
              life: 80,
              maxLife: 80,
              trail: []
            });
          }
          break;
        }

        case 'NEO_NINJA': {
          // Underground/Matrix: Teleports and throws triple cyber shurikens
          e.attackCooldown--;
          if (e.attackCooldown <= 0) {
            e.attackCooldown = 110;
            // Teleport near player
            e.x = p.x + (Math.random() > 0.5 ? 200 : -200);
            e.isGlitching = 15;
            sound.playDash();

            // Fire 3 shurikens
            for (let i = -1; i <= 1; i++) {
              const ang = Math.atan2(p.y - e.y, p.x - e.x) + i * 0.2;
              this.projectiles.push({
                id: `proj_${this.projectileIdCounter++}`,
                x: e.x + e.width / 2,
                y: e.y + e.height / 2,
                width: 14,
                height: 14,
                vx: Math.cos(ang) * 8,
                vy: Math.sin(ang) * 8,
                damage: 24,
                color: '#ec4899',
                owner: 'enemy',
                type: 'standard',
                life: 70,
                maxLife: 70,
                trail: []
              });
            }
          }
          break;
        }

        case 'SURVEILLANCE_DRONE': {
          e.x += e.vx;
          e.y += Math.sin(e.stateTimer * 0.05) * 1.5;

          if (Math.abs(e.x - p.x) > 600) {
            e.vx = e.x > p.x ? -2 : 2;
          }

          e.attackCooldown--;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 250) {
            e.attackCooldown = 110;
            this.projectiles.push({
              id: `proj_${this.projectileIdCounter++}`,
              x: e.x + e.width / 2 - 6,
              y: e.y + e.height,
              width: 12,
              height: 12,
              vx: (Math.random() - 0.5) * 2,
              vy: 5,
              damage: 20,
              color: '#ff0055',
              owner: 'enemy',
              type: 'standard',
              life: 80,
              maxLife: 80,
              trail: []
            });
          }
          break;
        }

        case 'GLITCH_WALKER': {
          e.x += e.vx;
          if (Math.random() < 0.01) e.vx *= -1;

          e.attackCooldown--;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 450) {
            e.attackCooldown = 130;
            const dir = p.x < e.x ? -1 : 1;
            this.projectiles.push({
              id: `proj_${this.projectileIdCounter++}`,
              x: e.x + (dir === 1 ? e.width : 0),
              y: e.y + 12,
              width: 16,
              height: 10,
              vx: dir * 7,
              vy: -2,
              damage: 25,
              color: '#ff007f',
              owner: 'enemy',
              type: 'bouncing_vhs',
              bouncesLeft: 3,
              life: 140,
              maxLife: 140,
              trail: []
            });
          }
          break;
        }

        case 'RIOT_CLEANER': {
          e.x += e.vx;
          e.attackCooldown--;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 280) {
            e.attackCooldown = 160;
            const dir = p.x < e.x ? -1 : 1;
            for (let i = 0; i < 3; i++) {
              this.projectiles.push({
                id: `proj_${this.projectileIdCounter++}`,
                x: e.x + (dir === 1 ? e.width : 0),
                y: e.y + 10 + i * 12,
                width: 22,
                height: 14,
                vx: dir * (5 + i),
                vy: (Math.random() - 0.5) * 2,
                damage: 28,
                color: '#ffe600',
                owner: 'enemy',
                type: 'flame_wave',
                life: 60,
                maxLife: 60,
                trail: []
              });
            }
          }
          break;
        }

        case 'CYBER_SNIPER': {
          e.attackCooldown--;
          const dx = p.x - e.x;
          const dy = p.y - e.y;
          e.aimLaserAngle = Math.atan2(dy, dx);

          if (e.attackCooldown < 50) {
            e.aimProgress = (50 - e.attackCooldown) / 50;
          }

          if (e.attackCooldown <= 0) {
            e.attackCooldown = 150;
            e.aimProgress = 0;
            sound.playShoot('plasma');

            const speed = 18;
            this.projectiles.push({
              id: `proj_${this.projectileIdCounter++}`,
              x: e.x + (e.facing === 1 ? e.width : 0),
              y: e.y + 12,
              width: 24,
              height: 6,
              vx: Math.cos(e.aimLaserAngle) * speed,
              vy: Math.sin(e.aimLaserAngle) * speed,
              damage: 45,
              color: '#ff0055',
              owner: 'enemy',
              type: 'sniper_beam',
              penetrating: true,
              life: 80,
              maxLife: 80,
              trail: []
            });
          }
          break;
        }

        case 'NEON_SLIME': {
          if (e.stateTimer % 60 === 0) {
            e.vy = -8;
            e.vx = (p.x < e.x ? -3 : 3);
          }
          e.vy += 0.4;
          e.y += e.vy;
          e.x += e.vx;
          if (e.y > 730) {
            e.y = 730;
            e.vy = 0;
            e.vx = 0;
          }
          break;
        }
      }

      // Touch Damage to Player (or destroy enemy if player in INVINCIBLE form!)
      if (this.checkRectOverlap(p, e)) {
        if (p.stats.form === 'INVINCIBLE') {
          this.damageEnemy(e, 999);
        } else {
          this.damagePlayer(15, `Collided with ${e.type}`);
        }
      }
    });

    // Remove dead enemies
    this.level.enemies = this.level.enemies.filter(e => e.hp > 0);
  }

  // --- MULTI-ARCHETYPE BOSS AI ---
  private updateBoss() {
    const boss = this.level.boss;
    if (!boss || boss.hp <= 0) return;

    boss.attackTimer--;
    boss.floatingAngle += 0.04;

    // Check Phases
    const hpRatio = boss.hp / boss.maxHp;
    if (hpRatio < 0.33 && boss.phase < 3) {
      boss.phase = 3;
      boss.glitchIntensity = 0.9;
      this.addScreenShake(14);
      sound.playBossWarning();
      this.spawnFloatingText(boss.x, boss.y - 40, '⚠ PHASE 3: OVERDRIVE MELTDOWN ⚠', '#ff0055');
    } else if (hpRatio < 0.66 && boss.phase < 2) {
      boss.phase = 2;
      boss.glitchIntensity = 0.5;
      this.addScreenShake(10);
      sound.playBossWarning();
      this.spawnFloatingText(boss.x, boss.y - 40, '⚠ PHASE 2: MATRIX BULLET HELL ⚠', '#ffe600');
    }

    // Segments kinematics for Wyrm & Kraken
    if (boss.segments && boss.segments.length > 0) {
      let leaderX = boss.x + boss.width / 2;
      let leaderY = boss.y + boss.height / 2;

      boss.segments.forEach((seg, idx) => {
        const dx = leaderX - seg.x;
        const dy = leaderY - seg.y;
        seg.angle = Math.atan2(dy, dx);
        seg.x += dx * 0.15;
        seg.y += dy * 0.15;
        leaderX = seg.x;
        leaderY = seg.y;
      });
    }

    // Boss Attack Patterns
    if (boss.attackTimer <= 0) {
      this.executeBossAttack(boss);
    }
  }

  private executeBossAttack(boss: Boss) {
    const p = this.player;
    const bType = boss.bossType || 'TITAN';

    if (bType === 'TITAN') {
      // 1. TITAN (Greek Hologram)
      if (boss.phase === 1) {
        boss.attackTimer = 110;
        const angleToPlayer = Math.atan2(p.y - (boss.y + 60), p.x - (boss.x + 60));
        for (let i = -1; i <= 1; i++) {
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + 50,
            y: boss.y + 60,
            width: 18,
            height: 18,
            vx: Math.cos(angleToPlayer + i * 0.25) * 8,
            vy: Math.sin(angleToPlayer + i * 0.25) * 8,
            damage: 28,
            color: '#00f0ff',
            owner: 'boss',
            type: 'boss_energy_ball',
            life: 120,
            maxLife: 120,
            trail: []
          });
        }
        sound.playShoot('plasma');
      } else if (boss.phase === 2) {
        boss.attackTimer = 85;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const angle = (i * Math.PI * 2) / count + boss.floatingAngle;
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            width: 14,
            height: 14,
            vx: Math.cos(angle) * 6.5,
            vy: Math.sin(angle) * 6.5,
            damage: 24,
            color: '#ffe600',
            owner: 'boss',
            type: 'boss_energy_ball',
            life: 140,
            maxLife: 140,
            trail: []
          });
        }
        sound.playShoot('spread');
        this.addScreenShake(4);
      } else {
        boss.attackTimer = 45;
        for (let i = 0; i < 3; i++) {
          const dropX = p.x + (Math.random() - 0.5) * 500;
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: dropX,
            y: 0,
            width: 16,
            height: 32,
            vx: 0,
            vy: 12,
            damage: 35,
            color: '#ff0055',
            owner: 'boss',
            type: 'glitch_wave',
            life: 90,
            maxLife: 90,
            trail: []
          });
        }
        sound.playShoot('plasma');
        this.addScreenShake(6);
      }

    } else if (bType === 'WYRM') {
      // 2. MECHA-WYRM (Magma Worm)
      if (boss.phase === 1) {
        boss.attackTimer = 90;
        // Spew 3 high-arc magma blobs
        for (let i = 0; i < 3; i++) {
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + 30,
            y: boss.y + 40,
            width: 22,
            height: 22,
            vx: (p.x < boss.x ? -1 : 1) * (5 + i * 2.5),
            vy: -10 + i * 2,
            damage: 30,
            color: '#ffaa00',
            owner: 'boss',
            type: 'magma_blob',
            life: 110,
            maxLife: 110,
            trail: []
          });
        }
        sound.playShoot('plasma');
      } else if (boss.phase === 2) {
        boss.attackTimer = 75;
        this.addScreenShake(8);
        // Ground seismic shockwave both directions
        for (const dir of [-1, 1]) {
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + boss.width / 2,
            y: 740,
            width: 32,
            height: 20,
            vx: dir * 9,
            vy: 0,
            damage: 35,
            color: '#ff0055',
            owner: 'boss',
            type: 'flame_wave',
            life: 120,
            maxLife: 120,
            trail: []
          });
        }
        sound.playExplosion();
      } else {
        boss.attackTimer = 50;
        // Enraged burrow sweep
        boss.vx = (p.x < boss.x ? -7 : 7);
        sound.playBossWarning();
        this.addScreenShake(12);
      }

    } else if (bType === 'KRAKEN') {
      // 3. KRAKEN (Deep Sea Dreadnought)
      if (boss.phase === 1) {
        boss.attackTimer = 95;
        // Fire twin homing torpedoes
        for (let i = 0; i < 2; i++) {
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + 40 + i * 140,
            y: boss.y + 120,
            width: 20,
            height: 12,
            vx: (p.x < boss.x ? -6 : 6),
            vy: (i === 0 ? -3 : 3),
            damage: 28,
            color: '#00ffcc',
            owner: 'boss',
            type: 'torpedo',
            life: 130,
            maxLife: 130,
            trail: []
          });
        }
        sound.playShoot('plasma');
      } else if (boss.phase === 2) {
        boss.attackTimer = 80;
        // 8-way electrified ink burst
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI * 2) / 8 + boss.floatingAngle;
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            width: 16,
            height: 16,
            vx: Math.cos(ang) * 6,
            vy: Math.sin(ang) * 6,
            damage: 26,
            color: '#00f0ff',
            owner: 'boss',
            type: 'lightning_bolt',
            life: 110,
            maxLife: 110,
            trail: []
          });
        }
        sound.playShoot('spread');
      } else {
        boss.attackTimer = 45;
        // Suction vortex shockwave + laser sweeps
        this.addScreenShake(10);
        this.spawnRadialParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#00ffcc', 30);
      }

    } else {
      // 4. VALKYRIE (Final Zenith Goddess)
      if (boss.phase === 1) {
        boss.attackTimer = 65;
        // Divine twin cross beams
        const ang = Math.atan2(p.y - boss.y, p.x - boss.x);
        for (let i = -2; i <= 2; i++) {
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            width: 18,
            height: 10,
            vx: Math.cos(ang + i * 0.16) * 11,
            vy: Math.sin(ang + i * 0.16) * 11,
            damage: 32,
            color: '#f472b6',
            owner: 'boss',
            type: 'feather_blade',
            life: 90,
            maxLife: 90,
            trail: []
          });
        }
        sound.playShoot('plasma');
      } else if (boss.phase === 2) {
        boss.attackTimer = 55;
        // Prismatic Seraph Nova
        const count = 16;
        for (let i = 0; i < count; i++) {
          const ang = (i * Math.PI * 2) / count + boss.floatingAngle * 2;
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            width: 14,
            height: 14,
            vx: Math.cos(ang) * 7.5,
            vy: Math.sin(ang) * 7.5,
            damage: 30,
            color: '#38bdf8',
            owner: 'boss',
            type: 'boss_energy_ball',
            life: 130,
            maxLife: 130,
            trail: []
          });
        }
        sound.playShoot('spread');
        this.addScreenShake(6);
      } else {
        boss.attackTimer = 35;
        // Teleport & Screen wipe celestial rain
        boss.x = p.x + (Math.random() > 0.5 ? 250 : -250);
        sound.playBossWarning();
        this.addScreenShake(14);

        for (let i = 0; i < 4; i++) {
          const rx = p.x + (Math.random() - 0.5) * 600;
          this.projectiles.push({
            id: `proj_${this.projectileIdCounter++}`,
            x: rx,
            y: 0,
            width: 20,
            height: 40,
            vx: 0,
            vy: 15,
            damage: 42,
            color: '#ffe600',
            owner: 'boss',
            type: 'glitch_wave',
            life: 90,
            maxLife: 90,
            trail: []
          });
        }
      }
    }
  }

  // --- PROJECTILES & COLLISION DETECTION ---
  private updateProjectiles() {
    const p = this.player;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];

      // Homing Missile Tracking
      if (pr.type === 'homing_missile' && pr.targetEnemyId) {
        const target = this.level.enemies.find(e => e.id === pr.targetEnemyId) || this.level.boss;
        if (target) {
          const targetX = target.x + target.width / 2;
          const targetY = target.y + target.height / 2;
          const angle = Math.atan2(targetY - pr.y, targetX - pr.x);
          pr.vx += Math.cos(angle) * 0.8;
          pr.vy += Math.sin(angle) * 0.8;
          const spd = Math.sqrt(pr.vx * pr.vx + pr.vy * pr.vy);
          if (spd > 14) {
            pr.vx = (pr.vx / spd) * 14;
            pr.vy = (pr.vy / spd) * 14;
          }
        }
      }

      // Move Projectile
      pr.x += pr.vx;
      pr.y += pr.vy;
      pr.life--;

      // Add Trail
      pr.trail.push({ x: pr.x + pr.width / 2, y: pr.y + pr.height / 2, color: pr.color, size: pr.width * 0.6 });
      if (pr.trail.length > 5) pr.trail.shift();

      // Bouncing VHS cassettes
      if (pr.type === 'bouncing_vhs' && (pr.bouncesLeft || 0) > 0) {
        for (const plat of this.level.platforms) {
          if (plat.type === 'SOLID' && this.checkRectOverlap(pr, plat)) {
            pr.vy *= -1;
            pr.bouncesLeft = (pr.bouncesLeft || 1) - 1;
            break;
          }
        }
      }

      // Check Solid Wall Collisions
      if (!pr.penetrating && pr.type !== 'bouncing_vhs') {
        for (const plat of this.level.platforms) {
          if (plat.type === 'SOLID' && this.checkRectOverlap(pr, plat)) {
            pr.life = 0;
            this.spawnRadialParticles(pr.x, pr.y, pr.color, 6);
            break;
          } else if (plat.type === 'POD_DISPENSER' && !plat.dispenserOpened && this.checkRectOverlap(pr, plat)) {
            // Player shot the Cassette Powerup Pod!
            plat.dispenserOpened = true;
            pr.life = 0;
            sound.playExplosion();
            this.spawnRadialParticles(plat.x + plat.width / 2, plat.y + plat.height / 2, '#ffe600', 20);

            // Drop Powerup
            if (plat.powerupDrop) {
              this.level.powerups.push({
                id: `pw_${Date.now()}_${Math.random()}`,
                type: plat.powerupDrop,
                x: plat.x + 6,
                y: plat.y - 20,
                width: 32,
                height: 32,
                vx: (Math.random() - 0.5) * 3,
                vy: -6,
                isGrounded: false,
                life: 600,
                bobAngle: 0
              });
            }
            break;
          }
        }
      }

      // Hit Player (Enemy or Boss Projectile)
      if ((pr.owner === 'enemy' || pr.owner === 'boss') && this.checkRectOverlap(pr, p)) {
        pr.life = 0;
        this.damagePlayer(pr.damage, 'Direct Projectile Impact');
        continue;
      }

      // Hit Enemies (Player Projectile)
      if (pr.owner === 'player') {
        // Hit regular enemies
        for (const e of this.level.enemies) {
          if (this.checkRectOverlap(pr, e)) {
            if (!pr.penetrating) pr.life = 0;
            this.damageEnemy(e, pr.damage);
            break;
          }
        }

        // Hit Boss
        if (this.level.boss && this.checkRectOverlap(pr, this.level.boss)) {
          if (!pr.penetrating) pr.life = 0;
          this.damageBoss(pr.damage);
        }
      }

      // Remove Dead Projectiles
      if (pr.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // --- POWERUP ITEMS PHYSICS & PICKUP ---
  private updatePowerupItems() {
    const p = this.player;

    for (let i = this.level.powerups.length - 1; i >= 0; i--) {
      const pw = this.level.powerups[i];
      pw.life--;
      pw.bobAngle += 0.05;

      if (!pw.isGrounded) {
        pw.vy += 0.35;
        pw.y += pw.vy;
        pw.x += pw.vx;

        // Platform collision
        for (const plat of this.level.platforms) {
          if ((plat.type === 'SOLID' || plat.type === 'ONE_WAY') && this.checkRectOverlap(pw, plat)) {
            pw.y = plat.y - pw.height;
            pw.vy = 0;
            pw.vx = 0;
            pw.isGrounded = true;
            break;
          }
        }
      }

      // Pickup Collision with Player
      if (this.checkRectOverlap(pw, p)) {
        this.applyPowerup(pw.type);
        this.level.powerups.splice(i, 1);
        continue;
      }

      // Expire
      if (pw.life <= 0) {
        this.level.powerups.splice(i, 1);
      }
    }
  }

  private applyPowerup(type: FormType | 'HEALTH' | 'ENERGY' | 'LIFE') {
    const p = this.player;
    sound.playPowerup();
    this.addScreenShake(4);

    if (type === 'HEALTH') {
      p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + 50);
      this.spawnFloatingText(p.x, p.y - 20, '+50 HP', '#00ffcc');
    } else if (type === 'ENERGY') {
      p.stats.energy = Math.min(100, p.stats.energy + 50);
      this.spawnFloatingText(p.x, p.y - 20, '+50% NOVA ENERGY', '#ff00ff');
    } else if (type === 'LIFE') {
      p.stats.lives++;
      this.spawnFloatingText(p.x, p.y - 20, '★ EXTRA 1UP ★', '#ffe600');
    } else {
      // Weapon / Heroine Form Change
      this.setForm(type, 22);
    }
  }

  // --- DAMAGE & COMBAT SYSTEM ---
  private damageEnemy(e: Enemy, dmg: number) {
    // Check Shield (Riot Cleaner)
    if (e.shieldActive && e.facing !== (this.player.x < e.x ? -1 : 1)) {
      dmg = Math.floor(dmg * 0.25);
      sound.playHit();
      this.spawnFloatingText(e.x, e.y - 20, 'BLOCKED', '#ffffff');
    } else {
      e.hp -= dmg;
      e.isGlitching = 8;
      sound.playHit();
      this.spawnFloatingText(e.x, e.y - 20, `${dmg}`, '#00f0ff');
    }

    // Energy charge for player
    this.player.stats.energy = Math.min(100, this.player.stats.energy + 4);

    if (e.hp <= 0) {
      e.hp = 0;
      sound.playExplosion();
      this.addScreenShake(2);
      this.spawnRadialParticles(e.x + e.width / 2, e.y + e.height / 2, '#ff007f', 16);

      // Combo & Score
      this.player.stats.combo++;
      this.player.stats.comboTimer = 3.0; // 3 seconds to keep combo
      const multiplier = Math.min(5, 1 + Math.floor(this.player.stats.combo / 4));
      this.player.stats.score += e.pointsValue * multiplier;

      // Chance to drop Cassette powerup
      if (Math.random() < 0.28) {
        const forms: FormType[] = ['FLIGHT', 'INVINCIBLE', 'HEAVY_PLASMA', 'SPREAD'];
        const chosen = forms[Math.floor(Math.random() * forms.length)];
        this.level.powerups.push({
          id: `pw_drop_${Date.now()}`,
          type: chosen,
          x: e.x,
          y: e.y,
          width: 32,
          height: 32,
          vx: 0,
          vy: -4,
          isGrounded: false,
          life: 400,
          bobAngle: 0
        });
      }
    }
  }

  private damageBoss(dmg: number) {
    const boss = this.level.boss;
    if (!boss) return;

    boss.hp -= dmg;
    boss.glitchIntensity = 0.8;
    sound.playHit();
    this.addScreenShake(3);
    this.spawnFloatingText(boss.x + boss.width / 2, boss.y + 40, `${dmg}`, '#ffe600');

    this.player.stats.energy = Math.min(100, this.player.stats.energy + 5);

    if (boss.hp <= 0) {
      boss.hp = 0;
      this.handleBossDefeat(boss);
    }
  }

  private handleBossDefeat(boss: Boss) {
    this.isBossDefeated = true;
    sound.playExplosion(true);
    sound.startBGM('victory');
    this.addScreenShake(20);

    // Giant victory fireworks & powerups
    this.spawnRadialParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ffe600', 80);
    this.spawnFloatingText(boss.x, boss.y - 60, '★ BOSS DEFEATED ★', '#00ffcc');

    this.player.stats.score += 10000;

    // If level 10 defeated -> Game Victory
    if (this.level.levelNumber >= 10) {
      this.isVictory = true;
    }

    // Spawn extraction gate in the center of arena
    this.level.platforms.push({
      id: 'boss_victory_gate',
      type: 'END_GATE',
      x: boss.x,
      y: 650,
      width: 80,
      height: 120,
      color: '#00ffcc',
      customLabel: this.level.levelNumber >= 10 ? 'VICTORY >>' : 'ADVANCE >>'
    });

    this.notifyStateChange();
  }

  private damagePlayer(dmg: number, _reason: string) {
    const p = this.player;
    if (p.invincibleTimer > 0 || p.stats.form === 'INVINCIBLE' || p.isDashing) return;

    p.stats.hp -= dmg;
    p.invincibleTimer = 1.4; // 1.4s invulnerability
    sound.playHit();
    this.addScreenShake(8);
    this.spawnFloatingText(p.x, p.y - 20, `-${dmg}`, '#ff0055');

    // Reset combo on hit
    p.stats.combo = 0;

    if (p.stats.hp <= 0) {
      this.handlePlayerDeath('Vital Systems Depleted');
    }
    this.notifyStateChange();
  }

  private handlePlayerDeath(reason: string) {
    const p = this.player;
    p.stats.lives--;
    sound.playExplosion(true);
    this.addScreenShake(15);
    this.spawnRadialParticles(p.x + p.width / 2, p.y + p.height / 2, '#00f0ff', 50);

    if (p.stats.lives <= 0) {
      this.isGameOver = true;
      sound.stopBGM();
      this.spawnFloatingText(p.x, p.y - 40, 'SYSTEM FAILURE - GAME OVER', '#ff0055');
    } else {
      // Respawn at checkpoint / start point
      p.x = this.level.startPoint.x;
      p.y = this.level.startPoint.y;
      p.vx = 0;
      p.vy = 0;
      p.stats.hp = p.stats.maxHp;
      p.stats.form = 'DEFAULT';
      p.invincibleTimer = 3.0; // 3 seconds respawn protection
      this.spawnFloatingText(p.x, p.y - 30, `RESPAWNED (${p.stats.lives} LIVES LEFT)`, '#00f0ff');
    }
    this.notifyStateChange();
  }

  // --- PARTICLES & CAMERA ---
  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.gravity) pt.vy += pt.gravity;
      pt.life--;

      if (pt.type === 'ring') {
        pt.size += 4;
      }

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateCamera(viewWidth?: number, viewHeight?: number) {
    const p = this.player;
    const vw = (typeof viewWidth === 'number' && !isNaN(viewWidth) && viewWidth > 0) ? viewWidth : 1280;
    const vh = (typeof viewHeight === 'number' && !isNaN(viewHeight) && viewHeight > 0) ? viewHeight : 720;
    const targetCamX = p.x - vw * 0.35;
    const targetCamY = p.y - vh * 0.55;

    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.08;

    const maxCamX = Math.max(0, this.level.width - vw);
    const maxCamY = Math.max(0, this.level.height - vh);

    this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX));
    this.cameraY = Math.max(0, Math.min(maxCamY, this.cameraY));
  }

  private spawnRadialParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        type: 'pixel',
        gravity: 0.15
      });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -1.2,
      color,
      size: 16,
      life: 60,
      maxLife: 60,
      type: 'text',
      text
    });
  }

  private addScreenShake(amt: number) {
    if (this.settings.screenShake) {
      this.screenShake.intensity = Math.max(this.screenShake.intensity, amt);
    }
  }

  private checkRectOverlap(r1: { x: number; y: number; width: number; height: number }, r2: { x: number; y: number; width: number; height: number }): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  private findNearestEnemy(x: number, y: number): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = Infinity;

    for (const e of this.level.enemies) {
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < minDist && d < 700) {
        minDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  private notifyStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback();
    }
  }
}
