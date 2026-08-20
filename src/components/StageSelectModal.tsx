import React from 'react';
import { STAGE_CATALOG, StageMeta } from '../game/levelGenerator';
import { X, Play, Skull, Mountain, Cloud, Waves, Flame, Sparkles } from 'lucide-react';

interface StageSelectModalProps {
  isOpen: boolean;
  currentLevel: number;
  onClose: () => void;
  onSelectStage: (stageNum: number) => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  currentLevel,
  onClose,
  onSelectStage
}) => {
  if (!isOpen) return null;

  const getBiomeBadge = (biome: string) => {
    switch (biome) {
      case 'sky':
        return { label: '天空之城 (Sky Tower)', icon: Cloud, color: 'text-amber-300 border-amber-500/40 bg-amber-950/30' };
      case 'underwater':
        return { label: '天帷巨兽 (Behemoth)', icon: Waves, color: 'text-sky-300 border-sky-500/40 bg-sky-950/30' };
      case 'underground':
        return { label: '暗黑城 (Underfoot)', icon: Flame, color: 'text-red-400 border-red-500/40 bg-red-950/30' };
      case 'matrix':
        return { label: '异次元裂缝 (Dimensional Rift)', icon: Sparkles, color: 'text-purple-300 border-purple-500/40 bg-purple-950/30' };
      default:
        return { label: '格兰之森 (Grand Flores)', icon: Mountain, color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        id="stage-select-modal-container"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl bg-stone-950 border border-stone-700 shadow-[0_10px_40px_rgba(0,0,0,0.95)] text-stone-100 font-mono overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stone-800 border border-amber-600/50 text-amber-400">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-400 tracking-wider">
                地下城选择 · 阿拉德大陆十大地下城
              </h2>
              <p className="text-xs text-stone-400">
                涵盖 格兰之森、暗黑城熔岩穴、天帷巨兽神殿、天空之城 与 4 大领主 BOSS 征伐
              </p>
            </div>
          </div>
          <button
            id="close-stage-select-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {STAGE_CATALOG.map((stage: StageMeta) => {
            const badge = getBiomeBadge(stage.biome);
            const Icon = badge.icon;
            const isCurrent = currentLevel === stage.levelNumber;

            return (
              <div
                key={stage.levelNumber}
                id={`stage-card-${stage.levelNumber}`}
                onClick={() => {
                  onSelectStage(stage.levelNumber);
                  onClose();
                }}
                className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-900/50 border-stone-800 hover:border-stone-600 hover:bg-stone-800/60'
                }`}
              >
                <div>
                  {/* Top Row: Zone tag, Biome badge, Boss badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-amber-400 tracking-wider">
                      地下城 {stage.levelNumber.toString().padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      {stage.isBoss && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border border-red-700 bg-red-950/80 text-red-400">
                          <Skull className="w-3 h-3 text-red-500" />
                          领主
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {stage.title}
                  </h3>
                  <div className="text-[10px] text-stone-500 mb-1.5 tracking-wider">
                    {stage.subtitle}
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                {/* Bottom Action bar */}
                <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">
                    {stage.isBoss ? `★ 领主: ${stage.bossName?.split('//')[0] || 'BOSS'}` : '清理怪物 & 寻找宝箱'}
                  </span>
                  <span className="font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1 transition-colors">
                    {isCurrent ? '▶ 当前地下城' : '立即出征 >>'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-stone-900/90 text-center text-xs text-stone-400">
          ⚔️ 提示：地下城共设 10 关，每 3 关与第 10 关迎战独特领主 BOSS，通过第 10 关后将开启异次元深渊挑战！
        </div>
      </div>
    </div>
  );
};
