import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Eye, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

export const Game09MemoryGrid: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [targetIndices, setTargetIndices] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'evaluated'>('memorize');
  const [memorizeSeconds, setMemorizeSeconds] = useState(2);

  // Initialize random 6 tiles out of 16 (4x4)
  useEffect(() => {
    const indices: number[] = [];
    while (indices.length < 6) {
      const rand = Math.floor(Math.random() * 16);
      if (!indices.includes(rand)) indices.push(rand);
    }
    setTargetIndices(indices);
  }, []);

  // Memorize phase timer (2 seconds)
  useEffect(() => {
    if (!isPlaying || targetIndices.length === 0 || phase !== 'memorize') return;

    sounds.playWhoosh();
    const interval = setInterval(() => {
      setMemorizeSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('recall');
          sounds.playTick();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, targetIndices, phase]);

  const handleToggleCell = useCallback((idx: number) => {
    if (!isPlaying || phase !== 'recall') return;

    sounds.playTap();
    setSelectedIndices((prev) => {
      let next: number[];
      if (prev.includes(idx)) {
        next = prev.filter((i) => i !== idx);
      } else {
        if (prev.length >= 6) return prev; // max 6 picks
        next = [...prev, idx];
      }
      return next;
    });
  }, [isPlaying, phase]);

  const handleEvaluate = useCallback(() => {
    if (phase !== 'recall') return;
    setPhase('evaluated');

    const correctPicks = selectedIndices.filter((idx) => targetIndices.includes(idx)).length;

    if (correctPicks >= 5) {
      sounds.playSuccess();
      onFinish(true, `Trí nhớ siêu đẳng! Bạn đã đoán đúng ${correctPicks}/6 ô sáng!`);
    } else {
      sounds.playFail();
      onFinish(false, `Chưa đạt! Bạn chọn đúng ${correctPicks}/6 ô (yêu cầu ít nhất 5/6).`);
    }
  }, [phase, selectedIndices, targetIndices, onFinish]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0 && phase === 'recall') {
      handleEvaluate();
    }
  }, [isPlaying, timeLeft, phase, handleEvaluate]);

  return (
    <div id="game-memory-grid" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Trạng thái</div>
            <div className="text-sm font-bold text-indigo-300">
              {phase === 'memorize' ? `Ghi nhớ ô sáng (${memorizeSeconds}s)` : `Đã chọn: ${selectedIndices.length}/6 ô`}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mục tiêu</div>
          <div className="text-xs font-bold text-amber-300">Đúng ít nhất 5/6 ô</div>
        </div>
      </div>

      {/* 4x4 Grid Matrix */}
      <div className="grid grid-cols-4 gap-3.5 p-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl mb-5">
        {Array.from({ length: 16 }).map((_, idx) => {
          const isTarget = targetIndices.includes(idx);
          const isSelected = selectedIndices.includes(idx);
          const isCorrect = isTarget && isSelected;
          const isWrong = isSelected && !isTarget;
          const isMissed = phase === 'evaluated' && isTarget && !isSelected;

          let cellClass = 'bg-slate-800/80 border-slate-700/80 hover:border-slate-500';

          if (phase === 'memorize' && isTarget) {
            cellClass = 'bg-cyan-500 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-105 animate-pulse';
          } else if (phase === 'recall') {
            if (isSelected) {
              cellClass = 'bg-indigo-600 border-indigo-300 shadow-md scale-95';
            }
          } else if (phase === 'evaluated') {
            if (isCorrect) {
              cellClass = 'bg-emerald-600 border-emerald-300 shadow-md';
            } else if (isWrong) {
              cellClass = 'bg-rose-600 border-rose-300 shadow-md';
            } else if (isMissed) {
              cellClass = 'bg-amber-600/40 border-amber-400 border-dashed';
            }
          }

          return (
            <button
              key={idx}
              id={`grid-cell-${idx}`}
              onClick={() => handleToggleCell(idx)}
              disabled={phase !== 'recall'}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-150 flex items-center justify-center font-bold text-xl cursor-pointer ${cellClass}`}
            >
              {phase === 'memorize' && isTarget && '💡'}
              {phase === 'recall' && isSelected && '✓'}
              {phase === 'evaluated' && isCorrect && '✓'}
              {phase === 'evaluated' && isWrong && '✗'}
              {phase === 'evaluated' && isMissed && '⚠️'}
            </button>
          );
        })}
      </div>

      {/* Confirm Button during recall */}
      {phase === 'recall' && (
        <button
          id="memory-confirm-button"
          onClick={handleEvaluate}
          disabled={selectedIndices.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 text-white font-black text-lg tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/40 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" />
          XÁC NHẬN KẾT QUẢ ({selectedIndices.length}/6 Ô)
        </button>
      )}
    </div>
  );
};
