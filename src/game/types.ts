export interface Room {
  id: string;
  name: string;
  description: string;
  atmosphere: 'eerie' | 'dread' | 'terror' | 'nightmare' | 'void';
  exits: string[];
  hasKey: boolean;
  prank: Prank | null;
  items: string[];
  ambientDescription: string;
  journalEntry?: JournalEntry;
}

export interface Prank {
  id: string;
  type: 'jumpscare' | 'creepy' | 'illusion' | 'whisper' | 'door_slam' | 'mirror' | 'shadow' | 'possession';
  triggerText: string;
  scareText: string;
  sanityDamage: number;
  duration: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  chapter: number;
}

export interface Level {
  id: number;
  name: string;
  subtitle: string;
  introNarrative: string[];
  exitNarrative: string[];
  rooms: Record<string, Room>;
  startRoom: string;
  requiredKeys: number;
  colorScheme: {
    primary: string;
    accent: string;
    bg: string;
    glow: string;
  };
}

export interface GameState {
  currentLevel: number;
  currentRoom: string;
  sanity: number;
  keysFound: number;
  pranksTriggered: string[];
  roomsVisited: string[];
  completed: boolean;
  playerName: string;
  startTime: number;
  inventory: string[];
  journalsFound: JournalEntry[];
  hardcore: boolean;
}

export type GamePhase = 'title' | 'intro' | 'playing' | 'scare' | 'levelComplete' | 'ad' | 'gameOver' | 'victory';
