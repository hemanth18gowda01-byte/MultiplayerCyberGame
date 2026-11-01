import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Room,
  Player,
  ClientMessage,
  ServerMessage,
  PublicRoomSummary,
  GameMode,
  TeamType,
  ChallengeDifficulty,
  TierSelection,
  CTFGameState,
  CTFChallenge,
  RoomSettings
} from './src/types/game.js';
import {
  BEGINNER_CHALLENGES,
  INTERMEDIATE_CHALLENGES,
  ADVANCED_CHALLENGES,
  getRandomizedTierDeck,
  BOT_HACKER_NAMES,
  CYBER_AVATARS
} from './src/data/ctfChallenges.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// State management
const rooms = new Map<string, Room>();
const clientRooms = new Map<WebSocket, { playerId: string; roomCode: string }>();
const roomTimers = new Map<string, NodeJS.Timeout>();

function getMaxPlayersForMode(mode: GameMode): number {
  switch (mode) {
    case '1v1': return 2;
    case '2v2': return 4;
    case '4v4': return 8;
  }
}

function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function broadcastToRoom(roomCode: string, message: ServerMessage, excludeWs?: WebSocket) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const data = JSON.stringify(message);
  for (const [ws, meta] of clientRooms.entries()) {
    if (meta.roomCode === roomCode && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function sendRoomState(room: Room) {
  for (const [ws, meta] of clientRooms.entries()) {
    if (meta.roomCode === room.code && ws.readyState === WebSocket.OPEN) {
      const msg: ServerMessage = {
        type: 'ROOM_STATE',
        room,
        yourPlayerId: meta.playerId
      };
      ws.send(JSON.stringify(msg));
    }
  }
}

function broadcastPublicRoomList() {
  const list: PublicRoomSummary[] = [];
  for (const room of rooms.values()) {
    if (room.isPublic) {
      list.push({
        code: room.code,
        name: room.name,
        hostName: room.players.find(p => p.isHost)?.name || 'Host',
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
        isPublic: room.isPublic,
        mode: room.mode,
        currentTier: room.currentTier,
        selectedTier: room.selectedTier || 'BEGINNER',
        settings: room.settings
      });
    }
  }
  const msg: ServerMessage = { type: 'ROOM_LIST', rooms: list };
  const payload = JSON.stringify(msg);

  for (const [ws] of clientRooms.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function stopRoomTimer(roomCode: string) {
  const existing = roomTimers.get(roomCode);
  if (existing) {
    clearInterval(existing);
    roomTimers.delete(roomCode);
  }
}

// Get challenges list for given tier
function getChallengesForTier(tier: ChallengeDifficulty): CTFChallenge[] {
  switch (tier) {
    case 'BEGINNER': return BEGINNER_CHALLENGES;
    case 'INTERMEDIATE': return INTERMEDIATE_CHALLENGES;
    case 'ADVANCED': return ADVANCED_CHALLENGES;
  }
}

// Start or advance to a challenge
function launchChallenge(room: Room, tier: ChallengeDifficulty, challengeIdx: number) {
  stopRoomTimer(room.code);

  const QUESTIONS_PER_TIER = room.settings?.questionCount ?? 5;
  const categories = room.settings?.selectedCategories;

  // Initialize or replenish randomized deck for this tier if needed
  if (!room.challengesDeck || room.challengesDeck.length === 0 || room.challengesDeck[0]?.difficulty !== tier) {
    room.challengesDeck = getRandomizedTierDeck(tier, QUESTIONS_PER_TIER, categories);
  }

  // If questions completed in this tier, level up or finish!
  if (challengeIdx >= QUESTIONS_PER_TIER || challengeIdx >= room.challengesDeck.length) {
    if (room.selectedTier === 'ALL') {
      if (tier === 'BEGINNER') {
        room.currentTier = 'INTERMEDIATE';
        room.challengeIndex = 0;
        room.challengesDeck = getRandomizedTierDeck('INTERMEDIATE', QUESTIONS_PER_TIER, categories);
        room.chatMessages.push({
          id: `chat-${Date.now()}`,
          playerId: 'system',
          playerName: 'CTF Terminal',
          avatar: '🚀',
          text: `🎯 LEVEL 1 COMPLETED! Advancing to [LEVEL 2: INTERMEDIATE]!`,
          isSystem: true,
          timestamp: Date.now()
        });
        broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'cheer' });
        launchChallenge(room, 'INTERMEDIATE', 0);
        return;
      } else if (tier === 'INTERMEDIATE') {
        room.currentTier = 'ADVANCED';
        room.challengeIndex = 0;
        room.challengesDeck = getRandomizedTierDeck('ADVANCED', QUESTIONS_PER_TIER, categories);
        room.chatMessages.push({
          id: `chat-${Date.now()}`,
          playerId: 'system',
          playerName: 'CTF Terminal',
          avatar: '🔥',
          text: `⚡ LEVEL 2 COMPLETED! Advancing to [LEVEL 3: ADVANCED]!`,
          isSystem: true,
          timestamp: Date.now()
        });
        broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'cheer' });
        launchChallenge(room, 'ADVANCED', 0);
        return;
      } else {
        // Completed all tiers gauntlet -> Game Over victory!
        room.status = 'GAME_OVER';
        room.ctfState = null;
        broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'win' });
        sendRoomState(room);
        broadcastPublicRoomList();
        return;
      }
    } else {
      // Completed the questions for the selected tier -> Game Over victory!
      room.status = 'GAME_OVER';
      room.ctfState = null;
      broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'win' });
      sendRoomState(room);
      broadcastPublicRoomList();
      return;
    }
  }

  const challenge = room.challengesDeck[challengeIdx];
  const tierNumber = tier === 'BEGINNER' ? 1 : tier === 'INTERMEDIATE' ? 2 : 3;
  // Customizable time limit: 120s default
  const duration = room.settings?.timeLimitSeconds ?? 120;

  // Calculate team scores
  let redScore = 0;
  let blueScore = 0;
  room.players.forEach(p => {
    if (p.team === 'RED') redScore += p.score;
    else blueScore += p.score;
  });

  room.status = 'PLAYING';
  room.currentTier = tier;
  room.challengeIndex = challengeIdx;

  const ctfState: CTFGameState = {
    mode: room.mode,
    selectedTier: room.selectedTier || 'BEGINNER',
    currentTier: tier,
    currentChallengeIndex: challengeIdx,
    totalChallengesInTier: QUESTIONS_PER_TIER,
    activeChallenge: challenge,
    timeRemaining: duration,
    timerDuration: duration,
    tierNumber,
    solvedPlayerIds: [],
    solvedTeamIds: [],
    redScore,
    blueScore
  };

  room.ctfState = ctfState;

  // Add system alert in chat
  room.chatMessages.push({
    id: `chat-${Date.now()}`,
    playerId: 'system',
    playerName: 'CTF Terminal',
    avatar: '⚡',
    text: `[LEVEL ${tierNumber} - ${tier}] New Riddle Unlocked: "${challenge.title}" (${challenge.category})`,
    isSystem: true,
    timestamp: Date.now()
  });

  broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'start' });
  sendRoomState(room);
  scheduleBotSolver(room, challenge);

  // Authoritative countdown timer
  const interval = setInterval(() => {
    if (!room.ctfState || room.status !== 'PLAYING') {
      clearInterval(interval);
      return;
    }

    room.ctfState.timeRemaining -= 1;

    if (room.ctfState.timeRemaining <= 0) {
      clearInterval(interval);
      // Time expired: skip to next riddle
      room.chatMessages.push({
        id: `chat-${Date.now()}`,
        playerId: 'system',
        playerName: 'CTF Terminal',
        avatar: '⏳',
        text: `Time expired for "${challenge.title}"! Answer was: ${challenge.acceptedAnswers[0]}`,
        isSystem: true,
        timestamp: Date.now()
      });
      broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'buzz' });
      launchChallenge(room, tier, challengeIdx + 1);
    } else {
      sendRoomState(room);
    }
  }, 1000);

  roomTimers.set(room.code, interval);
}

