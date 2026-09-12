import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Dices, 
  Sparkles, 
  Trophy, 
  Flame, 
  Volume2, 
  VolumeX, 
  Search, 
  RotateCcw,
  Zap,
  Info,
  Laptop
} from 'lucide-react';
import { GameMetadata, GameCategory, PlayerStats } from './types';
import { GAMES_LIST } from './data/gamesList';
import { GameCard } from './components/GameCard';
import { GameArena } from './components/GameArena';
import { RandomModal } from './components/RandomModal';
import { sounds } from './utils/sound';

const STATS_STORAGE_KEY = 'techpoly_minigames_stats_v1';

const INITIAL_STATS: PlayerStats = {
  tokens: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  history: [],
};

export default function App() {
  const [selectedGame, setSelectedGame] = useState<GameMetadata | null>(null);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_STATS;
  });
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Sync stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectGame = (game: GameMetadata) => {
    sounds.playTap();
    setSelectedGame(game);
  };

  const handleOpenRandom = () => {
    sounds.playWhoosh();
    setRandomModalOpen(true);
  };

  const handleConfirmRandomGame = (game: GameMetadata) => {
    setRandomModalOpen(false);
    setSelectedGame(game);
  };

  const handleGameComplete = (game: GameMetadata, won: boolean) => {
    setStats((prev) => {
      const nextWon = prev.gamesWon + (won ? 1 : 0);
      const nextStreak = won ? prev.currentStreak + 1 : 0;
      const nextBestStreak = Math.max(prev.bestStreak, nextStreak);
      const nextTokens = prev.tokens + (won ? game.reward : 0);

      const record = {
        id: String(Date.now()),
        gameId: game.id,
        gameTitle: game.title,
        won,
        reward: won ? game.reward : 0,
        timestamp: Date.now(),
      };

      return {
        tokens: nextTokens,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: nextWon,
        currentStreak: nextStreak,
        bestStreak: nextBestStreak,
        history: [record, ...prev.history.slice(0, 19)],
      };
    });
  };

  const handleNextRandom = () => {
    const remaining = GAMES_LIST.filter((g) => g.id !== selectedGame?.id);
    const nextGame = remaining[Math.floor(Math.random() * remaining.length)] || GAMES_LIST[0];
    setSelectedGame(nextGame);
  };

  // Filter games
  const filteredGames = GAMES_LIST.filter((game) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'speed' && game.category === 'speed') ||
      (activeCategory === 'reflex' && game.category === 'reflex') ||
      (activeCategory === 'timing' && game.category === 'timing') ||
      (activeCategory === 'brain' && game.category === 'brain');

    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.mechanic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.number.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: `Tất cả (${GAMES_LIST.length})` },
    { id: 'speed', label: '⚡ Bấm Nhanh' },
    { id: 'reflex', label: '🎯 Phản Xạ' },
    { id: 'timing', label: '⏱️ Canh Giờ' },
    { id: 'brain', label: '🧠 Trí Não & Đố' },
  ];

  // If in a game arena, show GameArena
  if (selectedGame) {
    return (
      <GameArena
        game={selectedGame}
        onBack={() => setSelectedGame(null)}
        onGameComplete={handleGameComplete}
        onNextRandomGame={handleNextRandom}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        userTokens={stats.tokens}
      />
    );
  }

  return (
    <div id="techpoly-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/85 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Gamepad2 className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white font-mono">TECHPOLY</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  {GAMES_LIST.length} MINIGAMES
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Hệ Thống Trò Chơi Tốc Độ, Phản Xạ &amp; Trí Tuệ Laptop
              </p>
            </div>
          </div>

          {/* User Tokens & Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Laptop optimization badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hỗ trợ Chuột / Phím Space / Mũi Tên</span>
            </div>

            {/* Token Chip */}
            <div 
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-black transition-colors cursor-pointer shadow-sm"
              title="Xem thống kê & Lịch sử nhận Token"
            >
              <span className="text-base">🪙</span>
              <span>{stats.tokens} Token</span>
            </div>

            {/* Streak Chip */}
            {stats.currentStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
                <span>Streak x{stats.currentStreak}</span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner with Quick Random Play */}
      <section className="relative overflow-hidden pt-8 pb-6 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thử Thách Game Nhanh Dành Riêng Cho Laptop</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight mb-2">
              Bộ Sưu Tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">{GAMES_LIST.length} Minigames</span> TechPoly
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Lựa chọn trực tiếp trò chơi ưa thích hoặc thử vận may với chế độ bốc ngẫu nhiên. Tích lũy token thưởng, thử thách phản xạ và bứt phá kỷ lục!
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Random Game Big Button */}
              <button
                id="btn-play-random"
                onClick={handleOpenRandom}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer"
              >
                <Dices className="w-5 h-5" />
                <span>CHƠI NGẪU NHIÊN (RANDOM)</span>
              </button>

              <button
                onClick={() => setShowStatsModal(true)}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Thống Kê Chiến Tích</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-center min-w-[130px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng Token</span>
              <div className="text-2xl font-black text-amber-400 mt-0.5">🪙 {stats.tokens}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-center min-w-[130px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trận Thắng</span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {stats.gamesWon}/{stats.gamesPlayed}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-center min-w-[130px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chuỗi Thắng</span>
              <div className="text-2xl font-black text-orange-400 mt-0.5">{stats.currentStreak} 🔥</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-center min-w-[130px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kỷ Lục Chuỗi</span>
              <div className="text-2xl font-black text-purple-400 mt-0.5">{stats.bestStreak} 👑</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Search Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveCategory(cat.id as GameCategory);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm game, luật chơi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 pb-16">
        {filteredGames.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <Info className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-300">Không tìm thấy minigame phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc chọn danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onPlay={handleSelectGame} />
            ))}
          </div>
        )}
      </main>

      {/* Random Picker Roulette Modal */}
      <RandomModal
        isOpen={randomModalOpen}
        games={GAMES_LIST}
        onClose={() => setRandomModalOpen(false)}
        onSelectGame={handleConfirmRandomGame}
      />

      {/* Player Stats & History Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Thống Kê Chiến Tích</h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Kho Token Tích Lũy</span>
                <div className="text-2xl font-black text-amber-400 mt-1">🪙 {stats.tokens}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tỷ Lệ Thắng</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {stats.gamesPlayed > 0 ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Recent Match History */}
            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Lịch sử đấu gần nhất (20 ván)
              </span>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {stats.history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">Chưa có lượt chơi nào. Hãy thử sức ngay!</p>
                ) : (
                  stats.history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={h.won ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {h.won ? '✓ THẮNG' : '✗ THUA'}
                        </span>
                        <span className="font-semibold text-slate-200">{h.gameTitle}</span>
                      </div>
                      <span className={h.won ? 'font-black text-amber-400' : 'text-slate-500'}>
                        {h.won ? `+${h.reward} 🪙` : '0 🪙'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reset Stats button */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ điểm token và lịch sử?')) {
                    setStats(INITIAL_STATS);
                  }
                }}
                className="text-xs text-rose-400/80 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại thống kê
              </button>

              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
