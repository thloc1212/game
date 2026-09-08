import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Radio, Wifi, CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

export const Game14CatchSignal: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [markerX, setMarkerX] = useState(50); // 5% to 95%
  const [markerDir, setMarkerDir] = useState<1 | -1>(1);
  const [round, setRound] = useState(1);
  const [results, setResults] = useState<('hit' | 'miss')[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Target green zone: between 40% and 62%
  const greenStart = 40;
  const greenEnd = 62;

  const markerXRef = useRef(50);
  markerXRef.current = markerX;

  // Move marker smoothly
  useEffect(() => {
    if (!isPlaying || results.length >= 5) return;

    const interval = setInterval(() => {
      setMarkerX((prev) => {
        let next = prev + markerDir * 1.8;
        if (next >= 95) {
          setMarkerDir(-1);
          next = 95;
        } else if (next <= 5) {
          setMarkerDir(1);
          next = 5;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [isPlaying, markerDir, results.length]);

  const handleConnect = useCallback(() => {
    if (!isPlaying || results.length >= 5) return;

    const currentPos = markerXRef.current;
    const isHit = currentPos >= greenStart && currentPos <= greenEnd;

    if (isHit) {
      sounds.playSuccess();
      setFeedback('✨ KẾT NỐI TÍN HIỆU THÀNH CÔNG!');
      setResults((prev) => [...prev, 'hit']);
    } else {
      sounds.playFail();
      setFeedback('❌ Tín hiệu lệch khỏi vùng xanh!');
      setResults((prev) => [...prev, 'miss']);
    }

    const nextRound = round + 1;
    setRound(nextRound);

    if (results.length + 1 >= 5) {
      const allResults = [...results, isHit ? 'hit' : 'miss'];
      const hitCount = allResults.filter((r) => r === 'hit').length;

      setTimeout(() => {
        if (hitCount >= 3) {
          sounds.playSuccess();
          onFinish(true, `Bắt sóng xuất sắc! Đạt ${hitCount}/5 lần khóa tín hiệu chuẩn!`);
        } else {
          sounds.playFail();
          onFinish(false, `Chưa đạt! Chỉ trúng ${hitCount}/5 lần (yêu cầu ít nhất 3 lần).`);
        }
      }, 1000);
    } else {
      setTimeout(() => setFeedback(null), 500);
    }
  }, [isPlaying, results, round, onFinish]);

  // Spacebar support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleConnect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleConnect]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      const hitCount = results.filter((r) => r === 'hit').length;
      if (hitCount >= 3) {
        sounds.playSuccess();
        onFinish(true, `Hết giờ! Bạn đã bắt trúng sóng ${hitCount}/5 lần!`);
      } else {
        sounds.playFail();
        onFinish(false, `Hết 15 giây! Chỉ bắt trúng ${hitCount}/5 lần.`);
      }
    }
  }, [isPlaying, timeLeft, results, onFinish]);

  const hitCount = results.filter((r) => r === 'hit').length;

  return (
    <div id="game-catch-signal" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Wifi className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Hiệp {Math.min(5, round)}/5</div>
            <div className="text-sm font-bold text-emerald-400">Bắt trúng: {hitCount}/3 mục tiêu</div>
          </div>
        </div>

        {/* 5 rounds indicators */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((idx) => {
            const res = results[idx];
            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold ${
                  res === 'hit'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : res === 'miss'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : idx === results.length
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-slate-800 text-slate-600 border-slate-700'
                }`}
              >
                {res === 'hit' ? '✓' : res === 'miss' ? '✗' : idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Signal Oscillation Visualizer */}
      <div className="relative w-full h-64 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 mb-5">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          BẤM CONNECT KHI CON TRỎ NẰM TRONG VÙNG XANH
        </div>

        {/* Signal Spectrum Bar */}
        <div className="relative w-full h-14 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center shadow-inner">
          {/* Red Left Zone */}
          <div className="h-full bg-red-950/60 border-r border-red-500/30 flex items-center justify-center" style={{ width: `${greenStart}%` }}>
            <span className="text-[10px] font-bold text-red-400/80">LỆCH TẦN</span>
          </div>

          {/* Green Sweet Spot Target Zone */}
          <div 
            className="h-full bg-emerald-500/30 border-x-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg relative overflow-hidden" 
            style={{ width: `${greenEnd - greenStart}%` }}
          >
            <div className="absolute inset-0 bg-emerald-400/20 animate-pulse pointer-events-none" />
            <span className="text-xs font-black text-emerald-300 tracking-wider z-10">VÙNG XANH 🎯</span>
          </div>

          {/* Red/Yellow Right Zone */}
          <div className="h-full bg-red-950/60 border-l border-red-500/30 flex items-center justify-center flex-1">
            <span className="text-[10px] font-bold text-red-400/80">LỆCH TẦN</span>
          </div>

          {/* Running Marker */}
          <div
            className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/80 z-20 transition-all duration-75 flex items-center justify-center"
            style={{ left: `${markerX}%` }}
          >
            <div className="w-1 h-8 bg-slate-950 rounded-full" />
          </div>
        </div>

        {feedback && (
          <div className="mt-6 text-sm font-bold text-amber-300 animate-fade-in">
            {feedback}
          </div>
        )}
      </div>

      {/* Connect Button */}
      <button
        id="catch-signal-connect-button"
        onClick={handleConnect}
        disabled={!isPlaying || results.length >= 5}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black text-xl tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 cursor-pointer border border-emerald-400/40 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Radio className="w-6 h-6 animate-pulse" />
        CONNECT SIGNAL (SPACE / CLICK)
      </button>
    </div>
  );
};
