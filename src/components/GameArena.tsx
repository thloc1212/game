import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Dices, Play, Award, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { GameMetadata, GameStatus } from '../types';
import { sounds } from '../utils/sound';

// Import active minigames
import { Game01HitChallenge } from './games/Game01HitChallenge';
import { Game02SumoBattle } from './games/Game02SumoBattle';
import { Game03TugOfWar } from './games/Game03TugOfWar';
import { Game05RPS } from './games/Game05RPS';
import { Game07BugSmash } from './games/Game07BugSmash';
import { Game08Stopwatch } from './games/Game08Stopwatch';
import { Game09MemoryGrid } from './games/Game09MemoryGrid';
import { Game10ColorConfusion } from './games/Game10ColorConfusion';
import { Game13QuickCount } from './games/Game13QuickCount';

interface Props {
  game: GameMetadata;
  onBack: () => void;
  onGameComplete: (game: GameMetadata, won: boolean) => void;
  onNextRandomGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  userTokens: number;
}

export const GameArena: React.FC<Props> = ({
  game,
  onBack,
  onGameComplete,
  onNextRandomGame,
  isMuted,
  onToggleMute,
  userTokens,
}) => {
  const [status, setStatus] = useState<GameStatus>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(game.duration);
  const [resultDetail, setResultDetail] = useState<string>('');

  // Game timer loop during 'playing'
  useEffect(() => {
    if (status !== 'playing') return;

    setTimeLeft(game.duration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        const next = prev - 0.1;
        // Sound tick on last 3 seconds
        if (next <= 3.0 && Math.floor(next * 10) % 10 === 0) {
          sounds.playTick();
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [status, game.duration]);

  // Handle Game Finish callback
  const handleFinish = useCallback((won: boolean, detail?: string) => {
    if (status !== 'playing') return;

    setResultDetail(detail || (won ? 'Thử thách thành công!' : 'Thử thách thất bại!'));
    setStatus(won ? 'won' : 'lost');
    onGameComplete(game, won);

    if (won) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
      });
    }
  }, [status, game, onGameComplete]);

  // Handle start game
  const handleStart = () => {
    sounds.playWhoosh();
    setStatus('playing');
    setTimeLeft(game.duration);
  };

  // Keyboard shortcut Space to start when 'ready'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === 'ready' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Render specific game component
  const renderGameComponent = () => {
    const props = {
      isPlaying: status === 'playing',
      onFinish: handleFinish,
      timeLeft,
    };

    switch (game.id) {
      case '100-hit': return <Game01HitChallenge {...props} />;
      case 'sumo-tap': return <Game02SumoBattle {...props} />;
      case 'tug-of-war': return <Game03TugOfWar {...props} />;
      case 'rock-paper-scissors': return <Game05RPS {...props} />;
      case 'bug-smash': return <Game07BugSmash {...props} />;
      case 'stop-at-5': return <Game08Stopwatch {...props} />;
      case 'memory-grid': return <Game09MemoryGrid {...props} />;
      case 'color-confusion': return <Game10ColorConfusion {...props} />;
      case 'quick-count': return <Game13QuickCount {...props} />;
      default: return <div>Trò chơi đang chuẩn bị...</div>;
    }
  };

  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / game.duration) * 100));

  return (
    <div id="game-arena-container" className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-hub"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Quay về danh sách game"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono text-amber-400">#{game.number}</span>
              <h2 className="text-base font-black text-slate-100">{game.title}</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Cơ chế: {game.mechanic} • Thưởng: +{game.reward} Token
            </span>
          </div>
        </div>

        {/* Right Info: Timer & Audio */}
        <div className="flex items-center gap-3">
          {status === 'playing' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 uppercase font-bold">Thời gian:</span>
              <span className={`text-base font-black font-mono ${timeLeft <= 3 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`}>
                {timeLeft.toFixed(1)}s
              </span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
            <span>🪙</span>
            <span>{userTokens} Token</span>
          </div>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Global Timer Countdown Bar (Only in playing) */}
      {status === 'playing' && (
        <div className="w-full h-1.5 bg-slate-800 shrink-0">
          <div
            className={`h-full transition-all duration-100 ${
              timerPercentage <= 25
                ? 'bg-rose-500'
                : timerPercentage <= 50
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      )}

      {/* Main Game Stage */}
      <main className="flex-1 relative flex items-center justify-center p-4 overflow-y-auto">
        {/* State 1: Ready Briefing Modal / Card */}
        {status === 'ready' && (
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col animate-fade-in">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${game.badgeColor}`}>
                {game.categoryLabel}
              </span>
              <span className="text-amber-400 font-bold text-sm">
                🪙 Thưởng: +{game.reward} Token
              </span>
            </div>

            <h2 className="text-3xl font-black text-slate-100 mb-1">
              {game.title}
            </h2>
            <span className="text-xs font-medium text-slate-400 mb-4">
              Thời gian thử thách: <strong className="text-slate-200">{game.duration} giây</strong>
            </span>

            {/* Objective Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                🎯 Mục tiêu
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {game.objective}
              </p>
            </div>

            {/* Rules */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                📜 Luật chơi chi tiết
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {game.rules}
              </p>
              {game.keyboardHint && (
                <div className="mt-2 text-[11px] font-medium text-cyan-300">
                  ⌨️ Điều khiển: {game.keyboardHint}
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              id="btn-start-game"
              onClick={handleStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xl tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 cursor-pointer transition-transform"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              BẮT ĐẦU NGAY (SPACE)
            </button>
          </div>
        )}

        {/* State 2: Active Gameplay */}
        {status === 'playing' && renderGameComponent()}

        {/* State 3: Won Screen */}
        {status === 'won' && (
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
              XUẤT SẮC VƯỢT QUA
            </span>
            <h2 className="text-3xl font-black text-white mb-2">
              CHIẾN THẮNG!
            </h2>
            <p className="text-xs text-slate-300 mb-5 px-2">
              {resultDetail}
            </p>

            {/* Token Reward Box */}
            <div className="w-full py-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center gap-3 mb-6 shadow-inner">
              <span className="text-3xl">🪙</span>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Phần thưởng đã nhận</div>
                <div className="text-2xl font-black text-amber-300">+{game.reward} Token</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => {
                  setStatus('playing');
                  setTimeLeft(game.duration);
                }}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-700 shadow"
              >
                <RotateCcw className="w-4 h-4" />
                Chơi lại ván này
              </button>

              <button
                onClick={onNextRandomGame}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/30"
              >
                <Dices className="w-4 h-4" />
                Thử thách game ngẫu nhiên khác
              </button>

              <button
                onClick={onBack}
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Trở về danh sách 9 Minigames
              </button>
            </div>
          </div>
        )}

        {/* State 4: Lost Screen */}
        {status === 'lost' && (
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border-2 border-rose-500/50 shadow-lg shadow-rose-500/20">
              <XCircle className="w-12 h-12" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-1">
              CHƯA HOÀN THÀNH
            </span>
            <h2 className="text-3xl font-black text-white mb-2">
              THẤT BẠI!
            </h2>
            <p className="text-xs text-slate-300 mb-6 px-2">
              {resultDetail}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => {
                  setStatus('playing');
                  setTimeLeft(game.duration);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-rose-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                Thử lại ngay lập tức
              </button>

              <button
                onClick={onNextRandomGame}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-700 shadow"
              >
                <Dices className="w-4 h-4" />
                Đổi sang game ngẫu nhiên khác
              </button>

              <button
                onClick={onBack}
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Trở về danh sách 9 Minigames
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
