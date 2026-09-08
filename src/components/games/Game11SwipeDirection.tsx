import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const DIRECTIONS: { dir: Direction; label: string; arrow: string; keyName: string }[] = [
  { dir: 'UP', label: 'LÊN', arrow: '↑', keyName: '↑ hoặc W' },
  { dir: 'DOWN', label: 'XUỐNG', arrow: '↓', keyName: '↓ hoặc S' },
  { dir: 'LEFT', label: 'TRÁI', arrow: '←', keyName: '← hoặc A' },
  { dir: 'RIGHT', label: 'PHẢI', arrow: '→', keyName: '→ hoặc D' },
];

export const Game11SwipeDirection: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [currentDir, setCurrentDir] = useState<Direction>('UP');
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const correctRef = useRef(0);
  correctRef.current = correctCount;
  const currentDirRef = useRef<Direction>('UP');
  currentDirRef.current = currentDir;

  const nextArrow = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * DIRECTIONS.length);
    setCurrentDir(DIRECTIONS[randomIdx].dir);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      nextArrow();
    }
  }, [isPlaying, nextArrow]);

  const handleInput = useCallback((dir: Direction) => {
    if (!isPlaying) return;

    const isCorrect = dir === currentDirRef.current;
    setTotalAttempts((t) => t + 1);

    if (isCorrect) {
      sounds.playTap();
      setFeedback('correct');
      const newScore = correctRef.current + 1;
      setCorrectCount(newScore);

      if (newScore >= 10) {
        sounds.playSuccess();
        onFinish(true, `Phản xạ chớp nhoáng! Đạt 10/12 lượt chuẩn xác!`);
        return;
      }
      nextArrow();
    } else {
      sounds.playFail();
      setFeedback('wrong');
      nextArrow();
    }

    setTimeout(() => setFeedback(null), 250);
  }, [isPlaying, nextArrow, onFinish]);

  // Touch / Drag detection
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) {
        handleInput(dx > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(dy) > 30) {
        handleInput(dy > 0 ? 'DOWN' : 'UP');
      }
    }
  };

  // Keyboard navigation: Arrows and WASD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleInput('UP');
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleInput('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleInput('LEFT');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleInput('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleInput]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (correctRef.current >= 10) {
        sounds.playSuccess();
        onFinish(true, `Hết giờ! Bạn vuốt đúng ${correctRef.current}/12 lượt (Mục tiêu: >=10).`);
      } else {
        sounds.playFail();
        onFinish(false, `Hết 15 giây! Chỉ đạt ${correctRef.current}/12 lượt.`);
      }
    }
  }, [isPlaying, timeLeft, onFinish]);

  const currentItem = DIRECTIONS.find((d) => d.dir === currentDir);

  return (
    <div 
      id="game-swipe-direction" 
      className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Tiến Độ Vuốt Đúng</div>
            <div className="text-xl font-black text-sky-400">{correctCount} <span className="text-xs text-slate-500 font-normal">/ 10 lượt</span></div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phím tắt</div>
          <div className="text-xs font-bold text-amber-300">Phím Mũi Tên hoặc W/A/S/D</div>
        </div>
      </div>

      {/* Direction Arrow Display Card */}
      <div className="relative w-full h-60 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          HƯỚNG YÊU CẦU: {currentItem?.label}
        </span>

        <div 
          className={`w-28 h-28 rounded-3xl flex items-center justify-center text-7xl font-black shadow-xl transition-all duration-100 ${
            feedback === 'correct'
              ? 'bg-emerald-500 text-white scale-110'
              : feedback === 'wrong'
              ? 'bg-rose-500 text-white scale-90'
              : 'bg-sky-500 text-white shadow-sky-500/40'
          }`}
        >
          {currentItem?.arrow}
        </div>
      </div>

      {/* D-Pad Buttons for Mouse / Tap */}
      <div className="grid grid-cols-3 gap-2 w-56">
        <div />
        <button
          onClick={() => handleInput('UP')}
          className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer shadow-md"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          onClick={() => handleInput('LEFT')}
          className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleInput('DOWN')}
          className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer shadow-md"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleInput('RIGHT')}
          className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer shadow-md"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
