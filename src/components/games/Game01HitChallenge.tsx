import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Flame } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

const TARGET_HITS = 75;

export const Game01HitChallenge: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [hits, setHits] = useState(0);
  const [ripple, setRipple] = useState(false);
  const hitsRef = useRef(0);
  hitsRef.current = hits;

  const handleTap = useCallback(() => {
    if (!isPlaying) return;
    const nextHits = hitsRef.current + 1;
    setHits(nextHits);
    setRipple(true);
    setTimeout(() => setRipple(false), 80);
    sounds.playTap();

    if (nextHits >= TARGET_HITS) {
      sounds.playSuccess();
      onFinish(true, `Tuyệt đỉnh! Đạt ${TARGET_HITS} hit với ${timeLeft.toFixed(1)}s còn lại!`);
    }
  }, [isPlaying, onFinish, timeLeft]);

  // Keyboard shortcut: Spacebar or Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleTap]);

  // Check timeout
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (hitsRef.current < TARGET_HITS) {
        sounds.playFail();
        onFinish(false, `Hết giờ! Bạn đạt ${hitsRef.current}/${TARGET_HITS} hit.`);
      }
    }
  }, [isPlaying, timeLeft, onFinish]);

  const percentage = Math.min(100, Math.round((hits / TARGET_HITS) * 100));
  const cps = timeLeft < 10 ? ((hits / (10 - timeLeft)) || 0).toFixed(1) : '0.0';

  return (
    <div id="game-100-hit" className="flex flex-col items-center justify-center h-full max-w-lg mx-auto select-none px-4">
      {/* Target & CPS stats */}
      <div className="flex items-center justify-between w-full mb-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tốc độ hiện tại</div>
            <div className="text-xl font-bold text-amber-400">{cps} <span className="text-xs font-normal text-slate-400">click/giây</span></div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mục tiêu</div>
          <div className="text-xl font-bold text-slate-100">{TARGET_HITS} Hit</div>
        </div>
      </div>

      {/* Big Hit Button */}
      <div className="relative my-4">
        {/* Glow effect */}
        <div 
          className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full blur-xl opacity-30 transition-opacity"
          style={{ opacity: Math.min(0.8, 0.2 + (hits / TARGET_HITS) * 0.6) }}
        />

        <button
          id="hit-button"
          onClick={handleTap}
          disabled={!isPlaying}
          className={`relative w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-90 shadow-2xl cursor-pointer
            ${ripple ? 'scale-95 ring-8 ring-amber-400/50' : 'scale-100 ring-4 ring-amber-500/30'}
            bg-gradient-to-b from-amber-500 to-red-600 border-4 border-amber-300/40`}
        >
          <Zap className="w-12 h-12 text-white fill-white mb-2 drop-shadow-md animate-bounce" />
          <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
            {hits}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-100/90 mt-1">
            / {TARGET_HITS} TAP
          </span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-6">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
          <span>Tiến độ hoàn thành</span>
          <span className="text-amber-400">{percentage}%</span>
        </div>
        <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Mẹo: Có thể dùng đồng thời cả phím <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">Space</kbd> và chuột để bấm nhanh gấp đôi!
      </p>
    </div>
  );
};
