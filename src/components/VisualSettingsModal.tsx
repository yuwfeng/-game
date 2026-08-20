import React from 'react';
import { X, Volume2, VolumeX, Tv, Activity, Sparkles, Sliders } from 'lucide-react';
import { GameSettings } from '../game/types';
import { sound } from '../game/audio';

interface VisualSettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const VisualSettingsModal: React.FC<VisualSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const isMuted = sound.getMuted();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-stone-950 border border-stone-700 shadow-[0_10px_40px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-stone-200">
        {/* Header */}
        <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Sliders className="w-5 h-5" />
            <h2 className="text-base font-bold tracking-wider">画面与音效设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* CRT Scanline Filter Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900/60 border border-stone-800">
            <div className="flex items-center gap-2.5">
              <Tv className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-bold text-stone-200">复古暗角与微扫描线</div>
                <div className="text-[11px] text-stone-400">地下城哥特式暗夜暗角氛围</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ crtFilter: !settings.crtFilter })}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                settings.crtFilter ? 'bg-amber-600 justify-end' : 'bg-stone-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Screen Shake Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900/60 border border-stone-800">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-red-400" />
              <div>
                <div className="font-bold text-stone-200">打击震屏反馈 (Screen Shake)</div>
                <div className="text-[11px] text-stone-400">巨剑斩击与领主震颤打击感</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                settings.screenShake ? 'bg-red-600 justify-end' : 'bg-stone-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* BGM Volume Slider */}
          <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-400">地下城背景音乐 (BGM)</span>
              <span className="text-stone-400 font-bold">{Math.round(settings.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                sound.setBgmVolume(val);
                onUpdateSettings({ bgmVolume: val });
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* SFX Volume Slider */}
          <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-red-400">武器斩击与魔法音效 (SFX)</span>
              <span className="text-stone-400 font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                sound.setSfxVolume(val);
                onUpdateSettings({ sfxVolume: val });
              }}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          {/* Global Audio Mute */}
          <button
            onClick={() => {
              sound.toggleMute();
              onUpdateSettings({}); // trigger render
            }}
            className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-950/40 border-red-800 text-red-300'
                : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? '已静音 (点击恢复声音)' : '静音所有声音'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-900/90 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-amber-400 font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
