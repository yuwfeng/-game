import React, { useState } from 'react';
import { X, Zap, Shield, Crosshair, Sparkles, Skull, Compass, Sword, Flame, Mountain } from 'lucide-react';

interface SkillGuideModalProps {
  onClose: () => void;
}

export const SkillGuideModal: React.FC<SkillGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'forms' | 'biomes' | 'enemies' | 'traps' | 'bosses'>('hero');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[88vh] rounded-xl bg-stone-950 border border-stone-700 shadow-[0_10px_40px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-stone-200">
        {/* Modal Header */}
        <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Sword className="w-5 h-5 text-red-500" />
            <h2 className="text-base sm:text-lg font-bold tracking-wider">
              阿拉德卷轴 // 鬼剑士技能出招、四大领地与领主图鉴
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950 px-3 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('hero')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hero' ? 'border-red-500 text-red-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            鬼剑士 · 基础招式
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'forms' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            四大职业觉醒
          </button>
          <button
            onClick={() => setActiveTab('biomes')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'biomes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            四大地下城领地 (10大关)
          </button>
          <button
            onClick={() => setActiveTab('enemies')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'enemies' ? 'border-rose-500 text-rose-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Skull className="w-4 h-4" />
            地下城怪物军团
          </button>
          <button
            onClick={() => setActiveTab('traps')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'traps' ? 'border-sky-500 text-sky-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            古代魔法阵与机关
          </button>
          <button
            onClick={() => setActiveTab('bosses')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bosses' ? 'border-red-600 text-red-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            四大史诗领主 BOSS
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: HERO & CONTROLS */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-stone-900/80 border border-stone-700">
                <div className="font-bold text-amber-400 text-sm mb-1">主角：鬼剑士 (SLAYER) - 被鬼神诅咒的剑士</div>
                <p className="text-stone-400 text-xs">
                  拥有被卡赞综合征侵蚀的【血色鬼手】，右手挥舞巨剑斩击，施展 8 向剑气斩击与鬼影步无敌闪避。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-stone-900/40 border border-stone-800 space-y-1">
                  <div className="text-amber-400 font-bold">8向波动剑气 (8-Way Sword Slash)</div>
                  <div className="text-xs text-stone-300">按住方向键（上/下/左/右/斜角）即可施展 8 向斜角精准巨剑剑气斩。</div>
                  <div className="text-[11px] text-red-400 font-semibold mt-1">按键：[J] 或 [X] 挥剑射击</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/40 border border-stone-800 space-y-1">
                  <div className="text-sky-400 font-bold">三段跃升 / 二段跳 (Air Leap)</div>
                  <div className="text-xs text-stone-300">在空中再次按下跳跃键，催动剑意踏空翻滚二次跳跃。</div>
                  <div className="text-[11px] text-sky-400 font-semibold mt-1">按键：[K] / [Z] / [Space]</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/40 border border-stone-800 space-y-1">
                  <div className="text-stone-300 font-bold">鬼影步冲刺 (Ghost Step Dash)</div>
                  <div className="text-xs text-stone-300">化作暗影残像向前极速冲刺，冲刺全程具备免伤无敌帧。</div>
                  <div className="text-[11px] text-stone-400 font-semibold mt-1">按键：[L] / [Shift] / [C]</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/40 border border-stone-800 space-y-1">
                  <div className="text-red-400 font-bold">极·鬼剑术奥义 (Awakening Nova)</div>
                  <div className="text-xs text-stone-300">MP 能量蓄满 100% 后爆发全屏万剑血浪，净化全屏敌弹并对全体敌怪造成毁灭性伤害。</div>
                  <div className="text-[11px] text-red-400 font-semibold mt-1">按键：[Q] / [E] / [⚡奥义按钮]</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5 FORMS */}
          {activeTab === 'forms' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-400">
                击碎地下城中的【古代黄金宝箱】或击败精英怪物，拾取职业灵魂晶石即可触发觉醒：
              </div>

              <div className="p-3.5 rounded-lg bg-sky-950/40 border border-sky-600/40 flex gap-3">
                <div className="p-2.5 rounded-lg bg-sky-900/50 text-sky-300 font-bold text-center min-w-[70px]">
                  剑神
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sky-300">万剑归宗 · 极·神剑术</div>
                  <div className="text-stone-300">周身环绕 5 柄飞剑，可凌空御剑全向飞行；挥剑时自动追加追踪飞剑射向敌人。</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-600/40 flex gap-3">
                <div className="p-2.5 rounded-lg bg-red-900/50 text-red-300 font-bold text-center min-w-[70px]">
                  狂战士
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-red-300">狱血魔神 · 血之狂暴</div>
                  <div className="text-stone-300">移动速度提升 150%，周身环绕血气护盾；触碰杂兵直接秒杀，免疫一切子弹与陷阱伤害！</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-600/40 flex gap-3">
                <div className="p-2.5 rounded-lg bg-amber-900/50 text-amber-300 font-bold text-center min-w-[70px]">
                  阿修罗
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-amber-300">天帝 · 修罗邪光斩</div>
                  <div className="text-stone-300">施展巨型雷光波动斩，具备【无视护盾 + 贯穿整条防线】特性，单发伤害极高，秒杀重盾牛头兵。</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-purple-950/40 border border-purple-600/40 flex gap-3">
                <div className="p-2.5 rounded-lg bg-purple-900/50 text-purple-300 font-bold text-center min-w-[70px]">
                  鬼泣
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-purple-300">黑暗君主 · 冥炎之卡洛</div>
                  <div className="text-stone-300">召唤鬼神卡洛助战，前方扇形同时发射 5 枚冥炎鬼火，大范围覆盖空中与地面群怪。</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BIOMES */}
          {activeTab === 'biomes' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-stone-900/60 border border-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Mountain className="w-4 h-4" />
                    <span>格兰之森 · 幽暗密林 (关卡 1, 2, 3)</span>
                  </div>
                  <div className="text-xs text-stone-300">月影树林与精灵遗迹。第 3 关迎战霸主【牛头王萨乌塔】。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/60 border border-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Flame className="w-4 h-4" />
                    <span>暗黑城 · 熔岩穴 (关卡 4, 5, 6)</span>
                  </div>
                  <div className="text-xs text-stone-300">熔岩沟渠与暗夜迷宫。第 6 关迎战地心巨龙【狂龙赫斯】。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/60 border border-sky-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>天帷巨兽 · 堕落之殿 (关卡 7, 8, 9)</span>
                  </div>
                  <div className="text-xs text-stone-300">飞天巨兽背脊失落神殿。第 9 关迎战使徒【第八使徒长脚罗特斯】。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/60 border border-purple-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>天空之城 · 光之圣殿 (关卡 10)</span>
                  </div>
                  <div className="text-xs text-stone-300">悬空神圣圣殿，迎战不灭铠甲领主【光之城主赛格哈特】！</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENEMIES */}
          {activeTab === 'enemies' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                  <div className="text-emerald-400 font-bold">1. 哥布林投石兵 (Goblin)</div>
                  <div className="text-xs text-stone-400">森林巡逻杂兵，投掷石块与木棒。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                  <div className="text-amber-400 font-bold">2. 巨斧牛头护卫 (Tau Guard)</div>
                  <div className="text-xs text-stone-400">手持精钢尖刺重盾，正面免伤；可用【阿修罗邪光斩】贯穿。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                  <div className="text-red-400 font-bold">3. 烈焰彼诺修幻影 (Fire Mage)</div>
                  <div className="text-xs text-stone-400">红袍魔法师，红线锁定后引爆烈焰光柱。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                  <div className="text-purple-400 font-bold">4. 暗咒暗杀猫妖 (Shadow Stalker)</div>
                  <div className="text-xs text-stone-400">暗影匿踪，高频瞬移投掷毒爪。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                  <div className="text-sky-400 font-bold">5. 天空之城翼魔 (Sky Demon)</div>
                  <div className="text-xs text-stone-400">石像鬼双翼，从高空俯冲投掷风刃。</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                  <div className="text-blue-400 font-bold">6. 暗黑电光水母 (Mana Jelly)</div>
                  <div className="text-xs text-stone-400">神庙水流游动，释放环形电磁波。</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRAPS & MECHANICS */}
          {activeTab === 'traps' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                <div className="text-cyan-400 font-bold">1. 古代升腾魔法阵 (Jump Sigil)</div>
                <div className="text-xs text-stone-300">踏入符文阵触发高空升腾推力，跨越石壁。</div>
              </div>

              <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                <div className="text-purple-400 font-bold">2. 幻影暗影虚空阶梯 (Phantom Floor)</div>
                <div className="text-xs text-stone-300">周期性隐现的虚空踏板，看准实体化时机起跳。</div>
              </div>

              <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                <div className="text-red-400 font-bold">3. 封印红光结界 (Sealing Barrier)</div>
                <div className="text-xs text-stone-300">高压封印术式，待能量衰减时迅速鬼影步通过。</div>
              </div>

              <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                <div className="text-amber-400 font-bold">4. 地心熔岩池 (Magma Cauldron)</div>
                <div className="text-xs text-stone-300">剧毒滚烫熔浆，掉入持续扣血，需借助漂浮平台通过。</div>
              </div>
            </div>
          )}

          {/* TAB 6: 4 BOSS ENCOUNTERS */}
          {activeTab === 'bosses' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-stone-900/60 border border-amber-800 space-y-1">
                <div className="font-bold text-amber-400 text-sm">Zone 03: 牛头王萨乌塔 (TAU KING SHAUTA)</div>
                <p className="text-xs text-stone-300">格兰之森霸主！挥舞巨斧狂暴冲撞、震地落石与血气狂暴三阶段。</p>
              </div>

              <div className="p-3 rounded-lg bg-stone-900/60 border border-red-800 space-y-1">
                <div className="font-bold text-red-400 text-sm">Zone 06: 狂龙赫斯 (MAGMA DRAGON HEISS)</div>
                <p className="text-xs text-stone-300">多节地心熔岩机械巨龙，在地底穿梭潜行，喷吐炽烈熔岩龙息与震地波。</p>
              </div>

              <div className="p-3 rounded-lg bg-stone-900/60 border border-sky-800 space-y-1">
                <div className="font-bold text-sky-400 text-sm">Zone 09: 第八使徒 · 长脚罗特斯 (APOSTLE LOTUS)</div>
                <p className="text-xs text-stone-300">使徒降临！千条激光触手横扫、深渊漩涡与深海震爆。</p>
              </div>

              <div className="p-3 rounded-lg bg-stone-900/60 border border-yellow-700 space-y-1">
                <div className="font-bold text-yellow-400 text-sm">Zone 10: 光之城主 · 赛格哈特 (LORD OF LIGHT SIEGHEART)</div>
                <p className="text-xs text-stone-300">天空之城巅峰终极战！不灭光之铠甲，六翼圣光羽翼，双光剑极光天罚！</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-900/90 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-amber-400 font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            返回地下城 (RESUME GAME)
          </button>
        </div>
      </div>
    </div>
  );
};
