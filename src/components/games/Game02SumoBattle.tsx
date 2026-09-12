import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Swords, Zap } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

export const Game02SumoBattle: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  // Position offset: 0 = dead center, -100 = Player out of ring, +100 = CPU out of ring
  const [position, setPosition] = useState(0);
  const [playerAnim, setPlayerAnim] = useState(false);
  const positionRef = useRef(0);
  positionRef.current = position;

  // CPU push force interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      // CPU has occasional explosive pushes, so the player cannot settle into a fixed rhythm.
      setPosition((prev) => {
        const isPowerBurst = Math.random() < 0.18;
        const pushForce = 2.8 + Math.random() * 1.8 + (isPowerBurst ? 3.5 + Math.random() * 2.5 : 0);
        const next = prev - pushForce;
        if (next <= -100) {
          sounds.playFail();
          onFinish(false, 'CPU đã đẩy ngã bạn ra khỏi vòng võ đài!');
          return -100;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, onFinish]);

  const handlePush = useCallback(() => {
    if (!isPlaying) return;
    setPlayerAnim(true);
    setTimeout(() => setPlayerAnim(false), 90);
    sounds.playHit();

    setPosition((prev) => {
      const next = prev + 5.0;
      if (next >= 100) {
        sounds.playSuccess();
        onFinish(true, 'Xuất sắc! Bạn đã đẩy văng võ sĩ CPU ra khỏi sàn đấu!');
        return 100;
      }
      return next;
    });
  }, [isPlaying, onFinish]);

  // Spacebar and Click support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handlePush();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handlePush]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (positionRef.current >= 40) {
        sounds.playSuccess();
        onFinish(true, 'Hết giờ! Bạn chiếm thế thượng phong áp đảo và giành chiến thắng!');
      } else {
        sounds.playFail();
        onFinish(false, 'Hết 10 giây! Chưa thể đẩy ngã CPU ra ngoài võ đài.');
      }
    }
  }, [isPlaying, timeLeft, onFinish]);

  // Visual percentages
  const dohyoWidthPercent = 50 + position * 0.45; // 5% to 95%

  return (
    <div id="game-sumo" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Versus Status Banner */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black border border-orange-500/30">
            YOU
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Võ Sĩ Của Bạn</div>
            <div className="text-sm font-bold text-orange-400">Lực Đẩy Bộc Phá</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
          <Swords className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">VS</span>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs font-semibold text-slate-400">Võ Sĩ Đối Thủ</div>
            <div className="text-sm font-bold text-rose-400">CPU Sumo Master</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black border border-rose-500/30">
            CPU
          </div>
        </div>
      </div>

      {/* Sumo Ring (Dohyo) */}
      <div className="relative w-full h-64 bg-gradient-to-b from-amber-950/40 via-stone-900/80 to-amber-950/50 rounded-3xl border-4 border-amber-800/60 overflow-hidden shadow-2xl flex items-center justify-center p-4">
        {/* Dohyo Ring Circles & Sand Texture */}
        <div className="absolute inset-x-8 inset-y-6 rounded-full border-4 border-dashed border-amber-600/30 pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 left-4 w-1 h-3/4 bg-rose-500/60 rounded-full" />
        <div className="absolute top-1/2 -translate-y-1/2 right-4 w-1 h-3/4 bg-emerald-500/60 rounded-full" />
        
        {/* Ring Labels */}
        <span className="absolute left-6 top-3 text-[10px] font-bold uppercase tracking-wider text-rose-400">Mép Thua</span>
        <span className="absolute right-6 top-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Vạch Thắng</span>
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-r border-dashed border-amber-500/20" />

        {/* Both Sumo Fighters Container */}
        <div 
          className="relative flex items-center transition-all duration-75 ease-out"
          style={{ transform: `translateX(${position * 1.8}px)` }}
        >
          {/* Player Sumo */}
          <div className={`relative flex flex-col items-center mr-[-10px] z-10 transition-transform ${playerAnim ? 'scale-110 -rotate-3' : ''}`}>
            <div className="text-4xl drop-shadow-lg">🤼</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500 text-white shadow-sm mt-1">BẠN</span>
          </div>

          {/* Clash Impact FX */}
          <div className="z-20 text-amber-300 font-black text-xs animate-ping">
            💥
          </div>

          {/* CPU Sumo */}
          <div className="relative flex flex-col items-center ml-[-10px] z-10">
            <div className="text-4xl drop-shadow-lg scale-x-[-1]">🤼</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white shadow-sm mt-1">CPU</span>
          </div>
        </div>
      </div>

      {/* Ring Meter Indicator */}
      <div className="w-full mt-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
          <span className="text-rose-400">Nguy hiểm</span>
          <span className="text-slate-300">Vị trí giao tranh</span>
          <span className="text-emerald-400">Chiến thắng</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-rose-500/20" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-emerald-500/20" />
          <div 
            className="absolute top-0 bottom-0 w-4 -ml-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg transition-all duration-75"
            style={{ left: `${dohyoWidthPercent}%` }}
          />
        </div>
      </div>

      {/* Tap / Push Action Button */}
      <button
        id="sumo-push-button"
        onClick={handlePush}
        disabled={!isPlaying}
        className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-95 text-white font-black text-xl tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 transition-transform cursor-pointer border border-orange-400/40"
      >
        <Zap className="w-6 h-6 animate-bounce" />
        ĐẨY CỰC MẠNH (TAP / SPACE)
      </button>
    </div>
  );
};
