import React from 'react';
import { Play, Zap, Swords, Users, ShieldAlert, HandMetal, Target, Bug, Timer, Grid, Palette, Compass, HelpCircle, Eye, Radio, Puzzle } from 'lucide-react';
import { GameMetadata } from '../types';

interface Props {
  game: GameMetadata;
  onPlay: (game: GameMetadata) => void;
}

export const GameCard: React.FC<Props> = ({ game, onPlay }) => {
  // Map iconName to lucide icon
  const getIcon = () => {
    switch (game.iconName) {
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Swords': return <Swords className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'HandMetal': return <HandMetal className="w-5 h-5" />;
      case 'Target': return <Target className="w-5 h-5" />;
      case 'Bug': return <Bug className="w-5 h-5" />;
      case 'Timer': return <Timer className="w-5 h-5" />;
      case 'Grid': return <Grid className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'HelpCircle': return <HelpCircle className="w-5 h-5" />;
      case 'Eye': return <Eye className="w-5 h-5" />;
      case 'Radio': return <Radio className="w-5 h-5" />;
      case 'Puzzle': return <Puzzle className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => onPlay(game)}
      className="group relative flex flex-col justify-between p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden"
    >
      {/* Background ambient gradient glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${game.gradient} opacity-10 group-hover:opacity-20 rounded-bl-full blur-2xl transition-opacity pointer-events-none`} />

      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black font-mono text-slate-500 group-hover:text-amber-400 transition-colors">
              #{game.number}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${game.badgeColor}`}>
              {game.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
            <span>🪙</span>
            <span>+{game.reward}</span>
          </div>
        </div>

        {/* Title and Icon */}
        <div className="flex items-start gap-3 mb-2.5">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${game.gradient} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug">
              {game.title}
            </h3>
            <span className="text-xs font-medium text-slate-400">
              Cơ chế: {game.mechanic}
            </span>
          </div>
        </div>

        {/* Objective */}
        <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
          {game.objective}
        </p>
      </div>

      {/* Footer Info & Quick Launch */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-1.5">
          <span>⏱️</span>
          <span>{game.duration} giây</span>
        </div>

        <button
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-200 text-xs font-bold transition-all shadow"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Chơi</span>
        </button>
      </div>
    </div>
  );
};
