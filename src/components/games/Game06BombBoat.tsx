import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

interface Bomb {
  id: number;
  x: number;
  y: number; // percentage from top (10% to 80%)
  falling: boolean;
  exploded: boolean;
  hit: boolean;
}

export const Game06BombBoat: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [bombsLeft, setBombsLeft] = useState(3);
  const [hits, setHits] = useState(0);
  const [boatX, setBoatX] = useState(50); // percentage 10% to 90%
  const [boatDir, setBoatDir] = useState<1 | -1>(1);
  const [activeBombs, setActiveBombs] = useState<Bomb[]>([]);
  const [bombLogs, setBombLogs] = useState<('hit' | 'miss')[]>([]);
  const [crosshairX, setCrosshairX] = useState(50);

  const boatXRef = useRef(50);
  boatXRef.current = boatX;
  const crosshairXRef = useRef(50);
  crosshairXRef.current = crosshairX;

  // Move boat smoothly back and forth
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setBoatX((prev) => {
        let next = prev + boatDir * 1.5;
        if (next >= 85) {
          setBoatDir(-1);
          next = 85;
        } else if (next <= 15) {
          setBoatDir(1);
          next = 15;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, boatDir]);

  // Drop bomb handler
  const handleDropBomb = useCallback(() => {
    if (!isPlaying || bombsLeft <= 0) return;

    sounds.playWhoosh();
    setBombsLeft((prev) => prev - 1);

    const newBomb: Bomb = {
      id: Date.now(),
      x: crosshairXRef.current,
      y: 15,
      falling: true,
      exploded: false,
      hit: false,
    };

    setActiveBombs((prev) => [...prev, newBomb]);
  }, [isPlaying, bombsLeft]);

  // Handle active bombs falling animation
  useEffect(() => {
    if (!isPlaying || activeBombs.length === 0) return;

    const interval = setInterval(() => {
      setActiveBombs((prevBombs) => {
        return prevBombs.map((bomb) => {
          if (!bomb.falling) return bomb;
          const nextY = bomb.y + 4; // fall speed

          // Hit water/boat level around y = 72%
          if (nextY >= 72) {
            // Check collision with boat
            // Boat width is about 18% wide (centered on boatX)
            const boatLeft = boatXRef.current - 9;
            const boatRight = boatXRef.current + 9;
            const isHit = bomb.x >= boatLeft && bomb.x <= boatRight;

            if (isHit) {
              sounds.playBomb();
              sounds.playSuccess();
              setHits((h) => {
                const newHits = h + 1;
                return newHits;
              });
              setBombLogs((logs) => [...logs, 'hit']);
            } else {
              sounds.playHit();
              setBombLogs((logs) => [...logs, 'miss']);
            }

            return {
              ...bomb,
              y: 72,
              falling: false,
              exploded: true,
              hit: isHit,
            };
          }

          return { ...bomb, y: nextY };
        });
      });
    }, 35);

    return () => clearInterval(interval);
  }, [isPlaying, activeBombs.length]);

  // Check end game after 3 bombs evaluated
  useEffect(() => {
    if (bombLogs.length === 3) {
      const hitCount = bombLogs.filter((b) => b === 'hit').length;
      setTimeout(() => {
        if (hitCount >= 2) {
          sounds.playSuccess();
          onFinish(true, `Thiện xạ! Ném trúng tàu ${hitCount}/3 quả bom.`);
        } else {
          sounds.playFail();
          onFinish(false, `Chưa đạt! Chỉ trúng ${hitCount}/3 quả (yêu cầu ít nhất 2).`);
        }
      }, 1000);
    }
  }, [bombLogs, onFinish]);

  // Keyboard shortcut Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleDropBomb();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleDropBomb]);

  // Time left check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (hits >= 2) {
        sounds.playSuccess();
        onFinish(true, `Hết giờ! Bạn đã ném trúng ${hits}/3 quả bom, hoàn thành mục tiêu!`);
      } else {
        sounds.playFail();
        onFinish(false, `Hết 20 giây! Bạn ném trúng ${hits}/3 quả bom.`);
      }
    }
  }, [isPlaying, timeLeft, hits, onFinish]);

  return (
    <div id="game-bomb-boat" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Target & Bombs Header */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            {hits}/2
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Trúng thuyền</div>
            <div className="text-sm font-bold text-emerald-400">Mục tiêu: ít nhất 2 quả</div>
          </div>
        </div>

        {/* 3 Bombs indicators */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((idx) => {
            const log = bombLogs[idx];
            return (
              <div
                key={idx}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border text-sm font-bold transition-all ${
                  log === 'hit'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : log === 'miss'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : idx < bombsLeft
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-600 border-slate-700'
                }`}
              >
                {log === 'hit' ? '💥' : log === 'miss' ? '💦' : '💣'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sea & Cannon Battlefield */}
      <div 
        className="relative w-full h-72 bg-gradient-to-b from-sky-950 via-slate-900 to-blue-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-4 cursor-crosshair"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
          setCrosshairX(pct);
        }}
      >
        {/* Sky / Aiming Crosshair at Top */}
        <div 
          className="absolute top-2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
          style={{ left: `${crosshairX}%` }}
        >
          <div className="text-3xl animate-pulse">🛩️</div>
          <div className="w-0.5 h-10 border-l border-dashed border-amber-400/50" />
        </div>

        {/* Falling Bombs */}
        {activeBombs.map((bomb) => (
          <div
            key={bomb.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${bomb.x}%`, top: `${bomb.y}%` }}
          >
            {bomb.exploded ? (
              <span className="text-3xl animate-ping">
                {bomb.hit ? '💥' : '💦'}
              </span>
            ) : (
              <span className="text-2xl drop-shadow-md">💣</span>
            )}
          </div>
        ))}

        {/* Ocean Waves at Bottom */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-blue-900 to-cyan-900/60 border-t border-cyan-500/30">
          <div className="w-full h-full opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Moving Boat */}
        <div
          className="absolute bottom-6 -translate-x-1/2 flex flex-col items-center transition-all duration-75 pointer-events-none"
          style={{ left: `${boatX}%` }}
        >
          <div className={`text-5xl transition-transform ${boatDir === -1 ? 'scale-x-[-1]' : ''}`}>
            🚢
          </div>
          <div className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-cyan-300 shadow">
            Mục tiêu tàu chiến
          </div>
        </div>
      </div>

      {/* Drop Bomb Trigger Button */}
      <button
        id="drop-bomb-button"
        onClick={handleDropBomb}
        disabled={!isPlaying || bombsLeft <= 0}
        className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black text-xl tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 cursor-pointer border border-emerald-400/40 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Target className="w-6 h-6 animate-pulse" />
        THẢ BOM ({bombsLeft} QUẢ CÒN LẠI) - SPACE
      </button>
    </div>
  );
};
