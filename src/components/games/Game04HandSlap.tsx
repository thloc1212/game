import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface Props {
  isPlaying: boolean;
  onFinish: (won: boolean, detail?: string) => void;
  timeLeft: number;
}

type RoundStatus = 'pending' | 'success' | 'failed' | 'early';

export const Game04HandSlap: React.FC<Props> = ({ isPlaying, onFinish, timeLeft }) => {
  const [round, setRound] = useState(1);
  const [roundsResult, setRoundsResult] = useState<RoundStatus[]>([]);
  const [opponentState, setOpponentState] = useState<'idle' | 'striking' | 'slapped' | 'dodged'>('idle');
  const [playerDodged, setPlayerDodged] = useState(false);
  const [feedback, setFeedback] = useState('Hãy chuẩn bị... chú ý bàn tay đối thủ!');

  const strikeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const strikeDurationTimeout = useRef<NodeJS.Timeout | null>(null);
  const isStrikingRef = useRef(false);
  const isEarlyClickBlocked = useRef(false);

  const startNextRound = useCallback((currentRound: number) => {
    if (currentRound > 5) return;
    setOpponentState('idle');
    setPlayerDodged(false);
    isStrikingRef.current = false;
    isEarlyClickBlocked.current = false;
    setFeedback(`Hiệp ${currentRound}/5: Quan sát kỹ... Đừng bấm sớm!`);

    // Random delay between 1.5s and 3.2s before strike
    const delay = 1500 + Math.random() * 1800;
    strikeTimerRef.current = setTimeout(() => {
      setOpponentState('striking');
      isStrikingRef.current = true;
      sounds.playWhoosh();
      setFeedback('⚡ NÉ NGAY!');

      // Opponent strike duration window (e.g. 500ms to react)
      strikeDurationTimeout.current = setTimeout(() => {
        if (isStrikingRef.current) {
          // Player failed to dodge in time
          isStrikingRef.current = false;
          setOpponentState('slapped');
          sounds.playHit();
          sounds.playFail();
          setFeedback('❌ Không kịp né! Bị đập trúng rồi!');
          setRoundsResult((prev) => [...prev, 'failed']);

          setTimeout(() => {
            if (currentRound >= 5) {
              finishGame([...roundsResult, 'failed']);
            } else {
              setRound(currentRound + 1);
              startNextRound(currentRound + 1);
            }
          }, 1200);
        }
      }, 520);
    }, delay);
  }, [roundsResult]);

  const finishGame = useCallback((finalResults: RoundStatus[]) => {
    const successCount = finalResults.filter((r) => r === 'success').length;
    if (successCount >= 4) {
      sounds.playSuccess();
      onFinish(true, `Phản xạ thần tốc! Né thành công ${successCount}/5 lượt.`);
    } else {
      sounds.playFail();
      onFinish(false, `Chưa đạt! Chỉ né được ${successCount}/5 lượt (yêu cầu ít nhất 4/5).`);
    }
  }, [onFinish]);

  useEffect(() => {
    if (isPlaying && round === 1 && roundsResult.length === 0) {
      startNextRound(1);
    }
    return () => {
      if (strikeTimerRef.current) clearTimeout(strikeTimerRef.current);
      if (strikeDurationTimeout.current) clearTimeout(strikeDurationTimeout.current);
    };
  }, [isPlaying, round, roundsResult.length, startNextRound]);

  const handleDodge = useCallback(() => {
    if (!isPlaying) return;

    if (opponentState === 'idle') {
      // Clicked too early!
      if (isEarlyClickBlocked.current) return;
      isEarlyClickBlocked.current = true;

      if (strikeTimerRef.current) clearTimeout(strikeTimerRef.current);
      if (strikeDurationTimeout.current) clearTimeout(strikeDurationTimeout.current);
      isStrikingRef.current = false;

      sounds.playFail();
      setFeedback('⚠️ Phạm quy: Bấm quá sớm khi đối thủ chưa ra tay!');
      setRoundsResult((prev) => [...prev, 'early']);

      setTimeout(() => {
        if (round >= 5) {
          finishGame([...roundsResult, 'early']);
        } else {
          setRound((r) => r + 1);
          startNextRound(round + 1);
        }
      }, 1200);
    } else if (opponentState === 'striking' && isStrikingRef.current) {
      // Successfully dodged!
      isStrikingRef.current = false;
      if (strikeDurationTimeout.current) clearTimeout(strikeDurationTimeout.current);
      setOpponentState('dodged');
      setPlayerDodged(true);
      sounds.playTap();
      sounds.playTick();
      setFeedback('✨ Né thành công cực chuẩn!');
      setRoundsResult((prev) => [...prev, 'success']);

      setTimeout(() => {
        if (round >= 5) {
          finishGame([...roundsResult, 'success']);
        } else {
          setRound((r) => r + 1);
          startNextRound(round + 1);
        }
      }, 1200);
    }
  }, [isPlaying, opponentState, round, roundsResult, startNextRound, finishGame]);

  // Spacebar support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleDodge();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleDodge]);

  // Timeout check
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      const successCount = roundsResult.filter((r) => r === 'success').length;
      if (successCount >= 4) {
        sounds.playSuccess();
        onFinish(true, `Hết giờ! Bạn đã né thành công ${successCount}/5 lượt!`);
      } else {
        sounds.playFail();
        onFinish(false, `Hết giờ! Chỉ đạt ${successCount}/5 lượt.`);
      }
    }
  }, [isPlaying, timeLeft, roundsResult, onFinish]);

  const successCount = roundsResult.filter((r) => r === 'success').length;

  return (
    <div id="game-hand-slap" className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 select-none">
      {/* Round & Target Counter */}
      <div className="flex items-center justify-between w-full mb-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
            {Math.min(5, round)}/5
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Hiệp đấu</div>
            <div className="text-sm font-bold text-slate-200">Đã né: {successCount}/4 mục tiêu</div>
          </div>
        </div>

        {/* 5-round badges */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((idx) => {
            const res = roundsResult[idx];
            return (
              <div
                key={idx}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold ${
                  res === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : res === 'failed' || res === 'early'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : idx === round - 1
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {res === 'success' ? '✓' : res === 'failed' || res === 'early' ? '✗' : idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hand Arena Visualizer */}
      <div className="relative w-full h-64 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-6">
        {/* Opponent Hand (Top) */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tay Đối Thủ
          </span>
          <div 
            className={`text-6xl transition-all duration-150 transform ${
              opponentState === 'striking'
                ? 'translate-y-20 scale-125 text-rose-500'
                : opponentState === 'slapped'
                ? 'translate-y-20 scale-125'
                : 'translate-y-0'
            }`}
          >
            🫲
          </div>
        </div>

        {/* Status Prompt */}
        <div className="text-center font-bold px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm shadow-md transition-all">
          {feedback}
        </div>

        {/* Player Hand (Bottom) */}
        <div className="flex flex-col items-center">
          <div 
            className={`text-6xl transition-all duration-150 transform ${
              playerDodged ? 'translate-x-24 opacity-60 text-emerald-400' : 'translate-x-0'
            }`}
          >
            🫱
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Bàn Tay Của Bạn
          </span>
        </div>
      </div>

      {/* Dodge Action Button */}
      <button
        id="dodge-button"
        onClick={handleDodge}
        disabled={!isPlaying}
        className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-black text-xl tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-3 cursor-pointer border border-rose-400/40 transition-transform"
      >
        <Shield className="w-6 h-6 animate-bounce" />
        BẤM NÉ ĐÒN (SPACE HOẶC CLICK)
      </button>
    </div>
  );
};
