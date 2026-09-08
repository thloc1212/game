import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

interface ItemObject {
  id: number;
  type: string;
  icon: string;
  x: number;
  y: number;
  size: number;
}

const ENTITY_TYPES = [
  { id: 'duck', name: 'con Vịt', icon: '🦆' },
  { id: 'cat', name: 'chú Mèo', icon: '🐱' },
  { id: 'laptop', name: 'chiếc Laptop', icon: '💻' },
  { id: 'bug', name: 'con Bọ', icon: '🐞' },
];

export const Game13QuickCount: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [phase, setPhase] = useState<'showing' | 'answering' | 'result'>('showing');
  const [showCountdown, setShowCountdown] = useState(2.5);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Setup game data once
  const gameData = useMemo(() => {
    // Pick target entity
    const targetType = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];
    // Target count between 5 and 9
    const targetCount = 5 + Math.floor(Math.random() * 5);

    // Other decoys count
    const decoys = ENTITY_TYPES.filter((t) => t.id !== targetType.id);

    const items: ItemObject[] = [];
    // Place target items
    for (let i = 0; i < targetCount; i++) {
      items.push({
        id: Math.random(),
        type: targetType.id,
        icon: targetType.icon,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 32 + Math.random() * 12,
      });
    }
    // Place some decoys (3 to 6)
    const decoyCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < decoyCount; i++) {
      const dec = decoys[Math.floor(Math.random() * decoys.length)];
      items.push({
        id: Math.random(),
        type: dec.id,
        icon: dec.icon,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 32 + Math.random() * 12,
      });
    }

    // 4 options
    const optionsSet = new Set<number>([targetCount]);
    while (optionsSet.size < 4) {
      const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, +1, +2
      const candidate = targetCount + delta;
      if (candidate > 0 && candidate !== targetCount) {
        optionsSet.add(candidate);
      }
    }
    const options = Array.from(optionsSet).sort((a, b) => a - b);

    return {
      targetType,
      targetCount,
      items,
      options,
    };
  }, []);

  // Show phase timer (2.5 seconds)
  useEffect(() => {
    if (!isPlaying || phase !== 'showing') return;

    sounds.playWhoosh();
    const timer = setTimeout(() => {
      setPhase('answering');
      sounds.playTick();
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPlaying, phase]);

  const handleSelectAnswer = useCallback((ans: number) => {
    if (phase !== 'answering') return;
    setSelectedAnswer(ans);
    setPhase('result');

    const isCorrect = ans === gameData.targetCount;
    if (isCorrect) {
      sounds.playSuccess();
      setTimeout(() => {
        onFinish(true, `Mắt sáng như gương! Chính xác có ${gameData.targetCount} ${gameData.targetType.name} ${gameData.targetType.icon}.`);
      }, 1200);
    } else {
      sounds.playFail();
      setTimeout(() => {
        onFinish(false, `Chưa đúng! Thực tế có đúng ${gameData.targetCount} ${gameData.targetType.name} ${gameData.targetType.icon}.`);
      }, 1400);
    }
  }, [phase, gameData, onFinish]);

  // Keyboard shortcut: 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'answering') return;
      if (e.key === '1' && gameData.options[0]) handleSelectAnswer(gameData.options[0]);
      if (e.key === '2' && gameData.options[1]) handleSelectAnswer(gameData.options[1]);
      if (e.key === '3' && gameData.options[2]) handleSelectAnswer(gameData.options[2]);
      if (e.key === '4' && gameData.options[3]) handleSelectAnswer(gameData.options[3]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, gameData.options, handleSelectAnswer]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0 && phase === 'answering') {
      sounds.playFail();
      onFinish(false, `Hết giờ! Đáp án là ${gameData.targetCount} ${gameData.targetType.name}.`);
    }
  }, [isPlaying, timeLeft, phase, gameData, onFinish]);

  return (
    <div id="game-quick-count" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Trạng Thái</div>
            <div className="text-sm font-bold text-teal-300">
              {phase === 'showing' ? '⚡ Hãy quan sát nhanh (2.5s)!' : 'Chọn đáp án đúng'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Yêu cầu</div>
          <div className="text-xs font-bold text-amber-300">Nhớ số lượng mục tiêu</div>
        </div>
      </div>

      {/* Observation Canvas */}
      <div className="relative w-full h-64 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center mb-5 p-4">
        {phase === 'showing' ? (
          gameData.items.map((item) => (
            <div
              key={item.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: `${item.size}px`,
              }}
            >
              {item.icon}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="text-5xl mb-3 animate-pulse">{gameData.targetType.icon}</div>
            <h3 className="text-xl font-bold text-slate-100">
              Có tất cả bao nhiêu <span className="text-teal-400 font-black underline decoration-teal-500">{gameData.targetType.name}</span> vừa xuất hiện?
            </h3>
          </div>
        )}
      </div>

      {/* 4 Number Options */}
      {phase !== 'showing' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {gameData.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === gameData.targetCount;

            let btnClass = 'bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:bg-slate-800 text-slate-100';

            if (phase === 'result') {
              if (isCorrect) {
                btnClass = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
              } else if (isSelected && !isCorrect) {
                btnClass = 'bg-rose-600/30 border-rose-500 text-rose-300 font-bold';
              } else {
                btnClass = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={option}
                id={`count-opt-${option}`}
                onClick={() => handleSelectAnswer(option)}
                disabled={phase === 'result'}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center active:scale-95 cursor-pointer shadow-lg transition-all ${btnClass}`}
              >
                <span className="text-3xl font-black">{option}</span>
                <span className="text-[10px] text-slate-500 mt-1">Phím [{idx + 1}]</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
