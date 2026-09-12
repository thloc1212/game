import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Palette } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

interface ColorDef {
  id: string;
  name: string;
  tailwindClass: string;
  hex: string;
  buttonClass: string;
  keyNum: string;
}

const COLOR_PALETTE: ColorDef[] = [
  { id: 'red', name: 'ĐỎ', tailwindClass: 'text-red-500', hex: '#ef4444', buttonClass: 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30', keyNum: '1' },
  { id: 'green', name: 'LỤC', tailwindClass: 'text-emerald-400', hex: '#34d399', buttonClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30', keyNum: '2' },
  { id: 'yellow', name: 'VÀNG', tailwindClass: 'text-yellow-400', hex: '#facc15', buttonClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30', keyNum: '3' },
  { id: 'blue', name: 'LAM', tailwindClass: 'text-sky-400', hex: '#38bdf8', buttonClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30', keyNum: '4' },
  { id: 'purple', name: 'TÍM', tailwindClass: 'text-purple-400', hex: '#c084fc', buttonClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30', keyNum: '5' },
  { id: 'orange', name: 'CAM', tailwindClass: 'text-orange-400', hex: '#fb923c', buttonClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30', keyNum: '6' },
];

const TARGET_SCORE = 10;

export const Game10ColorConfusion: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [correctCount, setCorrectCount] = useState(0);
  const [wordText, setWordText] = useState('ĐỎ');
  const [actualColor, setActualColor] = useState<ColorDef>(COLOR_PALETTE[1]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const correctRef = useRef(0);
  correctRef.current = correctCount;

  const nextQuestion = useCallback(() => {
    // Six one-word colors and a 90% conflict rate make the Stroop choice less predictable.
    const textIdx = Math.floor(Math.random() * COLOR_PALETTE.length);
    let colorIdx = textIdx;
    if (Math.random() < 0.9) {
      do {
        colorIdx = Math.floor(Math.random() * COLOR_PALETTE.length);
      } while (colorIdx === textIdx);
    }

    setWordText(COLOR_PALETTE[textIdx].name);
    setActualColor(COLOR_PALETTE[colorIdx]);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      nextQuestion();
    }
  }, [isPlaying, nextQuestion]);

  const handleAnswer = useCallback((chosenId: string) => {
    if (!isPlaying) return;

    if (chosenId === actualColor.id) {
      sounds.playTap();
      const newScore = correctRef.current + 1;
      setCorrectCount(newScore);
      setFeedback('✨ Đúng!');
      setTimeout(() => setFeedback(null), 300);

      if (newScore >= TARGET_SCORE) {
        sounds.playSuccess();
        onFinish(true, `Phản xạ màu sắc xuất chúng! Đạt ${newScore} lượt chuẩn xác!`);
        return;
      }
      nextQuestion();
    } else {
      sounds.playFail();
      setFeedback('❌ Sai màu thực tế!');
      setTimeout(() => setFeedback(null), 400);
      nextQuestion();
    }
  }, [isPlaying, actualColor.id, nextQuestion, onFinish]);

  // Keyboard shortcut: 1-6
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const selectedColor = COLOR_PALETTE.find((color) => color.keyNum === e.key);
      if (selectedColor) handleAnswer(selectedColor.id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleAnswer]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (correctRef.current >= TARGET_SCORE) {
        sounds.playSuccess();
        onFinish(true, `Hết giờ! Bạn trả lời đúng ${correctRef.current} lượt (Mục tiêu >= ${TARGET_SCORE}).`);
      } else {
        sounds.playFail();
        onFinish(false, `Hết 15 giây! Chỉ đạt ${correctRef.current}/${TARGET_SCORE} lượt.`);
      }
    }
  }, [isPlaying, timeLeft, onFinish]);

  return (
    <div id="game-color-confusion" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Số Lượt Đúng</div>
            <div className="text-xl font-black text-fuchsia-400">{correctCount} <span className="text-xs text-slate-500 font-normal">/ {TARGET_SCORE} lượt</span></div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quy tắc vàng</div>
          <div className="text-xs font-bold text-amber-300">Chọn theo MÀU MẮT THẤY</div>
        </div>
      </div>

      {/* Stroop Word Display */}
      <div className="relative w-full py-12 px-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          MÀU CỦA CHỮ NÀY LÀ GÌ?
        </span>

        <div 
          className={`text-6xl md:text-7xl font-black tracking-wider transition-all duration-150 transform hover:scale-105 drop-shadow-lg ${actualColor.tailwindClass}`}
        >
          {wordText}
        </div>

        {feedback && (
          <div className="absolute bottom-3 font-bold text-sm text-slate-300 animate-pulse">
            {feedback}
          </div>
        )}
      </div>

      {/* 6 Color Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color.id}
            id={`color-btn-${color.id}`}
            onClick={() => handleAnswer(color.id)}
            disabled={!isPlaying}
            className={`py-3 px-4 rounded-2xl border-2 font-black text-base tracking-wider transition-all duration-100 flex items-center justify-between active:scale-95 cursor-pointer shadow-lg ${color.buttonClass}`}
          >
            <span>{color.name}</span>
            <span className="text-xs font-normal opacity-70 px-2 py-0.5 rounded bg-slate-900/60 font-mono">
              Phím [{color.keyNum}]
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
