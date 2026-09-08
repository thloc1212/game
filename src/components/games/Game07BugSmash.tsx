import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bug, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

interface SpawnItem {
  id: number;
  type: 'bug' | 'coffee' | 'feature';
  icon: string;
  x: number; // percentage 10% to 85%
  y: number; // percentage 10% to 80%
  size: number;
}

export const Game07BugSmash: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [bugsSmashed, setBugsSmashed] = useState(0);
  const [items, setItems] = useState<SpawnItem[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const bugsRef = useRef(0);
  bugsRef.current = bugsSmashed;

  // Item spawner loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setItems((prev) => {
        // Remove old items (keep max 6 simultaneously)
        const filtered = prev.length > 5 ? prev.slice(1) : prev;

        const isDecoy = Math.random() < 0.28;
        let type: 'bug' | 'coffee' | 'feature' = 'bug';
        let icon = '🐛';

        if (isDecoy) {
          if (Math.random() < 0.5) {
            type = 'coffee';
            icon = '☕';
          } else {
            type = 'feature';
            icon = '⭐';
          }
        } else {
          const bugIcons = ['🐛', '🪲', '🐜', '🐞', '🦗'];
          icon = bugIcons[Math.floor(Math.random() * bugIcons.length)];
        }

        const newItem: SpawnItem = {
          id: Date.now() + Math.random(),
          type,
          icon,
          x: 10 + Math.random() * 75,
          y: 10 + Math.random() * 70,
          size: 44 + Math.random() * 14,
        };

        return [...filtered, newItem];
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle clicking on an item
  const handleItemClick = useCallback((item: SpawnItem) => {
    if (!isPlaying) return;

    // Remove the clicked item immediately
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (item.type === 'bug') {
      sounds.playTap();
      const nextCount = bugsRef.current + 1;
      setBugsSmashed(nextCount);

      if (nextCount >= 12) {
        sounds.playSuccess();
        onFinish(true, `Tuyệt đỉnh! Bạn đã diệt sạch ${nextCount} con bug trước thời hạn!`);
      }
    } else {
      // Clicked on decoy
      sounds.playFail();
      const label = item.type === 'coffee' ? 'Cà phê ☕' : 'Tính năng Feature ⭐';
      setWarning(`Đập nhầm ${label}! Đừng để bị lừa!`);
      setTimeout(() => setWarning(null), 900);
    }
  }, [isPlaying, onFinish]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (bugsRef.current >= 12) {
        sounds.playSuccess();
        onFinish(true, `Hoàn thành xuất sắc! Bạn đã đập được ${bugsRef.current}/12 con bug!`);
      } else {
        sounds.playFail();
        onFinish(false, `Hết 15 giây! Bạn đập được ${bugsRef.current}/12 con bug.`);
      }
    }
  }, [isPlaying, timeLeft, onFinish]);

  return (
    <div id="game-bug-smash" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Header Stats */}
      <div className="flex items-center justify-between w-full mb-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <Bug className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Bug Đã Diệt</div>
            <div className="text-xl font-black text-red-400">{bugsSmashed} <span className="text-xs text-slate-500 font-normal">/ 12 con</span></div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cảnh báo</div>
          <div className="text-xs font-bold text-amber-300">Tránh ☕ Cà phê & ⭐ Feature</div>
        </div>
      </div>

      {warning && (
        <div className="w-full py-1.5 px-4 mb-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-center text-xs font-bold text-rose-300 animate-bounce">
          {warning}
        </div>
      )}

      {/* Bug Arena */}
      <div className="relative w-full h-80 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-4">
        {/* Circuit / Code pattern in background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-75 hover:scale-125 cursor-pointer z-10 flex items-center justify-center"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          >
            <span className="text-3xl drop-shadow-md select-none pointer-events-none animate-pulse">
              {item.icon}
            </span>
          </button>
        ))}

        {items.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm italic">
            Bug đang bò ra... hãy chú ý quan sát!
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-4">
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(100, (bugsSmashed / 12) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
