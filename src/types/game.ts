/**
 * Cyber CTF Clash - Shared Game Types & Interfaces
 * Cryptography, Cybersecurity, Mathematics & Digital Forensics Riddle Battle
 */

export type GameMode = '1v1' | '2v2' | '4v4';

export type ChallengeCategory = 
  | 'CRYPTOGRAPHY' 
  | 'CYBERSECURITY' 
  | 'MATHEMATICS' 
  | 'DIGITAL_FORENSICS';

export type ChallengeDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type TierSelection = ChallengeDifficulty | 'ALL';

export type TeamType = 'RED' | 'BLUE';

export type GameStatus = 
  | 'LOBBY' 
  | 'PLAYING' 
  | 'LEVEL_UP'
  | 'GAME_OVER';

export interface CTFChallenge {
  id: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  title: string;
  story: string; // The riddle / scenario
  artifact: string; // The cipher, hex, packet data, or math problem
  hint: string;
  acceptedAnswers: string[]; // Valid flags or solutions (case-insensitive)
  points: number;
  explanation: string;
}

export interface PlayerStats {
  flagsCaptured: number;
  fastestSolveMs: number;
  cryptoSolved: number;
  cyberSolved: number;
  mathSolved: number;
  forensicsSolved: number;
  cheatViolations: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isReady: boolean;
  team: TeamType;
  score: number;
  roundScoreDelta: number;
  connected: boolean;
  isBot?: boolean;
  stats: PlayerStats;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text: string;
  isSystem?: boolean;
  isFlagAlert?: boolean;
  isSecurityAlert?: boolean;
  timestamp: number;
}

export interface ReactionEvent {
  id: string;
  emoji: string;
  playerName: string;
  timestamp: number;
}

export interface RoomSettings {
  timeLimitSeconds: number; // default 120
  questionCount: number; // default 5
  selectedCategories: ChallengeCategory[]; // default all 4
  antiCheatEnabled: boolean; // default true
}

export interface PublicRoomSummary {
  code: string;
  name: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: GameStatus;
  isPublic: boolean;
  mode: GameMode;
  currentTier: ChallengeDifficulty;
  selectedTier: TierSelection;
  settings?: RoomSettings;
}

export interface CTFGameState {
  mode: GameMode;
  selectedTier: TierSelection;
  currentTier: ChallengeDifficulty;
  currentChallengeIndex: number;
  totalChallengesInTier: number; // Configurable questions per tier (default 5)
  activeChallenge: CTFChallenge;
  timeRemaining: number;
  timerDuration: number;
  tierNumber: number; // 1 = Beginner, 2 = Intermediate, 3 = Advanced
  
  // Solved tracking
  solvedPlayerIds: string[]; // Players who cracked the current flag
  solvedTeamIds: TeamType[]; // Teams who cracked it
  firstSolverName?: string;
  
  // Team scores
  redScore: number;
  blueScore: number;
}

export interface Room {
  code: string;
  name: string;
  isPublic: boolean;
  mode: GameMode;
  selectedTier: TierSelection;
  maxPlayers: number;
  createdAt: number;
  players: Player[];
  status: GameStatus;
  currentTier: ChallengeDifficulty;
  challengeIndex: number;
  challengesDeck: CTFChallenge[];
  ctfState: CTFGameState | null;
  settings: RoomSettings;
  chatMessages: ChatMessage[];
  reactions: ReactionEvent[];
}

// Client-to-Server Messages
export type ClientMessage =
  | { type: 'LIST_ROOMS' }
  | { type: 'CREATE_ROOM'; playerName: string; avatar: string; color: string; isPublic?: boolean; mode?: GameMode; selectedTier?: TierSelection; settings?: Partial<RoomSettings> }
  | { type: 'UPDATE_ROOM_SETTINGS'; settings: Partial<RoomSettings> }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string; avatar: string; color: string; team?: TeamType }
  | { type: 'LEAVE_ROOM' }
  | { type: 'RECONNECT_SESSION'; roomCode: string; playerId: string }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_TIER'; tier: TierSelection }
  | { type: 'SWITCH_TEAM'; team: TeamType }
  | { type: 'SET_READY'; isReady: boolean }
  | { type: 'UPDATE_PROFILE'; name?: string; avatar?: string; color?: string }
  | { type: 'CLAIM_HOST' }
  | { type: 'FILL_BOTS' }
  | { type: 'START_GAME'; mode?: GameMode; tier?: TierSelection }
  | { type: 'SUBMIT_FLAG'; flag: string }
  | { type: 'ANTI_CHEAT_VIOLATION'; reason: string }
  | { type: 'REQUEST_HINT' }
  | { type: 'SKIP_CHALLENGE' }
  | { type: 'SEND_CHAT'; text: string }
  | { type: 'SEND_REACTION'; emoji: string }
  | { type: 'KICK_PLAYER'; targetPlayerId: string }
  | { type: 'PLAY_AGAIN' };

// Server-to-Client Messages
export type ServerMessage =
  | { type: 'ROOM_STATE'; room: Room; yourPlayerId: string }
  | { type: 'ROOM_LIST'; rooms: PublicRoomSummary[] }
  | { type: 'ERROR'; message: string }
  | { type: 'POP_REACTION'; emoji: string; playerName: string }
  | { type: 'ANTI_CHEAT_ALERT'; playerName: string; message: string; reverted: boolean }
  | { type: 'FLAG_RESULT'; isCorrect: boolean; pointsAwarded: number; solverName: string; isFirst: boolean }
  | { type: 'AUDIO_CUE'; sound: 'ding' | 'buzz' | 'correct' | 'wrong' | 'cheer' | 'start' | 'countdown' | 'reveal' | 'tick' | 'win' };
