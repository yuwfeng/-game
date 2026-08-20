import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { ControlsState, GameSettings } from '../game/types';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { SkillGuideModal } from './SkillGuideModal';
import { VisualSettingsModal } from './VisualSettingsModal';
import { StageSelectModal } from './StageSelectModal';
import { GameOverModal, PauseModal } from './GameStateModals';
import { sound } from '../game/audio';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Controls State Ref (mutable for high-frequency game loop)
  const controlsRef = useRef<ControlsState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpPressed: false,
    shoot: false,
    shootPressed: false,
    dash: false,
    dashPressed: false,
    nova: false,
    novaPressed: false
  });

  // UI State for React rendering
  const [, setRenderTrigger] = useState<number>(0);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Settings State
  const [settings, setSettings] = useState<GameSettings>({
    crtFilter: true,
    bloom: true,
    screenShake: true,
    bgmVolume: 0.5,
    sfxVolume: 0.7,
    showFps: false
  });

  // Force re-render callback for HUD updates
  const forceUpdateHUD = useCallback(() => {
    setRenderTrigger(t => t + 1);
  }, []);

  // Initialize Game Engine & Setup Initial Canvas Resolution
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const initialWidth = container?.clientWidth || 1280;
    const initialHeight = container?.clientHeight || 720;
    canvas.width = Math.max(640, initialWidth);
    canvas.height = Math.max(360, initialHeight);

    const engine = new GameEngine(settings, forceUpdateHUD);
    const renderer = new GameRenderer(canvas);

    engineRef.current = engine;
    rendererRef.current = renderer;

    return () => {
      sound.stopBGM();
    };
  }, []);

  // Handle ResizeObserver for dynamic high-DPI canvas
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = Math.floor(width);
          canvas.height = Math.floor(height);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Resume audio on first user gesture
      sound.resume();

      const ctrl = controlsRef.current;
      const key = e.key.toLowerCase();

      if (key === 'a' || key === 'arrowleft') ctrl.left = true;
      if (key === 'd' || key === 'arrowright') ctrl.right = true;
      if (key === 'w' || key === 'arrowup') ctrl.up = true;
      if (key === 's' || key === 'arrowdown') ctrl.down = true;

      // Jump
      if (key === 'k' || key === 'z' || key === ' ') {
        if (!ctrl.jump) ctrl.jumpPressed = true;
        ctrl.jump = true;
      }

      // Shoot
      if (key === 'j' || key === 'x') {
        if (!ctrl.shoot) ctrl.shootPressed = true;
        ctrl.shoot = true;
      }

      // Dash
      if (key === 'l' || key === 'c' || key === 'shift') {
        if (!ctrl.dash) ctrl.dashPressed = true;
        ctrl.dash = true;
      }

      // Super Nova
      if (key === 'q' || key === 'e') {
        if (!ctrl.nova) ctrl.novaPressed = true;
        ctrl.nova = true;
      }

      // Pause
      if (key === 'escape' || key === 'p') {
        if (engineRef.current && !engineRef.current.isGameOver) {
          const nextPaused = !engineRef.current.isPaused;
          engineRef.current.isPaused = nextPaused;
          setIsPaused(nextPaused);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const ctrl = controlsRef.current;
      const key = e.key.toLowerCase();

      if (key === 'a' || key === 'arrowleft') ctrl.left = false;
      if (key === 'd' || key === 'arrowright') ctrl.right = false;
      if (key === 'w' || key === 'arrowup') ctrl.up = false;
      if (key === 's' || key === 'arrowdown') ctrl.down = false;

      if (key === 'k' || key === 'z' || key === ' ') {
        ctrl.jump = false;
        ctrl.jumpPressed = false;
      }

      if (key === 'j' || key === 'x') {
        ctrl.shoot = false;
        ctrl.shootPressed = false;
      }

      if (key === 'l' || key === 'c' || key === 'shift') {
        ctrl.dash = false;
        ctrl.dashPressed = false;
      }

      if (key === 'q' || key === 'e') {
        ctrl.nova = false;
        ctrl.novaPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const engine = engineRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;

      if (engine && renderer && canvas) {
        const viewWidth = canvas.width || 1280;
        const viewHeight = canvas.height || 720;

        // Update Game Logic
        engine.update(controlsRef.current, viewWidth, viewHeight);

        // Reset one-shot presses
        controlsRef.current.jumpPressed = false;
        controlsRef.current.shootPressed = false;
        controlsRef.current.dashPressed = false;
        controlsRef.current.novaPressed = false;

        // Render Frame
        renderer.render(
          engine.player,
          engine.projectiles,
          engine.particles,
          engine.level,
          engine.cameraX,
          engine.cameraY,
          engine.settings,
          engine.screenShake
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Start Game Button Handler
  const handleStartGame = () => {
    sound.resume();
    sound.startBGM('stage');
    setHasStarted(true);
    if (engineRef.current) {
      engineRef.current.restartGame(1);
    }
    forceUpdateHUD();
  };

  // Stage Select Handler
  const handleSelectStage = (stageNum: number) => {
    sound.resume();
    setHasStarted(true);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.isPaused = false;
      engineRef.current.selectLevel(stageNum);
    }
    forceUpdateHUD();
  };

  // Restart Handler
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartGame(1);
      setIsPaused(false);
    }
    forceUpdateHUD();
  };

  // Toggle Pause Handler
  const handleTogglePause = () => {
    if (engineRef.current && !engineRef.current.isGameOver) {
      const nextPaused = !engineRef.current.isPaused;
      engineRef.current.isPaused = nextPaused;
      setIsPaused(nextPaused);
    }
  };

  // Handle Touch Controls Updates
  const handleTouchControlChange = (newControls: Partial<ControlsState>) => {
    sound.resume();
    Object.assign(controlsRef.current, newControls);
  };

  const engine = engineRef.current;

  return (
    <div
      ref={containerRef}
      id="game-viewport-container"
      className="relative w-full h-screen max-h-screen bg-slate-950 overflow-hidden select-none flex items-center justify-center font-mono"
    >
      {/* Game Canvas */}
      <div className="relative w-full h-full max-w-7xl max-h-[1080px] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Start Game Hero Overlay */}
        {!hasStarted && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md text-center">
            <div className="max-w-xl space-y-5 animate-fade-in">
              {/* Title & Vaporwave Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 border border-stone-700 text-stone-300 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>ARAD CHRONICLES // 地下城勇士 · 鬼剑士横版动作闯关</span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-amber-400 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
                  DUNGEON FIGHTER
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 tracking-widest uppercase">
                  阿拉德之怒 · 鬼剑士十大地下城征伐
                </p>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
                操控 <span className="text-amber-400 font-bold">鬼剑士 (Slayer)</span> 征伐格兰之森、暗黑城熔岩穴、天帷巨兽神殿与天空之城！体验 8 向波动剑气、剑神/狂战士/阿修罗/鬼泣 4 大觉醒，每 3 关迎战史诗领主 BOSS！
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="start-game-button"
                  onClick={handleStartGame}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-red-800 hover:bg-red-700 text-amber-300 font-bold text-sm tracking-wider uppercase active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.8)] cursor-pointer"
                >
                  进入地下城 (START GAME)
                </button>

                <button
                  id="stage-select-menu-btn"
                  onClick={() => setShowStageSelect(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-600/50 text-amber-400 font-bold text-xs tracking-wider transition-all active:scale-95 cursor-pointer"
                >
                  选择地下城 (10大关)
                </button>

                <button
                  id="guide-menu-btn"
                  onClick={() => setShowGuide(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs tracking-wider transition-all active:scale-95 cursor-pointer"
                >
                  鬼剑士技能与图鉴
                </button>
              </div>

              {/* Keyboard Keys Hint */}
              <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span><kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-400">WASD</kbd> 8向移动与瞄准</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-red-400">J/X</kbd> 巨剑挥砍</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-sky-400">K/Space</kbd> 跳跃</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300">L/Shift</kbd> 鬼影步冲刺</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-red-500">Q/E</kbd> 极·鬼剑术奥义</span>
              </div>
            </div>
          </div>
        )}

        {/* HUD In-Game Overlay */}
        {hasStarted && engine && (
          <>
            <HUD
              stats={engine.player.stats}
              levelNumber={engine.level.levelNumber}
              levelTitle={engine.level.title}
              biome={engine.level.biome}
              boss={engine.level.boss}
              onOpenGuide={() => setShowGuide(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenStageSelect={() => setShowStageSelect(true)}
              onTogglePause={handleTogglePause}
              isPaused={isPaused}
            />

            {/* Mobile Touch Controls */}
            <TouchControls
              controls={controlsRef.current}
              onControlChange={handleTouchControlChange}
              canSuperNova={engine.player.stats.energy >= 100}
            />

            {/* Game Over Screen */}
            {engine.isGameOver && (
              <GameOverModal
                score={engine.player.stats.score}
                levelNumber={engine.level.levelNumber}
                onRestart={handleRestart}
              />
            )}

            {/* Pause Screen */}
            {isPaused && !engine.isGameOver && (
              <PauseModal
                onResume={handleTogglePause}
                onRestart={handleRestart}
                onOpenGuide={() => setShowGuide(true)}
              />
            )}
          </>
        )}
      </div>

      {/* Stage Select Modal */}
      {showStageSelect && (
        <StageSelectModal
          isOpen={showStageSelect}
          currentLevel={engine?.level.levelNumber || 1}
          onClose={() => setShowStageSelect(false)}
          onSelectStage={handleSelectStage}
        />
      )}

      {/* Guide Modal */}
      {showGuide && (
        <SkillGuideModal onClose={() => setShowGuide(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <VisualSettingsModal
          settings={settings}
          onUpdateSettings={(newSet) => setSettings(s => ({ ...s, ...newSet }))}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
