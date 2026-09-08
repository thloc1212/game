import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, HelpCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

type Choice = 'rock' | 'paper' | 'scissors';

const CHOICES: { id: Choice; label: string; icon: string; beats: Choice; keyNum: string }[] = [
  { id: 'scissors', label: 'Kéo', icon: '✂️', beats: 'paper', keyNum: '1' },
  { id: 'rock', label: 'Búa', icon: '✊', beats: 'scissors', keyNum: '2' },
  { id: 'paper', label: 'Bao', icon: '✋', beats: 'rock', keyNum: '3' },
];

export const Game05RPS: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [botChoice, setBotChoice] = useState<Choice | null>(null);
  const [roundStatus, setRoundStatus] = useState<string>('Chọn Kéo, Búa hoặc Bao để ra chiêu!');
  const [isRevealing, setIsRevealing] = useState(false);

  const handleSelect = useCallback((choice: Choice) => {
    if (!isPlaying || isRevealing) return;

    setIsRevealing(true);
    setPlayerChoice(choice);
    sounds.playTap();

    // Bot picks after dramatic 500ms
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * 3);
      const botPick = CHOICES[randomIdx].id;
      setBotChoice(botPick);

      if (choice === botPick) {
        sounds.playTick();
        setRoundStatus('Hòa nhau! Hai bên chọn cùng một loại, đấu lại hiệp này!');
        setTimeout(() => {
          setIsRevealing(false);
          setPlayerChoice(null);
          setBotChoice(null);
        }, 1200);
      } else {
        const playerItem = CHOICES.find((c) => c.id === choice);
        const wonRound = playerItem?.beats === botPick;

        if (wonRound) {
          sounds.playSuccess();
          const newPlayerScore = playerScore + 1;
          setPlayerScore(newPlayerScore);
          setRoundStatus(`Bạn thắng hiệp này! (${playerItem?.label} thắng ${CHOICES.find(c => c.id === botPick)?.label})`);

          if (newPlayerScore >= 2) {
            setTimeout(() => {
              onFinish(true, 'Chiến thắng vang dội! Bạn thắng bot 2 ván trước (Best of 3)!');
            }, 1000);
          } else {
            setTimeout(() => {
              setIsRevealing(false);
              setPlayerChoice(null);
              setBotChoice(null);
            }, 1400);
          }
        } else {
          sounds.playFail();
          const newBotScore = botScore + 1;
          setBotScore(newBotScore);
          setRoundStatus(`Bot thắng hiệp này! (${CHOICES.find(c => c.id === botPick)?.label} thắng ${playerItem?.label})`);

          if (newBotScore >= 2) {
            setTimeout(() => {
              onFinish(false, 'Bot đã thắng 2 ván trước! Chúc bạn may mắn lần sau.');
            }, 1000);
          } else {
            setTimeout(() => {
              setIsRevealing(false);
              setPlayerChoice(null);
              setBotChoice(null);
            }, 1400);
          }
        }
      }
    }, 600);
  }, [isPlaying, isRevealing, playerScore, botScore, onFinish]);

  // Keyboard shortcut: 1 = Scissors, 2 = Rock, 3 = Paper
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isRevealing) return;
      if (e.key === '1') handleSelect('scissors');
      if (e.key === '2') handleSelect('rock');
      if (e.key === '3') handleSelect('paper');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isRevealing, handleSelect]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      if (playerScore > botScore) {
        sounds.playSuccess();
        onFinish(true, `Hết giờ! Bạn dẫn trước với tỉ số ${playerScore} - ${botScore}!`);
      } else {
        sounds.playFail();
        onFinish(false, `Hết giờ! Tỉ số ${playerScore} - ${botScore}, chưa đủ 2 điểm thắng.`);
      }
    }
  }, [isPlaying, timeLeft, playerScore, botScore, onFinish]);

  return (
    <div id="game-rps" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Scoreboard */}
      <div className="flex items-center justify-between w-full mb-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xl border border-purple-500/30">
            {playerScore}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Bạn (Cần 2 điểm)</div>
            <div className="text-sm font-bold text-purple-300">Người chơi</div>
          </div>
        </div>

        <div className="text-center px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Best of 3</span>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs font-semibold text-slate-400">Bot AI</div>
            <div className="text-sm font-bold text-rose-300">Đối thủ</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xl border border-rose-500/30">
            {botScore}
          </div>
        </div>
      </div>

      {/* Duel Arena */}
      <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl mb-6">
        <div className="grid grid-cols-2 gap-8 w-full items-center text-center">
          {/* Player Arena Box */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 mb-2">LỰA CHỌN CỦA BẠN</span>
            <div className="w-24 h-24 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-5xl shadow-inner">
              {playerChoice ? (
                CHOICES.find((c) => c.id === playerChoice)?.icon
              ) : (
                <span className="text-slate-600 text-3xl font-bold">?</span>
              )}
            </div>
            <span className="text-sm font-bold text-purple-300 mt-2">
              {playerChoice ? CHOICES.find((c) => c.id === playerChoice)?.label : 'Chờ bạn chọn...'}
            </span>
          </div>

          {/* Bot Arena Box */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 mb-2">LỰA CHỌN CỦA BOT</span>
            <div className="w-24 h-24 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-5xl shadow-inner">
              {isRevealing && !botChoice ? (
                <span className="animate-spin text-3xl">🌀</span>
              ) : botChoice ? (
                CHOICES.find((c) => c.id === botChoice)?.icon
              ) : (
                <HelpCircle className="w-10 h-10 text-slate-600" />
              )}
            </div>
            <span className="text-sm font-bold text-rose-300 mt-2">
              {botChoice ? CHOICES.find((c) => c.id === botChoice)?.label : 'Bot đang suy nghĩ...'}
            </span>
          </div>
        </div>

        {/* Round outcome message */}
        <div className="mt-5 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-sm font-semibold text-amber-300">
          {roundStatus}
        </div>
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {CHOICES.map((item) => (
          <button
            key={item.id}
            id={`rps-choice-${item.id}`}
            onClick={() => handleSelect(item.id)}
            disabled={!isPlaying || isRevealing}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform mb-1">
              {item.icon}
            </span>
            <span className="text-sm font-bold text-slate-200">{item.label}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Phím [{item.keyNum}]</span>
          </button>
        ))}
      </div>
    </div>
  );
};
