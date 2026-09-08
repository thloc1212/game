import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Square, Award } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

export const Game08Stopwatch: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const updateTimer = useCallback(() => {
    const now = performance.now();
    const currentElapsed = (now - startTimeRef.current) / 1000;
    setElapsed(currentElapsed);

    // Auto fail if running past 7 seconds
    if (currentElapsed > 7.5) {
      handleStop(currentElapsed);
      return;
    }

    animFrameRef.current = requestAnimationFrame(updateTimer);
  }, []);

  const handleStart = useCallback(() => {
    if (!isPlaying || running || hasStarted) return;
    sounds.playTap();
    setHasStarted(true);
    setRunning(true);
    startTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(updateTimer);
  }, [isPlaying, running, hasStarted, updateTimer]);

  const handleStop = useCallback((forceElapsed?: number) => {
    if (!running) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setRunning(false);

    const finalTime = forceElapsed !== undefined ? forceElapsed : (performance.now() - startTimeRef.current) / 1000;
    setStoppedAt(finalTime);

    const diff = Math.abs(finalTime - 5.00);
    const inRange = finalTime >= 4.90 && finalTime <= 5.10;

    if (inRange) {
      sounds.playSuccess();
      onFinish(true, `Tuyệt đỉnh giác quan! Dừng lúc ${finalTime.toFixed(2)}s (chênh lệch chỉ ${diff.toFixed(2)}s)!`);
    } else {
      sounds.playFail();
      onFinish(false, `Dừng lúc ${finalTime.toFixed(2)}s. Vùng trúng thưởng là 4.90s - 5.10s.`);
    }
  }, [running, onFinish]);

  // Spacebar support for both START and STOP
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!hasStarted) {
          handleStart();
        } else if (running) {
          handleStop();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, hasStarted, running, handleStart, handleStop]);

  // Cleanup anim frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Is display hidden (after 2.00s)
  const isHidden = running && elapsed >= 2.0;

  return (
    <div id="game-stopwatch" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Target Info */}
      <div className="flex items-center justify-between w-full mb-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Vùng Đích Chuẩn</div>
            <div className="text-lg font-black text-violet-400">4.90s - 5.10s</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quy tắc ẩn số</div>
          <div className="text-xs font-bold text-amber-300">Ẩn màn hình sau 2.00s</div>
        </div>
      </div>

      {/* Digital Stopwatch Display Box */}
      <div className="relative w-full py-12 px-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border-2 border-violet-500/30 shadow-2xl flex flex-col items-center justify-center mb-6">
        {/* Glowing border glow */}
        <div className="absolute -inset-1 bg-violet-500/10 rounded-3xl blur-md pointer-events-none" />

        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          {running ? (isHidden ? '⏳ ĐANG ẨN SỐ - HÃY TỰ CẢM NHẬN!' : 'ĐANG ĐẾM THỜI GIAN...') : stoppedAt !== null ? 'KẾT QUẢ CỦA BẠN' : 'SẴN SÀNG'}
        </span>

        {/* Big Digit Screen */}
        <div className="text-6xl md:text-7xl font-mono font-black tracking-tight text-slate-100 flex items-center justify-center">
          {stoppedAt !== null ? (
            <span className={stoppedAt >= 4.90 && stoppedAt <= 5.10 ? 'text-emerald-400' : 'text-rose-400'}>
              {stoppedAt.toFixed(2)}s
            </span>
          ) : isHidden ? (
            <span className="text-amber-400 animate-pulse tracking-widest">
              ? . ? ? s
            </span>
          ) : (
            <span>{elapsed.toFixed(2)}s</span>
          )}
        </div>

        {stoppedAt !== null && (
          <div className="mt-3 text-sm font-semibold text-slate-300">
            Sai số: <span className="font-mono text-amber-400">{Math.abs(stoppedAt - 5.00).toFixed(2)}s</span>
          </div>
        )}
      </div>

      {/* Action Control Buttons */}
      {!hasStarted ? (
        <button
          id="stopwatch-start-button"
          onClick={handleStart}
          disabled={!isPlaying}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xl tracking-wider shadow-xl shadow-violet-600/30 flex items-center justify-center gap-3 cursor-pointer border border-violet-400/40 transition-transform"
        >
          <Play className="w-6 h-6 fill-white" />
          BẤM START (HOẶC SPACE)
        </button>
      ) : running ? (
        <button
          id="stopwatch-stop-button"
          onClick={() => handleStop()}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-xl tracking-wider shadow-xl shadow-rose-600/40 flex items-center justify-center gap-3 cursor-pointer border border-rose-400/50 transition-transform animate-pulse"
        >
          <Square className="w-6 h-6 fill-white" />
          DỪNG LẠI NGAY (STOP / SPACE)!
        </button>
      ) : null}
    </div>
  );
};
