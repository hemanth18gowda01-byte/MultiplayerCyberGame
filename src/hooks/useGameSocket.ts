import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Room,
  PublicRoomSummary,
  ServerMessage,
  ClientMessage,
  GameMode,
  TeamType,
  TierSelection
} from '../types/game';
import { sounds } from '../utils/sound';

export function useGameSocket() {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [antiCheatAlert, setAntiCheatAlert] = useState<{ playerName: string; message: string; reverted: boolean } | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: string; emoji: string; playerName: string }>>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = useCallback((msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(msg));
      } catch (err) {
        console.error('Failed to stringify/send client message:', err);
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);

      // Auto-reconnect to existing session if saved
      try {
        const savedCode = sessionStorage.getItem('pc_room_code');
        const savedPlayerId = sessionStorage.getItem('pc_player_id');
        if (savedCode && savedPlayerId) {
          ws.send(JSON.stringify({
            type: 'RECONNECT_SESSION',
            roomCode: savedCode,
            playerId: savedPlayerId
          }));
        }
      } catch (e) {
        console.error('Session storage read error', e);
      }

      // Immediately request active public room list
      ws.send(JSON.stringify({ type: 'LIST_ROOMS' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);

        if (msg.type === 'ROOM_STATE') {
          setRoom(msg.room);
          setMyPlayerId(msg.yourPlayerId);
          try {
            sessionStorage.setItem('pc_room_code', msg.room.code);
            sessionStorage.setItem('pc_player_id', msg.yourPlayerId);
          } catch {}
        } else if (msg.type === 'ROOM_LIST') {
          setPublicRooms(msg.rooms);
        } else if (msg.type === 'ERROR') {
          setError(msg.message);
          sounds.playWrong();
        } else if (msg.type === 'POP_REACTION') {
          const reaction = {
            id: `pop-${Date.now()}-${Math.random()}`,
            emoji: msg.emoji,
            playerName: msg.playerName
          };
          sounds.playPop();
          setFloatingReactions(prev => [...prev.slice(-15), reaction]);
          setTimeout(() => {
            setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
          }, 3000);
        } else if (msg.type === 'ANTI_CHEAT_ALERT') {
          setAntiCheatAlert({
            playerName: msg.playerName,
            message: msg.message,
            reverted: msg.reverted
          });
          sounds.playWrong();
          setTimeout(() => {
            setAntiCheatAlert(null);
          }, 4500);
        } else if (msg.type === 'AUDIO_CUE') {
          switch (msg.sound) {
            case 'ding': sounds.playDing(); break;
            case 'tick': sounds.playTick(); break;
            case 'correct': sounds.playCorrect(); break;
            case 'wrong': sounds.playWrong(); break;
            case 'start': sounds.playStart(); break;
            case 'cheer': sounds.playCheer(); break;
            case 'countdown': sounds.playDing(); break;
            case 'reveal': sounds.playDing(); break;
            case 'win': sounds.playCheer(); break;
            default: break;
          }
        }
      } catch (err) {
        console.error('Failed to parse server message', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 1500);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  // Actions
  const listRooms = useCallback(() => {
    sendMessage({ type: 'LIST_ROOMS' });
  }, [sendMessage]);

  const createRoom = useCallback((playerName: string, avatar: string, color: string, isPublic = true, mode: GameMode = '1v1', selectedTier: TierSelection = 'BEGINNER') => {
    sendMessage({
      type: 'CREATE_ROOM',
      playerName,
      avatar,
      color,
      isPublic,
      mode,
      selectedTier
    });
  }, [sendMessage]);

  const joinRoom = useCallback((roomCode: string, playerName: string, avatar: string, color: string, team?: TeamType) => {
    sendMessage({
      type: 'JOIN_ROOM',
      roomCode,
      playerName,
      avatar,
      color,
      team
    });
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    try {
      sessionStorage.removeItem('pc_room_code');
      sessionStorage.removeItem('pc_player_id');
    } catch {}
    sendMessage({ type: 'LEAVE_ROOM' });
    setRoom(null);
    setMyPlayerId(null);
    listRooms();
  }, [sendMessage, listRooms]);

  const setMode = useCallback((mode: GameMode) => {
    sendMessage({ type: 'SET_MODE', mode });
    sounds.playDing();
  }, [sendMessage]);

  const setTier = useCallback((tier: TierSelection) => {
    sendMessage({ type: 'SET_TIER', tier });
    sounds.playDing();
  }, [sendMessage]);

  const switchTeam = useCallback((team: TeamType) => {
    sendMessage({ type: 'SWITCH_TEAM', team });
    sounds.playDing();
  }, [sendMessage]);

  const setReady = useCallback((isReady: boolean) => {
    sendMessage({ type: 'SET_READY', isReady });
    sounds.playDing();
  }, [sendMessage]);

  const updateProfile = useCallback((name?: string, avatar?: string, color?: string) => {
    sendMessage({ type: 'UPDATE_PROFILE', name, avatar, color });
  }, [sendMessage]);

  const fillBots = useCallback(() => {
    sendMessage({ type: 'FILL_BOTS' });
    sounds.playDing();
  }, [sendMessage]);

  const startGame = useCallback((mode?: unknown, tier?: TierSelection) => {
    const cleanMode = typeof mode === 'string' && (mode === '1v1' || mode === '2v2' || mode === '4v4')
      ? (mode as GameMode)
      : undefined;
    sendMessage({ type: 'START_GAME', mode: cleanMode, tier });
    sounds.playStart();

    // Dual-path fail-safe trigger
    if (room?.code) {
      fetch(`/api/rooms/${room.code}/start`, { method: 'POST' }).catch(() => {});
    }
  }, [sendMessage, room?.code]);

  const submitFlag = useCallback((flag: string) => {
    sendMessage({ type: 'SUBMIT_FLAG', flag });
  }, [sendMessage]);

  const reportAntiCheat = useCallback((reason: string) => {
    sendMessage({ type: 'ANTI_CHEAT_VIOLATION', reason });
    sounds.playWrong();
  }, [sendMessage]);

  const skipChallenge = useCallback(() => {
    sendMessage({ type: 'SKIP_CHALLENGE' });
  }, [sendMessage]);

  const sendChat = useCallback((text: string) => {
    sendMessage({ type: 'SEND_CHAT', text });
  }, [sendMessage]);

  const sendReaction = useCallback((emoji: string) => {
    sendMessage({ type: 'SEND_REACTION', emoji });
  }, [sendMessage]);

  const playAgain = useCallback(() => {
    sendMessage({ type: 'PLAY_AGAIN' });
  }, [sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearAntiCheatAlert = useCallback(() => {
    setAntiCheatAlert(null);
  }, []);

  return {
    connected,
    room,
    myPlayerId,
    publicRooms,
    error,
    clearError,
    antiCheatAlert,
    clearAntiCheatAlert,
    floatingReactions,
    listRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    setMode,
    setTier,
    reportAntiCheat,
    switchTeam,
    setReady,
    updateProfile,
    fillBots,
    startGame,
    submitFlag,
    skipChallenge,
    sendChat,
    sendReaction,
    playAgain
  };
}
