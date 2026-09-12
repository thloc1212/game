import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flag, ArrowLeft } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

export const Game03TugOfWar: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  // -100 = Player Wins, +100 = CPU Wins
  const [ropePosition, setRopePosition] = useState(0);
  const ropePosRef = useRef(0);
  ropePosRef.current = ropePosition;

  // CPU pulls rope toward right (+direction)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setRopePosition((prev) => {
        // The CPU sometimes yanks the rope much harder than its normal pull.
        const isPowerBurst = Math.random() < 0.16;
        const pullForce = 2.4 + Math.random() * 1.5 + (isPowerBurst ? 3.2 + Math.random() * 2.3 : 0);
        const next = prev + pullForce;
        if (next >= 100) {
          sounds.playFail();
          onFinish(false, 'CPU đã kéo cờ vượt qua vạch của họ!');
          return 100;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, onFinish]);

  const handlePull = useCallback(() => {
    if (!isPlaying) return;
    sounds.playTap();

    setRopePosition((prev) => {
      const next = prev - 4.6;
      if (next <= -100) {
        sounds.playSuccess();
        onFinish(true, 'Tuyệt vời! Bạn đã kéo phăng đối thủ qua vạch chiến thắng!');
        return -100;
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
        handlePull();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handlePull]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (ropePosRef.current <= -30) {
        sounds.playSuccess();
        onFinish(true, 'Hết giờ! Lá cờ nằm nghiêng hẳn về phía bạn, chiến thắng thuyết phục!');
      } else {
        sounds.playFail();
        onFinish(false, 'Hết 12 giây! Bạn chưa kéo được cờ qua vạch thắng.');
      }
    }
  }, [isPlaying, timeLeft, onFinish]);

  return (
    <div id="game-tug-of-war" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Battle Status Banner */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black border border-cyan-500/30">
            BẠN
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Đội Của Bạn</div>
            <div className="text-sm font-bold text-cyan-400">Kéo về bên Trái</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-slate-400">Mục tiêu</div>
          <div className="text-sm font-black text-amber-400">VƯỢT VẠCH TRÁI</div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs font-semibold text-slate-400">Đối thủ Máy</div>
            <div className="text-sm font-bold text-rose-400">Kéo về bên Phải</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black border border-rose-500/30">
            CPU
          </div>
        </div>
      </div>

      {/* Tug of War Arena Canvas/Field */}
      <div className="relative w-full h-56 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-center px-4">
        {/* Win boundaries */}
        <div className="absolute top-0 bottom-0 left-16 w-1 bg-cyan-500/80 border-r border-dashed border-cyan-300">
          <span className="absolute bottom-2 left-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            VẠCH THẮNG
          </span>
        </div>
        <div className="absolute top-0 bottom-0 right-16 w-1 bg-rose-500/80 border-l border-dashed border-rose-300">
          <span className="absolute bottom-2 right-2 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            VẠCH CPU
          </span>
        </div>
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-700/60" />

        {/* Rope Graphic */}
        <div className="relative w-full flex items-center py-6">
          {/* Left team stickmen */}
          <div className="absolute left-2 flex items-center text-3xl select-none z-10">
            🏃‍♂️💨
          </div>

          {/* Rope strand */}
          <div className="w-full h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full shadow-inner border border-amber-800/80" />

          {/* Right team stickmen */}
          <div className="absolute right-2 flex items-center text-3xl select-none z-10 scale-x-[-1]">
            🤖💨
          </div>

          {/* Flag in center */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-75 z-20 flex flex-col items-center"
            style={{ left: `${50 + (ropePosition * 0.38)}%` }}
          >
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg ring-4 ring-amber-400/40">
              <Flag className="w-5 h-5 fill-slate-950" />
            </div>
            <div className="w-1 h-8 bg-amber-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Button to Pull */}
      <button
        id="tug-pull-button"
        onClick={handlePull}
        disabled={!isPlaying}
        className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-black text-xl tracking-wider shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-3 cursor-pointer border border-cyan-400/40 transition-transform"
      >
        <ArrowLeft className="w-6 h-6 animate-pulse" />
        KÉO DÂY (CLICK HOẶC SPACE)
      </button>
    </div>
  );
};