// Bot auto-solve simulation for practice / balance
function scheduleBotSolver(room: Room, challenge: CTFChallenge) {
  const bots = room.players.filter(p => p.isBot);
  if (bots.length === 0 || !room.ctfState) return;

  bots.forEach(bot => {
    // Solves between 18 and 38 seconds depending on difficulty
    const baseTime = challenge.difficulty === 'BEGINNER' ? 18000 : challenge.difficulty === 'INTERMEDIATE' ? 26000 : 36000;
    const jitter = Math.random() * 12000;
    const delay = baseTime + jitter;

    setTimeout(() => {
      const curRoom = rooms.get(room.code);
      if (curRoom && curRoom.status === 'PLAYING' && curRoom.ctfState?.activeChallenge.id === challenge.id) {
        if (!curRoom.ctfState.solvedPlayerIds.includes(bot.id)) {
          handleFlagSubmission(curRoom, bot.id, challenge.acceptedAnswers[0]);
        }
      }
    }, delay);
  });
}

function handleFlagSubmission(room: Room, playerId: string, rawInput: string) {
  if (!room.ctfState || room.status !== 'PLAYING') return;

  const state = room.ctfState;
  const challenge = state.activeChallenge;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  const normalized = rawInput.trim().toLowerCase().replace(/^ctf\{|\}$/g, '');
  const isMatch = challenge.acceptedAnswers.some(ans => {
    const cleanAns = ans.trim().toLowerCase().replace(/^ctf\{|\}$/g, '');
    return cleanAns === normalized || ans.trim().toLowerCase() === rawInput.trim().toLowerCase();
  });

  if (isMatch) {
    if (state.solvedPlayerIds.includes(playerId)) return; // Already solved

    const isFirstSolve = state.solvedPlayerIds.length === 0;
    state.solvedPlayerIds.push(playerId);
    if (!state.solvedTeamIds.includes(player.team)) {
      state.solvedTeamIds.push(player.team);
    }

    const timeBonusRatio = Math.max(0.1, state.timeRemaining / state.timerDuration);
    const bonus = isFirstSolve ? Math.round(500 * timeBonusRatio) : 0;
    const pointsAwarded = challenge.points + bonus;

    player.score += pointsAwarded;
    player.stats.flagsCaptured += 1;
    if (challenge.category === 'CRYPTOGRAPHY') player.stats.cryptoSolved++;
    if (challenge.category === 'CYBERSECURITY') player.stats.cyberSolved++;
    if (challenge.category === 'MATHEMATICS') player.stats.mathSolved++;
    if (challenge.category === 'DIGITAL_FORENSICS') player.stats.forensicsSolved++;

    if (player.team === 'RED') state.redScore += pointsAwarded;
    else state.blueScore += pointsAwarded;

    // Chat celebration
    room.chatMessages.push({
      id: `chat-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      text: `🚩 CRACKED THE FLAG for "${challenge.title}"! (+${pointsAwarded} pts)`,
      isSystem: true,
      isFlagAlert: true,
      timestamp: Date.now()
    });

    broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'correct' });

    // In 1v1, or if first team cracks it, advance after brief 3s celebration!
    if (isFirstSolve) {
      state.firstSolverName = player.name;
      sendRoomState(room);

      setTimeout(() => {
        const curRoom = rooms.get(room.code);
        if (curRoom && curRoom.ctfState?.activeChallenge.id === challenge.id) {
          launchChallenge(curRoom, curRoom.currentTier, curRoom.challengeIndex + 1);
        }
      }, 3500);
      return;
    }

    sendRoomState(room);
  } else {
    // Incorrect guess
    broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'wrong' });
  }
}

// WebSocket connection routing
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString());
      handleClientMessage(ws, msg);
    } catch (err) {
      console.error('Error parsing client message:', err);
    }
  });

  ws.on('close', () => {
    const meta = clientRooms.get(ws);
    if (!meta) return;

    const { playerId, roomCode } = meta;
    clientRooms.delete(ws);

    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.connected = false;
    }

    // Grace period before cleaning up disconnected players
    setTimeout(() => {
      const curRoom = rooms.get(roomCode);
      if (!curRoom) return;
      const curPlayer = curRoom.players.find(p => p.id === playerId);
      if (curPlayer && !curPlayer.connected && curRoom.status === 'LOBBY') {
        curRoom.players = curRoom.players.filter(p => p.id !== playerId);
        if (curPlayer.isHost && curRoom.players.length > 0) {
          curRoom.players[0].isHost = true;
        }
        const activeHumans = curRoom.players.filter(p => !p.isBot && p.connected);
        if (activeHumans.length === 0) {
          stopRoomTimer(roomCode);
          rooms.delete(roomCode);
        } else {
          sendRoomState(curRoom);
        }
        broadcastPublicRoomList();
      }
    }, 60000);

    sendRoomState(room);
    broadcastPublicRoomList();
  });
});

function handleClientMessage(ws: WebSocket, msg: ClientMessage) {
  if (msg.type === 'LIST_ROOMS') {
    const list: PublicRoomSummary[] = [];
    for (const room of rooms.values()) {
      if (room.isPublic) {
        list.push({
          code: room.code,
          name: room.name,
          hostName: room.players.find(p => p.isHost)?.name || 'Host',
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          status: room.status,
          isPublic: room.isPublic,
          mode: room.mode,
          currentTier: room.currentTier,
          selectedTier: room.selectedTier || 'BEGINNER'
        });
      }
    }
    ws.send(JSON.stringify({ type: 'ROOM_LIST', rooms: list }));
    return;
  }

  if (msg.type === 'RECONNECT_SESSION') {
    const targetCode = (msg.roomCode || '').trim().toUpperCase();
    const room = rooms.get(targetCode);
    if (room) {
      let existingPlayer = room.players.find(p => p.id === msg.playerId);
      if (!existingPlayer && room.players.length > 0) {
        existingPlayer = room.players.find(p => !p.isBot);
      }
      if (existingPlayer) {
        existingPlayer.connected = true;
        clientRooms.set(ws, { playerId: existingPlayer.id, roomCode: targetCode });
        ws.send(JSON.stringify({
          type: 'ROOM_STATE',
          room,
          yourPlayerId: existingPlayer.id
        }));
        broadcastPublicRoomList();
        return;
      }
    }
    return;
  }

  if (msg.type === 'CREATE_ROOM') {
    const code = generateRoomCode();
    const playerId = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mode = msg.mode || '1v1';
    const selectedTier = msg.selectedTier || 'BEGINNER';
    const initialDifficulty = selectedTier === 'ALL' ? 'BEGINNER' : selectedTier;
    const maxPlayers = getMaxPlayersForMode(mode);

    const settings: RoomSettings = {
      timeLimitSeconds: msg.settings?.timeLimitSeconds ? Number(msg.settings.timeLimitSeconds) : 120,
      questionCount: msg.settings?.questionCount ? Number(msg.settings.questionCount) : 5,
      selectedCategories: msg.settings?.selectedCategories && msg.settings.selectedCategories.length > 0
        ? msg.settings.selectedCategories
        : ['CRYPTOGRAPHY', 'CYBERSECURITY', 'MATHEMATICS', 'DIGITAL_FORENSICS'],
      antiCheatEnabled: msg.settings?.antiCheatEnabled ?? true
    };

    const hostPlayer: Player = {
      id: playerId,
      name: (msg.playerName || 'CyberHost').trim().slice(0, 16),
      avatar: msg.avatar || '💻',
      color: msg.color || '#38bdf8',
      isHost: true,
      isReady: true,
      team: 'RED',
      score: 0,
      roundScoreDelta: 0,
      connected: true,
      stats: {
        flagsCaptured: 0,
        fastestSolveMs: 0,
        cryptoSolved: 0,
        cyberSolved: 0,
        mathSolved: 0,
        forensicsSolved: 0,
        cheatViolations: 0
      }
    };

    const newRoom: Room = {
      code,
      name: `${hostPlayer.name}'s CTF Grid`,
      isPublic: msg.isPublic ?? true,
      mode,
      selectedTier,
      maxPlayers,
      createdAt: Date.now(),
      players: [hostPlayer],
      status: 'LOBBY',
      currentTier: initialDifficulty,
      challengeIndex: 0,
      challengesDeck: [],
      ctfState: null,
      settings,
      chatMessages: [
        {
          id: `sys-${Date.now()}`,
          playerId: 'system',
          playerName: 'CTF Terminal',
          avatar: '🛡️',
          text: `Room initialized in [${mode.toUpperCase()}] mode (${selectedTier} Tier)! Solve Cryptography, Cybersecurity, Mathematics & Digital Forensics riddles to win.`,
          isSystem: true,
          timestamp: Date.now()
        }
      ],
      reactions: []
    };

    rooms.set(code, newRoom);
    clientRooms.set(ws, { playerId, roomCode: code });

    ws.send(JSON.stringify({
      type: 'ROOM_STATE',
      room: newRoom,
      yourPlayerId: playerId
    }));

    broadcastPublicRoomList();
    return;
  }

  if (msg.type === 'JOIN_ROOM') {
    const targetCode = (msg.roomCode || '').trim().toUpperCase();
    const room = rooms.get(targetCode);

    if (!room) {
      ws.send(JSON.stringify({ type: 'ERROR', message: `Room "${targetCode}" not found. Check the code!` }));
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      ws.send(JSON.stringify({ type: 'ERROR', message: `Room is full for ${room.mode} mode (${room.maxPlayers} max).` }));
      return;
    }

    // Auto-balance teams
    const redCount = room.players.filter(p => p.team === 'RED').length;
    const blueCount = room.players.filter(p => p.team === 'BLUE').length;
    const assignedTeam: TeamType = msg.team || (redCount <= blueCount ? 'RED' : 'BLUE');

    const playerId = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newPlayer: Player = {
      id: playerId,
      name: (msg.playerName || 'Hacker').trim().slice(0, 16),
      avatar: msg.avatar || CYBER_AVATARS[Math.floor(Math.random() * CYBER_AVATARS.length)],
      color: assignedTeam === 'RED' ? '#ef4444' : '#3b82f6',
      isHost: false,
      isReady: false,
      team: assignedTeam,
      score: 0,
      roundScoreDelta: 0,
      connected: true,
      stats: {
        flagsCaptured: 0,
        fastestSolveMs: 0,
        cryptoSolved: 0,
        cyberSolved: 0,
        mathSolved: 0,
        forensicsSolved: 0,
        cheatViolations: 0
      }
    };

    room.players.push(newPlayer);
    clientRooms.set(ws, { playerId, roomCode: targetCode });

    room.chatMessages.push({
      id: `sys-${Date.now()}`,
      playerId: 'system',
      playerName: 'CTF Terminal',
      avatar: '👋',
      text: `${newPlayer.name} connected to Team ${assignedTeam}!`,
      isSystem: true,
      timestamp: Date.now()
    });

    broadcastToRoom(targetCode, { type: 'AUDIO_CUE', sound: 'ding' });
    sendRoomState(room);
    broadcastPublicRoomList();
    return;
  }

  // Room-bound actions
  const meta = clientRooms.get(ws);
  if (!meta) return;
  const room = rooms.get(meta.roomCode);
  if (!room) return;
  const player = room.players.find(p => p.id === meta.playerId);

  if (msg.type === 'SET_MODE') {
    room.mode = msg.mode;
    room.maxPlayers = getMaxPlayersForMode(msg.mode);
    sendRoomState(room);
    broadcastPublicRoomList();
    return;
  }

  if (msg.type === 'SET_TIER') {
    room.selectedTier = msg.tier;
    room.currentTier = msg.tier === 'ALL' ? 'BEGINNER' : msg.tier;
    room.challengesDeck = [];
    sendRoomState(room);
    broadcastPublicRoomList();
    return;
  }

  if (msg.type === 'UPDATE_ROOM_SETTINGS') {
    if (player && player.isHost && msg.settings) {
      room.settings = {
        ...room.settings,
        ...msg.settings,
        timeLimitSeconds: msg.settings.timeLimitSeconds !== undefined ? Number(msg.settings.timeLimitSeconds) : room.settings.timeLimitSeconds,
        questionCount: msg.settings.questionCount !== undefined ? Number(msg.settings.questionCount) : room.settings.questionCount,
        selectedCategories: msg.settings.selectedCategories && msg.settings.selectedCategories.length > 0
          ? msg.settings.selectedCategories
          : room.settings.selectedCategories,
        antiCheatEnabled: msg.settings.antiCheatEnabled !== undefined
          ? Boolean(msg.settings.antiCheatEnabled)
          : room.settings.antiCheatEnabled
      };
      if (room.status === 'LOBBY') {
        room.challengesDeck = [];
      }
      sendRoomState(room);
      broadcastPublicRoomList();
    }
    return;
  }

  if (msg.type === 'SWITCH_TEAM') {
    if (player) {
      player.team = msg.team;
      player.color = msg.team === 'RED' ? '#ef4444' : '#3b82f6';
      sendRoomState(room);
    }
    return;
  }

  if (msg.type === 'SET_READY') {
    if (player) {
      player.isReady = msg.isReady;
      sendRoomState(room);
    }
    return;
  }

  if (msg.type === 'UPDATE_PROFILE') {
    if (player) {
      if (msg.name) player.name = msg.name.trim().slice(0, 16);
      if (msg.avatar) player.avatar = msg.avatar;
      if (msg.color) player.color = msg.color;
      sendRoomState(room);
    }
    return;
  }

  if (msg.type === 'FILL_BOTS') {
    const targetCapacity = room.maxPlayers;
    const currentCount = room.players.length;
    const needed = Math.max(0, targetCapacity - currentCount);

    for (let i = 0; i < needed; i++) {
      const redCount = room.players.filter(p => p.team === 'RED').length;
      const blueCount = room.players.filter(p => p.team === 'BLUE').length;
      const team: TeamType = redCount <= blueCount ? 'RED' : 'BLUE';

      const botName = BOT_HACKER_NAMES[Math.floor(Math.random() * BOT_HACKER_NAMES.length)] + (Math.floor(Math.random() * 90) + 10);
      const botPlayer: Player = {
        id: `bot-${Date.now()}-${i}-${Math.floor(Math.random() * 100)}`,
        name: botName,
        avatar: '🤖',
        color: team === 'RED' ? '#ef4444' : '#3b82f6',
        isHost: false,
        isReady: true,
        team,
        score: 0,
        roundScoreDelta: 0,
        connected: true,
        isBot: true,
        stats: {
          flagsCaptured: 0,
          fastestSolveMs: 0,
          cryptoSolved: 0,
          cyberSolved: 0,
          mathSolved: 0,
          forensicsSolved: 0,
          cheatViolations: 0
        }
      };
      room.players.push(botPlayer);
    }

    sendRoomState(room);
    broadcastPublicRoomList();
    return;
  }

  if (msg.type === 'START_GAME') {
    console.log(`[START_GAME] Room ${room.code} starting match in mode ${room.mode}`);
    // Auto-fill remaining players with bots if required to reach mode requirement
    if (room.mode === '1v1' && room.players.length < 2) {
      const botName = BOT_HACKER_NAMES[0];
      room.players.push({
        id: `bot-${Date.now()}`,
        name: botName,
        avatar: '🤖',
        color: '#ef4444',
        isHost: false,
        isReady: true,
        team: player?.team === 'RED' ? 'BLUE' : 'RED',
        score: 0,
        roundScoreDelta: 0,
        connected: true,
        isBot: true,
        stats: { flagsCaptured: 0, fastestSolveMs: 0, cryptoSolved: 0, cyberSolved: 0, mathSolved: 0, forensicsSolved: 0, cheatViolations: 0 }
      });
    }

    if (msg.tier) {
      room.selectedTier = msg.tier;
    }
    const selectedTier = room.selectedTier || 'BEGINNER';
    const startTier = selectedTier === 'ALL' ? 'BEGINNER' : selectedTier;

    room.currentTier = startTier;
    room.challengeIndex = 0;
    room.challengesDeck = getRandomizedTierDeck(startTier, room.settings?.questionCount ?? 5, room.settings?.selectedCategories);
    launchChallenge(room, startTier, 0);
    broadcastPublicRoomList();
    return;
  }

  if (msg.type === 'SUBMIT_FLAG') {
    handleFlagSubmission(room, meta.playerId, msg.flag);
    return;
  }

  if (msg.type === 'ANTI_CHEAT_VIOLATION') {
    if (!player || room.status !== 'PLAYING') return;
    if (room.settings && !room.settings.antiCheatEnabled) return;

    player.stats.cheatViolations = (player.stats.cheatViolations || 0) + 1;
    const penalty = Math.min(player.score, 200);
    player.score -= penalty;

    // Revert solve on current challenge if they had solved it
    if (room.ctfState) {
      room.ctfState.solvedPlayerIds = room.ctfState.solvedPlayerIds.filter(id => id !== player.id);
      if (player.team === 'RED') {
        room.ctfState.redScore = Math.max(0, room.ctfState.redScore - penalty);
      } else {
        room.ctfState.blueScore = Math.max(0, room.ctfState.blueScore - penalty);
      }
      if (room.ctfState.firstSolverName === player.name) {
        room.ctfState.firstSolverName = undefined;
      }
    }

    room.chatMessages.push({
      id: `anticheat-${Date.now()}`,
      playerId: 'system',
      playerName: 'Sentinel Anti-Cheat',
      avatar: '🚨',
      text: `⚠️ ANTI-CHEAT REVERT: ${player.name} navigated away from the game terminal! Current progress reverted and penalized (-${penalty} pts).`,
      isSystem: true,
      isSecurityAlert: true,
      timestamp: Date.now()
    });

    broadcastToRoom(room.code, {
      type: 'ANTI_CHEAT_ALERT',
      playerName: player.name,
      message: `Tab-switch / window blur detected for ${player.name}! Progress reverted.`,
      reverted: true
    });
    broadcastToRoom(room.code, { type: 'AUDIO_CUE', sound: 'buzz' });

    sendRoomState(room);
    return;
  }

  if (msg.type === 'SKIP_CHALLENGE') {
    if (player?.isHost) {
      launchChallenge(room, room.currentTier, room.challengeIndex + 1);
    }
    return;
  }

  if (msg.type === 'SEND_CHAT') {
    if (player && msg.text.trim()) {
      room.chatMessages.push({
        id: `chat-${Date.now()}-${Math.random()}`,
        playerId: player.id,
        playerName: player.name,
        avatar: player.avatar,
        text: msg.text.trim().slice(0, 120),
        timestamp: Date.now()
      });
      if (room.chatMessages.length > 50) room.chatMessages.shift();
      sendRoomState(room);
    }
    return;
  }

  if (msg.type === 'SEND_REACTION') {
    if (player && msg.emoji) {
      broadcastToRoom(room.code, {
        type: 'POP_REACTION',
        emoji: msg.emoji,
        playerName: player.name
      });
    }
    return;
  }

  if (msg.type === 'PLAY_AGAIN') {
    stopRoomTimer(room.code);
    room.status = 'LOBBY';
    const startTier = room.selectedTier === 'ALL' ? 'BEGINNER' : (room.selectedTier || 'BEGINNER');
    room.currentTier = startTier;
    room.challengeIndex = 0;
    room.challengesDeck = [];
    room.ctfState = null;
    room.players.forEach(p => {
      p.score = 0;
      p.roundScoreDelta = 0;
      p.isReady = p.isHost;
    });
    sendRoomState(room);
    broadcastPublicRoomList();
    return;
  }

  if (msg.type === 'LEAVE_ROOM') {
    clientRooms.delete(ws);
    room.players = room.players.filter(p => p.id !== meta.playerId);
    if (player?.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }
    if (room.players.length === 0) {
      stopRoomTimer(room.code);
      rooms.delete(room.code);
    } else {
      sendRoomState(room);
    }
    broadcastPublicRoomList();
    return;
  }
}

// Full-stack Vite & Express setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      activeRooms: rooms.size,
      time: new Date().toISOString()
    });
  });

  app.get('/api/rooms', (req, res) => {
    res.json(Array.from(rooms.values()));
  });

  app.get('/api/rooms/:code', (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  });

  const handleStartApi = (req: express.Request, res: express.Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    console.log(`[API START] Force start CTF game for room ${code}`);
    const selectedTier = room.selectedTier || 'BEGINNER';
    const startTier = selectedTier === 'ALL' ? 'BEGINNER' : selectedTier;
    room.currentTier = startTier;
    room.challengeIndex = 0;
    room.challengesDeck = getRandomizedTierDeck(startTier, 5);
    launchChallenge(room, startTier, 0);
    broadcastPublicRoomList();
    res.json({ success: true, status: room.status, tier: room.currentTier });
  };

  app.post('/api/rooms/:code/start', handleStartApi);
  app.get('/api/rooms/:code/start', handleStartApi);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CTF Multiplayer Server active on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
