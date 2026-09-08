import React, { useState, useEffect, useCallback } from 'react';
import { Puzzle, RotateCw, Users, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

interface PieceState {
  id: number; // 0: TL, 1: TR, 2: BL, 3: BR
  currentSlot: number; // 0, 1, 2, 3
  rotation: number; // 0, 90, 180, 270
}

export const Game15PuzzleCoop: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  // Initialize shuffled positions & rotations
  const [pieces, setPieces] = useState<PieceState[]>([
    { id: 0, currentSlot: 1, rotation: 90 },
    { id: 1, currentSlot: 0, rotation: 180 },
    { id: 2, currentSlot: 3, rotation: 270 },
    { id: 3, currentSlot: 2, rotation: 90 },
  ]);
  const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<number | null>(null);

  // Check if solved: every piece must be in its target id slot and rotation % 360 === 0
  const checkWinCondition = useCallback((currentPieces: PieceState[]) => {
    const isSolved = currentPieces.every(
      (p) => p.currentSlot === p.id && p.rotation % 360 === 0
    );

    if (isSolved) {
      sounds.playSuccess();
      sounds.playWinFanfare();
      onFinish(true, 'Đồng Tâm Hiệp Lực thành công! Bức hình TechPoly hoàn chỉnh 100%!');
    }
  }, [onFinish]);

  // Rotate piece at given slot
  const handleRotateSlot = useCallback((slotIdx: number) => {
    if (!isPlaying) return;
    sounds.playTap();

    setPieces((prev) => {
      const next = prev.map((p) => {
        if (p.currentSlot === slotIdx) {
          return { ...p, rotation: (p.rotation + 90) % 360 };
        }
        return p;
      });
      checkWinCondition(next);
      return next;
    });
  }, [isPlaying, checkWinCondition]);

  // Swap pieces between two slots
  const handleSelectSlot = useCallback((slotIdx: number) => {
    if (!isPlaying) return;

    if (selectedSlotForSwap === null) {
      setSelectedSlotForSwap(slotIdx);
      sounds.playTap();
    } else if (selectedSlotForSwap === slotIdx) {
      // Deselect
      setSelectedSlotForSwap(null);
    } else {
      // Swap!
      sounds.playWhoosh();
      const firstSlot = selectedSlotForSwap;
      const secondSlot = slotIdx;

      setPieces((prev) => {
        const next = prev.map((p) => {
          if (p.currentSlot === firstSlot) {
            return { ...p, currentSlot: secondSlot };
          }
          if (p.currentSlot === secondSlot) {
            return { ...p, currentSlot: firstSlot };
          }
          return p;
        });
        checkWinCondition(next);
        return next;
      });

      setSelectedSlotForSwap(null);
    }
  }, [isPlaying, selectedSlotForSwap, checkWinCondition]);

  // Keyboard support: 1, 2, 3, 4 to rotate slots
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === '1') handleRotateSlot(0);
      if (e.key === '2') handleRotateSlot(1);
      if (e.key === '3') handleRotateSlot(2);
      if (e.key === '4') handleRotateSlot(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleRotateSlot]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      sounds.playFail();
      onFinish(false, 'Hết 30 giây! Chưa kịp phối hợp ghép xong 4 mảnh.');
    }
  }, [isPlaying, timeLeft, onFinish]);

  // Helper to render quadrant artwork
  const renderQuadrantContent = (pieceId: number) => {
    switch (pieceId) {
      case 0: // Top-Left: TechPoly Logo Title + Robot Head
        return (
          <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 flex flex-col justify-between p-3 border-r-2 border-b-2 border-dashed border-amber-400/40">
            <span className="text-sm font-black text-amber-300 tracking-wider">TECH</span>
            <div className="text-4xl text-center">🤖</div>
            <div className="w-4 h-4 rounded-full bg-cyan-400/50" />
          </div>
        );
      case 1: // Top-Right: POLY Star + Circuit
        return (
          <div className="w-full h-full bg-gradient-to-bl from-purple-700 via-pink-800 to-purple-950 flex flex-col justify-between items-end p-3 border-l-2 border-b-2 border-dashed border-amber-400/40">
            <span className="text-sm font-black text-amber-300 tracking-wider">POLY</span>
            <div className="text-4xl text-center">⭐</div>
            <div className="w-4 h-4 rounded-full bg-pink-400/50" />
          </div>
        );
      case 2: // Bottom-Left: Circuit chip + Rocket
        return (
          <div className="w-full h-full bg-gradient-to-tr from-cyan-800 via-teal-900 to-slate-950 flex flex-col justify-between p-3 border-r-2 border-t-2 border-dashed border-amber-400/40">
            <div className="w-4 h-4 rounded-full bg-amber-400/50" />
            <div className="text-4xl text-center">🚀</div>
            <span className="text-[10px] font-bold text-teal-300">MINI-GAMES</span>
          </div>
        );
      case 3: // Bottom-Right: Trophy + Golden Ring
        return (
          <div className="w-full h-full bg-gradient-to-tl from-rose-800 via-red-900 to-slate-950 flex flex-col justify-between items-end p-3 border-l-2 border-t-2 border-dashed border-amber-400/40">
            <div className="w-4 h-4 rounded-full bg-rose-400/50" />
            <div className="text-4xl text-center">🏆</div>
            <span className="text-[10px] font-bold text-rose-300">CHAMPION</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="game-puzzle-coop" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full mb-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Chế độ phối hợp</div>
            <div className="text-sm font-bold text-pink-300">4 Mảnh Ghép Đội</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hướng dẫn</div>
          <div className="text-xs font-bold text-amber-300">Click để đổi chỗ | Nút xoay 90°</div>
        </div>
      </div>

      {/* 2x2 Puzzle Board (Representing 4 Connected Screens) */}
      <div className="w-72 h-72 sm:w-80 sm:h-80 grid grid-cols-2 grid-rows-2 gap-2 p-3 bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-2xl relative mb-4">
        {[0, 1, 2, 3].map((slotIdx) => {
          const piece = pieces.find((p) => p.currentSlot === slotIdx);
          const isSelected = selectedSlotForSwap === slotIdx;
          const isCorrect = piece && piece.id === slotIdx && piece.rotation % 360 === 0;

          return (
            <div
              key={slotIdx}
              onClick={() => handleSelectSlot(slotIdx)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 border-2 ${
                isSelected
                  ? 'ring-4 ring-pink-500 border-white scale-95'
                  : isCorrect
                  ? 'border-emerald-500/80'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              {/* Rotatable Quadrant Piece */}
              <div
                className="w-full h-full transition-transform duration-200"
                style={{ transform: `rotate(${piece ? piece.rotation : 0}deg)` }}
              >
                {piece && renderQuadrantContent(piece.id)}
              </div>

              {/* Slot Badge & Rotate Button */}
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-20">
                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-black text-amber-400 border border-slate-700">
                  #{slotIdx + 1}
                </span>
                {isCorrect && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRotateSlot(slotIdx);
                }}
                className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 flex items-center justify-center text-xs shadow cursor-pointer z-20 active:scale-90 transition-all"
                title={`Xoay mảnh ${slotIdx + 1}`}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Control Quickbar */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
        {[0, 1, 2, 3].map((slotIdx) => (
          <button
            key={slotIdx}
            onClick={() => handleRotateSlot(slotIdx)}
            className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700 text-xs font-bold text-slate-300 flex flex-col items-center gap-1 cursor-pointer transition-all shadow"
          >
            <RotateCw className="w-3.5 h-3.5 text-pink-400" />
            <span>Xoay [{slotIdx + 1}]</span>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-3">
        Mẹo: Bấm vào 1 ô rồi bấm ô thứ 2 để hoán đổi vị trí hai mảnh!
      </p>
    </div>
  );
};
