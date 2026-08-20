import React from 'react';
import { PlayerStats, Boss, FormType } from '../game/types';
import { Heart, Sparkles, Zap, Flame, ListOrdered, Settings, HelpCircle, Pause, Play, Sword, ShieldAlert } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  levelNumber: number;
  levelTitle: string;
  biome?: string;
  boss?: Boss;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenStageSelect: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  levelNumber,
  levelTitle,
  biome = 'city',
  boss,
  onOpenGuide,
  onOpenSettings,
  onOpenStageSelect,
  onTogglePause,
  isPaused
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const energyPercent = Math.max(0, Math.min(100, stats.energy));

  const getFormInfo = (form: FormType) => {
    switch (form) {
      case 'FLIGHT':
        return { name: '剑神 · 万剑归宗', color: 'text-sky-300', bg: 'bg-sky-950/60', border: 'border-sky-500/50', desc: '御剑凌空 · 飞剑追踪' };
      case 'INVINCIBLE':
        return { name: '狱血魔神 · 血气狂暴', color: 'text-red-400', bg: 'bg-red-950/60', border: 'border-red-500/50', desc: '血气护体 · 狂暴无敌' };
      case 'HEAVY_PLASMA':
        return { name: '天帝 · 修罗邪光斩', color: 'text-amber-300', bg: 'bg-amber-950/60', border: 'border-amber-500/50', desc: '极光雷波 · 贯穿全屏' };
      case 'SPREAD':
        return { name: '黑暗君主 · 冥炎卡洛', color: 'text-purple-300', bg: 'bg-purple-950/60', border: 'border-purple-500/50', desc: '5向幽冥鬼火 · 灼烧清屏' };
      default:
        return { name: '鬼剑士 · 波动斩', color: 'text-slate-200', bg: 'bg-slate-900/60', border: 'border-slate-700/60', desc: '巨剑月光斩击' };
    }
  };

  const currentFormInfo = getFormInfo(stats.form);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 p-2.5 sm:p-4 flex flex-col gap-2 font-mono select-none">
      {/* Top Main Status Bar */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Slayer Vital Signs (DNF Gothic HUD) */}
        <div className="pointer-events-auto flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-lg bg-stone-950/90 backdrop-blur-md border border-stone-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.8)] min-w-[220px] sm:min-w-[280px]">
          {/* Header Row: Character Name & Lives */}
          <div className="flex items-center justify-between text-xs font-bold tracking-wider">
            <div className="flex items-center gap-1.5 text-stone-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-400" />
              <span>鬼剑士 · SLAYER</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              {Array.from({ length: Math.max(0, stats.lives) }).map((_, i) => (
                <Heart key={i} className="w-3.5 h-3.5 fill-red-600 stroke-red-400" />
              ))}
              <span className="text-[11px] text-stone-400 ml-1">x{stats.lives}</span>
            </div>
          </div>

          {/* HP Bar (Blood Red Classic DNF Orb / Bar) */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
              <span className="text-red-400 font-bold">HP 生命值</span>
              <span className={stats.hp < 30 ? 'text-red-400 animate-pulse font-bold' : 'text-stone-300'}>
                {Math.ceil(stats.hp)} / {stats.maxHp}
              </span>
            </div>
            <div className="h-2.5 w-full bg-stone-900 rounded-sm overflow-hidden p-0.5 border border-stone-800">
              <div
                className={`h-full rounded-sm transition-all duration-150 ${
                  stats.hp > 50
                    ? 'bg-gradient-to-r from-red-800 via-red-600 to-red-500'
                    : stats.hp > 25
                    ? 'bg-gradient-to-r from-amber-700 to-red-600'
                    : 'bg-gradient-to-r from-red-950 to-red-600 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* MP / Awakening Energy Meter (Deep Mana Blue) */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-sky-400">
                <Sparkles className="w-3 h-3" />
                <span>MP / 觉醒奥义</span>
              </span>
              <span className={energyPercent >= 100 ? 'text-amber-400 font-bold animate-pulse' : 'text-stone-400'}>
                {energyPercent >= 100 ? '极·鬼剑术 [Q/E]' : `${Math.floor(energyPercent)}%`}
              </span>
            </div>
            <div className="h-2 w-full bg-stone-900 rounded-sm overflow-hidden p-0.5 border border-stone-800">
              <div
                className={`h-full rounded-sm transition-all duration-150 ${
                  energyPercent >= 100
                    ? 'bg-gradient-to-r from-sky-600 via-blue-500 to-amber-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                    : 'bg-gradient-to-r from-slate-700 to-sky-600'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>

          {/* Current Form Indicator */}
          <div className={`mt-0.5 p-1.5 rounded border ${currentFormInfo.border} ${currentFormInfo.bg} flex items-center justify-between text-[10px]`}>
            <div className="flex items-center gap-1.5">
              <Sword className={`w-3.5 h-3.5 ${currentFormInfo.color}`} />
              <div className="flex flex-col">
                <span className={`font-bold ${currentFormInfo.color}`}>{currentFormInfo.name}</span>
                <span className="text-[9px] text-stone-400">{currentFormInfo.desc}</span>
              </div>
            </div>
            {stats.form !== 'DEFAULT' && (
              <div className="text-right">
                <span className="font-bold text-amber-400">{Math.ceil(stats.formTimeLeft)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Stage & Score Info */}
        <div className="hidden sm:flex flex-col items-center p-2 rounded-lg bg-stone-950/90 backdrop-blur-md border border-stone-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-center min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-400 tracking-widest uppercase font-bold">
              地下城 {levelNumber.toString().padStart(2, '0')} / 10
            </span>
          </div>
          <span className="text-xs font-bold text-stone-200 tracking-wide truncate max-w-[220px]">
            {levelTitle}
          </span>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-stone-400 text-[10px]">金币积分</span>
            <span className="font-bold text-amber-400 tracking-wider">
              {stats.score.toLocaleString()}
            </span>
          </div>
          {stats.combo > 1 && (
            <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-[10px] font-bold">
              <Flame className="w-3 h-3 text-red-500" />
              <span>{stats.combo} 连击 (x{Math.min(5, 1 + Math.floor(stats.combo / 4))})</span>
            </div>
          )}
        </div>

        {/* Right: Stage Select, Guide, Settings, Pause Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Stage Selector Button */}
          <button
            id="hud-stage-select-btn"
            onClick={onOpenStageSelect}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-stone-950/90 backdrop-blur-md border border-amber-600/40 hover:border-amber-500 hover:bg-stone-900 text-amber-400 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="选择地下城 (Dungeon Select)"
          >
            <ListOrdered className="w-4 h-4" />
            <span className="hidden md:inline">关卡</span>
          </button>

          {/* Guide Button */}
          <button
            id="hud-guide-btn"
            onClick={onOpenGuide}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-stone-950/90 backdrop-blur-md border border-stone-700 hover:border-stone-500 hover:bg-stone-900 text-stone-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="技能与出招表 (Skill Guide)"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">技能</span>
          </button>

          {/* Settings Button */}
          <button
            id="hud-settings-btn"
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-stone-950/90 backdrop-blur-md border border-stone-700 hover:border-stone-500 hover:bg-stone-900 text-stone-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="画面与音效 (Settings)"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">设置</span>
          </button>

          {/* Pause / Resume Button */}
          <button
            id="hud-pause-btn"
            onClick={onTogglePause}
            className={`p-2 sm:px-3 sm:py-2 rounded-lg backdrop-blur-md border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              isPaused
                ? 'bg-amber-950/60 border-amber-500 text-amber-400'
                : 'bg-stone-950/90 border-stone-700 hover:border-stone-500 text-stone-300'
            }`}
            title="暂停游戏 (Pause)"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            <span className="hidden md:inline">{isPaused ? '继续' : '暂停'}</span>
          </button>
        </div>
      </div>

      {/* Boss Health Bar (When Boss is Present) */}
      {boss && boss.hp > 0 && (
        <div className="pointer-events-auto self-center w-full max-w-xl p-2.5 sm:p-3 rounded-lg bg-stone-950/95 backdrop-blur-md border border-red-800 shadow-[0_4px_25px_rgba(0,0,0,0.9)] animate-slideDown">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-700 text-red-400 text-[10px] font-bold">
                领主 BOSS // 阶段 {boss.phase}
              </span>
              <span className="font-bold text-stone-200 tracking-wider truncate max-w-[260px] sm:max-w-[340px]">
                {boss.title}
              </span>
            </div>
            <span className="font-bold text-red-400">
              {Math.ceil(boss.hp)} / {boss.maxHp}
            </span>
          </div>

          {/* Boss HP Bar */}
          <div className="h-3 w-full bg-stone-900 rounded-sm overflow-hidden p-0.5 border border-stone-800">
            <div
              className={`h-full rounded-sm transition-all duration-150 ${
                boss.phase === 3
                  ? 'bg-gradient-to-r from-red-900 via-red-600 to-amber-500'
                  : boss.phase === 2
                  ? 'bg-gradient-to-r from-red-800 to-amber-600'
                  : 'bg-gradient-to-r from-red-900 via-red-700 to-red-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
