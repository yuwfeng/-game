import React from 'react';
import { ControlsState } from '../game/types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Sword, Wind } from 'lucide-react';

interface TouchControlsProps {
  controls: ControlsState;
  onControlChange: (key: keyof ControlsState, val: boolean) => void;
  canSuperNova: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  controls,
  onControlChange,
  canSuperNova
}) => {
  const handleTouchStart = (key: keyof ControlsState, isPressedKey?: keyof ControlsState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onControlChange(key, true);
    if (isPressedKey) {
      onControlChange(isPressedKey, true);
    }
  };

  const handleTouchEnd = (key: keyof ControlsState, isPressedKey?: keyof ControlsState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onControlChange(key, false);
    if (isPressedKey) {
      onControlChange(isPressedKey, false);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-4 select-none flex items-end justify-between">
      {/* Left: 8-Way Virtual D-Pad (DNF Gothic Style) */}
      <div className="pointer-events-auto relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
        {/* Up */}
        <button
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleTouchEnd('up')}
          onMouseDown={handleTouchStart('up')}
          onMouseUp={handleTouchEnd('up')}
          className={`absolute top-1.5 w-11 h-11 sm:w-13 sm:h-13 rounded-t-lg flex items-center justify-center border border-stone-600 transition-all ${
            controls.up ? 'bg-amber-600 text-stone-950' : 'bg-stone-900 text-stone-300'
          }`}
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Down */}
        <button
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleTouchEnd('down')}
          onMouseDown={handleTouchStart('down')}
          onMouseUp={handleTouchEnd('down')}
          className={`absolute bottom-1.5 w-11 h-11 sm:w-13 sm:h-13 rounded-b-lg flex items-center justify-center border border-stone-600 transition-all ${
            controls.down ? 'bg-amber-600 text-stone-950' : 'bg-stone-900 text-stone-300'
          }`}
        >
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Left */}
        <button
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onMouseDown={handleTouchStart('left')}
          onMouseUp={handleTouchEnd('left')}
          className={`absolute left-1.5 w-11 h-11 sm:w-13 sm:h-13 rounded-l-lg flex items-center justify-center border border-stone-600 transition-all ${
            controls.left ? 'bg-amber-600 text-stone-950' : 'bg-stone-900 text-stone-300'
          }`}
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right */}
        <button
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onMouseDown={handleTouchStart('right')}
          onMouseUp={handleTouchEnd('right')}
          className={`absolute right-1.5 w-11 h-11 sm:w-13 sm:h-13 rounded-r-lg flex items-center justify-center border border-stone-600 transition-all ${
            controls.right ? 'bg-amber-600 text-stone-950' : 'bg-stone-900 text-stone-300'
          }`}
        >
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Center Pivot */}
        <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700" />
      </div>

      {/* Right: Action Buttons (Attack, Jump, Dash, Awakening Nova) */}
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/* Top Row: Super Nova & Dash */}
        <div className="flex items-center gap-3">
          {/* Awakening Nova Button */}
          <button
            onTouchStart={handleTouchStart('nova', 'novaPressed')}
            onTouchEnd={handleTouchEnd('nova', 'novaPressed')}
            onMouseDown={handleTouchStart('nova', 'novaPressed')}
            onMouseUp={handleTouchEnd('nova', 'novaPressed')}
            disabled={!canSuperNova}
            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full flex flex-col items-center justify-center border font-bold transition-all shadow-lg ${
              canSuperNova
                ? 'bg-red-800 border-amber-400 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)] active:scale-95'
                : 'bg-stone-900 border-stone-800 text-stone-600 opacity-60'
            }`}
          >
            <Zap className="w-5 h-5 fill-current" />
            <span className="text-[9px]">奥义</span>
          </button>

          {/* Dash / Ghost Step Button */}
          <button
            onTouchStart={handleTouchStart('dash', 'dashPressed')}
            onTouchEnd={handleTouchEnd('dash', 'dashPressed')}
            onMouseDown={handleTouchStart('dash', 'dashPressed')}
            onMouseUp={handleTouchEnd('dash', 'dashPressed')}
            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full flex flex-col items-center justify-center border font-bold transition-all active:scale-95 ${
              controls.dash
                ? 'bg-stone-700 border-stone-400 text-stone-100'
                : 'bg-stone-950/90 border-stone-700 text-stone-300'
            }`}
          >
            <Wind className="w-5 h-5" />
            <span className="text-[9px]">鬼影步</span>
          </button>
        </div>

        {/* Bottom Row: Jump & Attack */}
        <div className="flex items-center gap-3">
          {/* Jump Button */}
          <button
            onTouchStart={handleTouchStart('jump', 'jumpPressed')}
            onTouchEnd={handleTouchEnd('jump', 'jumpPressed')}
            onMouseDown={handleTouchStart('jump', 'jumpPressed')}
            onMouseUp={handleTouchEnd('jump', 'jumpPressed')}
            className={`w-15 h-15 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center border font-bold transition-all active:scale-95 ${
              controls.jump
                ? 'bg-sky-700 border-sky-400 text-stone-100'
                : 'bg-stone-950/90 border-stone-700 text-sky-400'
            }`}
          >
            <span className="text-sm font-bold">跳跃</span>
          </button>

          {/* Attack / Slash Button */}
          <button
            onTouchStart={handleTouchStart('shoot', 'shootPressed')}
            onTouchEnd={handleTouchEnd('shoot', 'shootPressed')}
            onMouseDown={handleTouchStart('shoot', 'shootPressed')}
            onMouseUp={handleTouchEnd('shoot', 'shootPressed')}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center border font-bold transition-all active:scale-95 ${
              controls.shoot
                ? 'bg-red-700 border-red-400 text-amber-200'
                : 'bg-stone-950/95 border-red-800 text-red-500'
            }`}
          >
            <Sword className="w-6 h-6" />
            <span className="text-xs font-bold">斩击</span>
          </button>
        </div>
      </div>
    </div>
  );
};
