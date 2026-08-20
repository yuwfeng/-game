import React from 'react';
import { RotateCcw, Play, Skull, Sword, HelpCircle } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  levelNumber: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  levelNumber,
  onRestart
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg font-mono select-none animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-xl bg-stone-950 border border-red-800 shadow-[0_10px_40px_rgba(0,0,0,0.95)] text-center space-y-6">
        <div className="inline-flex p-3 rounded-full bg-red-950 border border-red-700 text-red-500">
          <Skull className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-500 tracking-wider">
            勇士倒下了
          </h2>
          <p className="text-stone-400 text-xs tracking-widest uppercase">
            生命耗尽 · 战死在地下城第 {levelNumber.toString().padStart(2, '0')} 关
          </p>
        </div>

        <div className="p-4 rounded-lg bg-stone-900/80 border border-stone-800 space-y-1">
          <div className="text-xs text-stone-400 font-semibold">金币与战绩积分 (FINAL SCORE)</div>
          <div className="text-2xl font-bold text-amber-400 tracking-wider">
            {score.toLocaleString()}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-lg bg-red-800 hover:bg-red-700 text-amber-300 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.8)] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>使用复活币重生 (REVIVE)</span>
        </button>
      </div>
    </div>
  );
};

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenGuide: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenGuide
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none animate-fade-in">
      <div className="relative w-full max-w-sm p-6 rounded-xl bg-stone-950 border border-stone-700 shadow-[0_10px_40px_rgba(0,0,0,0.95)] text-center space-y-5 text-stone-200">
        <div className="text-xl font-bold text-amber-400 tracking-wider">
          地下城暂停中 (PAUSED)
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>继续征伐 (RESUME)</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="w-full py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-stone-800 cursor-pointer"
          >
            <Sword className="w-4 h-4 text-red-500" />
            <span>查看鬼剑士出招表与领主图鉴</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-lg bg-stone-950 hover:bg-stone-900 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-red-950 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新挑战当前地下城</span>
          </button>
        </div>
      </div>
    </div>
  );
};
