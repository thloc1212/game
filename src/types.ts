export type GameCategory = 'all' | 'speed' | 'reflex' | 'timing' | 'brain';

export interface GameMetadata {
  id: string;
  number: string;
  title: string;
  mechanic: string;
  duration: number; // seconds
  reward: number; // tokens
  category: 'speed' | 'reflex' | 'timing' | 'brain';
  categoryLabel: string;
  objective: string;
  rules: string;
  iconName: string;
  gradient: string;
  badgeColor: string;
  keyboardHint?: string;
}

export interface PlayerStats {
  tokens: number;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  history: GameHistoryRecord[];
}

export interface GameHistoryRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  won: boolean;
  reward: number;
  timestamp: number;
}

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';
