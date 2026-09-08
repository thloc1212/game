import React, { useState, useEffect } from 'react';
import { Sparkles, Dices, X } from 'lucide-react';
import { GameMetadata } from '../types';
import { sounds } from '../utils/sound';

interface Props {
  isOpen: boolean;
  games: GameMetadata[];
  onClose: () => void;
  onSelectGame: (game: GameMetadata) => void;
}

export const RandomModal: React.FC<Props> = ({ isOpen, games, onClose, onSelectGame }) => {
  const [selectedDisplayGame, setSelectedDisplayGame] = useState<GameMetadata>(games[0]);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsRolling(true);
    sounds.playWhoosh();

    let counter = 0;
    const maxSteps = 24;
    let speed = 50;

    const rollStep = () => {
      counter++;
      const rand = games[Math.floor(Math.random() * games.length)];
      setSelectedDisplayGame(rand);
      sounds.playTick();

      if (counter < maxSteps) {
        speed += 12; // slow down gradually
        setTimeout(rollStep, speed);
      } else {
        // Final choice
        const finalPick = games[Math.floor(Math.random() * games.length)];
        setSelectedDisplayGame(finalPick);
        setIsRolling(false);
        sounds.playSuccess();
      }
    };

    setTimeout(rollStep, 100);
  }, [isOpen, games]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dice Icon header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
          <Dices className={`w-8 h-8 ${isRolling ? 'animate-spin' : ''}`} />
        </div>

        <h3 className="text-xl font-black text-slate-100 uppercase tracking-wide mb-1">
          {isRolling ? 'Đang quay ngẫu nhiên...' : 'Trò chơi được chọn!'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Hệ thống TechPoly Roulette đang bốc thăm ngẫu nhiên 1 trong 15 thử thách
        </p>

        {/* Display Card */}
        <div className={`w-full p-5 rounded-2xl bg-slate-800/80 border transition-all duration-150 ${
          isRolling ? 'border-slate-700 scale-95' : 'border-amber-400/80 scale-100 shadow-xl shadow-amber-500/20'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1 block">
            Minigame #{selectedDisplayGame.number} • {selectedDisplayGame.categoryLabel}
          </span>
          <h4 className="text-2xl font-black text-white mb-2">
            {selectedDisplayGame.title}
          </h4>
          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-300">
            <span>⏱️ {selectedDisplayGame.duration}s</span>
            <span>•</span>
            <span className="text-amber-400">🪙 +{selectedDisplayGame.reward} Token</span>
            <span>•</span>
            <span>🎯 {selectedDisplayGame.mechanic}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full mt-6">
          <button
            onClick={() => {
              // Reroll
              setIsRolling(true);
              sounds.playWhoosh();
              let count = 0;
              let s = 50;
              const loop = () => {
                count++;
                const pick = games[Math.floor(Math.random() * games.length)];
                setSelectedDisplayGame(pick);
                sounds.playTick();
                if (count < 18) {
                  s += 12;
                  setTimeout(loop, s);
                } else {
                  setIsRolling(false);
                  sounds.playSuccess();
                }
              };
              loop();
            }}
            disabled={isRolling}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            Quay Lại 🎲
          </button>

          <button
            onClick={() => onSelectGame(selectedDisplayGame)}
            disabled={isRolling}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50"
          >
            Chơi Ngay ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
