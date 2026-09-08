import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { RIDDLES, Riddle } from '../../data/riddles';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

export const Game12Riddles: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Pick random riddle and shuffle its options
  const riddleData = useMemo(() => {
    const rawRiddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    const correctText = rawRiddle.options[rawRiddle.correctIndex];
    // Shuffle options
    const shuffled = [...rawRiddle.options].sort(() => Math.random() - 0.5);
    const newCorrectIdx = shuffled.indexOf(correctText);

    return {
      question: rawRiddle.question,
      options: shuffled,
      correctIndex: newCorrectIdx,
      explanation: rawRiddle.explanation,
    };
  }, []);

  const handleSelectOption = useCallback((idx: number) => {
    if (!isPlaying || revealed) return;

    setSelectedIdx(idx);
    setRevealed(true);

    const isCorrect = idx === riddleData.correctIndex;
    if (isCorrect) {
      sounds.playSuccess();
      setTimeout(() => {
        onFinish(true, `Chính xác! ${riddleData.explanation}`);
      }, 1200);
    } else {
      sounds.playFail();
      setTimeout(() => {
        onFinish(false, `Chưa đúng! Đáp án đúng là: "${riddleData.options[riddleData.correctIndex]}". ${riddleData.explanation}`);
      }, 1400);
    }
  }, [isPlaying, revealed, riddleData, onFinish]);

  // Keyboard shortcut: 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || revealed) return;
      if (e.key === '1') handleSelectOption(0);
      if (e.key === '2') handleSelectOption(1);
      if (e.key === '3') handleSelectOption(2);
      if (e.key === '4') handleSelectOption(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, revealed, handleSelectOption]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0 && !revealed) {
      sounds.playFail();
      onFinish(false, `Hết 15 giây! Đáp án là "${riddleData.options[riddleData.correctIndex]}".`);
    }
  }, [isPlaying, timeLeft, revealed, riddleData, onFinish]);

  return (
    <div id="game-smart-riddles" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Question Card */}
      <div className="relative w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-6 shadow-2xl mb-5">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>CÂU ĐỐ DÂN GIAN &amp; LOGIC VUI (15 GIÂY)</span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
          {riddleData.question}
        </h3>
      </div>

      {/* 4 Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {riddleData.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = idx === riddleData.correctIndex;

          let btnStyle = 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-200';

          if (revealed) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-300 font-bold';
            } else {
              btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              id={`riddle-opt-${idx}`}
              onClick={() => handleSelectOption(idx)}
              disabled={!isPlaying || revealed}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left active:scale-95 cursor-pointer shadow-lg ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400">
                  {idx + 1}
                </span>
                <span className="text-base font-semibold">{option}</span>
              </div>

              {revealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {revealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-slate-300 text-center animate-fade-in w-full">
          💡 {riddleData.explanation}
        </div>
      )}
    </div>
  );
};
