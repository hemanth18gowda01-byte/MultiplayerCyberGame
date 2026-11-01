import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  Play,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Bot,
  RefreshCw,
  Crown,
  Trash2,
  Terminal,
  Shield,
  ArrowRight,
  UserCheck,
  Flame,
  Swords
} from 'lucide-react';
import { Room, PublicRoomSummary, Player, GameMode, TeamType, TierSelection } from '../types/game';
import { CYBER_AVATARS } from '../data/ctfChallenges';
import { sounds } from '../utils/sound';

interface LobbyViewProps {
  room: Room | null;
  myPlayerId: string | null;
  publicRooms: PublicRoomSummary[];
  connected: boolean;
  onRefreshRooms: () => void;
  onCreateRoom: (playerName: string, avatar: string, color: string, isPublic?: boolean, mode?: GameMode, selectedTier?: TierSelection) => void;
  onJoinRoom: (roomCode: string, playerName: string, avatar: string, color: string, team?: TeamType) => void;
  onLeaveRoom: () => void;
  onSetReady: (isReady: boolean) => void;
  onSetMode: (mode: GameMode) => void;
  onSetTier?: (tier: TierSelection) => void;
  onSwitchTeam: (team: TeamType) => void;
  onFillBots: () => void;
  onStartGame: () => void;
  onSendReaction: (emoji: string) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  myPlayerId,
  publicRooms,
  connected,
  onRefreshRooms,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onSetReady,
  onSetMode,
  onSetTier,
  onSwitchTeam,
  onFillBots,
  onStartGame,
  onSendReaction
}) => {
  // Local profile state
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('pc_player_name') || `Hacker_${Math.floor(Math.random() * 900) + 100}`;
  });
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('pc_avatar') || CYBER_AVATARS[0];
  });
  const [selectedMode, setSelectedMode] = useState<GameMode>('1v1');
  const [selectedTier, setSelectedTier] = useState<TierSelection>('BEGINNER');

  // Join code input state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isPublicRoom, setIsPublicRoom] = useState(true);

  // Link copy and QR code modal states
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Auto-fill room code from URL query param `?room=ABCD`
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('room');
      if (codeFromUrl && codeFromUrl.length === 4) {
        setJoinCodeInput(codeFromUrl.toUpperCase());
      }
    }
  }, []);

  // Generate QR code for room link
  useEffect(() => {
    if (room?.code && showQrModal) {
      const inviteUrl = `${window.location.origin}/?room=${room.code}`;
      QRCode.toDataURL(inviteUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR code', err));
    }
  }, [room?.code, showQrModal]);

  const handleCopyInviteLink = () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}/?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    sounds.playDing();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateRoomSubmit = (modeToCreate: GameMode) => {
    if (!playerName.trim()) return;
    onCreateRoom(playerName.trim(), avatar, '#38bdf8', isPublicRoom, modeToCreate, selectedTier);
  };

  const handleJoinWithCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) return;
    onJoinRoom(cleanCode, playerName.trim(), avatar, '#38bdf8');
  };

  const myPlayer = room?.players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;

  // =========================================================================
  // VIEW 1: INSIDE ROOM LOBBY
  // =========================================================================
  if (room) {
    const inviteUrl = `${window.location.origin}/?room=${room.code}`;
    const redPlayers = room.players.filter(p => p.team === 'RED');
    const bluePlayers = room.players.filter(p => p.team === 'BLUE');

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Room Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5" /> CTF Riddle Duel
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {room.players.length} / {room.maxPlayers} Operatives
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {room.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Mode: <strong className="text-cyan-400 uppercase font-mono">{room.mode}</strong> · Tier: <strong className="text-amber-300 font-mono">{room.selectedTier || 'BEGINNER'}</strong> (5 Questions/Match)
              </p>
            </div>

            {/* Giant Room Code Card */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="bg-slate-950/90 border-2 border-cyan-500/40 rounded-2xl px-5 py-3 text-center shadow-lg">
                <div className="text-[10px] uppercase tracking-widest font-mono font-bold text-cyan-400/80">
                  Room Code
                </div>
                <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-cyan-300">
                  {room.code}
                </div>
              </div>

              <div className="flex sm:flex-col gap-2">
                <button
                  onClick={handleCopyInviteLink}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700 cursor-pointer shadow-sm"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-cyan-500/30 cursor-pointer shadow-sm"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Show QR</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Reaction Buzzers */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-medium">Hacker Buzzers:</span>
            <div className="flex items-center gap-2">
              {['💻', '⚡', '🛡️', '💀', '🔥', '👀'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSendReaction(emoji)}
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all text-base flex items-center justify-center cursor-pointer border border-slate-700"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge Tier Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Challenge Tier Setting (5 Randomized Riddles)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every match generates a fresh, randomized deck across Cryptography, Cybersecurity, Mathematics & Digital Forensics.
              </p>
            </div>
            {isHost && (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 self-start sm:self-auto">
                HOST CONTROLLER
              </span>
            )}
          </div>

          {/* Tier buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'BEGINNER', label: 'Beginner', count: '5 Riddles', desc: 'Caesar cipher, standard ports, binary, magic bytes', color: 'emerald' },
              { id: 'INTERMEDIATE', label: 'Intermediate', count: '5 Riddles', desc: 'Vigenere, RSA totients, hex dumps, SQLi', color: 'amber' },
              { id: 'ADVANCED', label: 'Advanced', count: '5 Riddles', desc: 'Diffie-Hellman, AES keys, buffer overflows, secp256k1', color: 'rose' },
              { id: 'ALL', label: 'All Tiers Gauntlet', count: '15 Riddles', desc: '5 Beginner → 5 Intermediate → 5 Advanced', color: 'indigo' },
            ].map(t => {
              const active = (room.selectedTier || 'BEGINNER') === t.id;
              return (
                <button
                  key={t.id}
                  disabled={!isHost}
                  onClick={() => onSetTier && onSetTier(t.id as TierSelection)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    !isHost ? 'cursor-default opacity-90' : 'cursor-pointer hover:border-slate-600'
                  } ${
                    active
                      ? t.color === 'emerald'
                        ? 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/10'
                        : t.color === 'amber'
                        ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400 shadow-lg shadow-amber-500/10'
                        : t.color === 'rose'
                        ? 'border-rose-400 bg-rose-500/15 ring-2 ring-rose-400 shadow-lg shadow-rose-500/10'
                        : 'border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black uppercase ${
                      active ? 'text-white' : 'text-slate-300'
                    }`}>
                      {t.label}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      active ? 'bg-slate-900 text-cyan-300 font-bold border border-cyan-800' : 'bg-slate-900/60 text-slate-500'
                    }`}>
                      {t.count}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2">
                    {t.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Anti-cheat notice banner */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-tight text-slate-400">
              <strong className="text-slate-200">Anti-Cheat Active:</strong> Navigating away from the terminal during a match (switching tabs or window blur) reverts your current progress to enforce fair play!
            </span>
          </div>
        </div>

        {/* Mode Selector for Host */}
        {isHost && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Match Format
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['1v1', '2v2', '4v4'] as GameMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => onSetMode(m)}
                  className={`py-2.5 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                    room.mode === m
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {m === '1v1' ? 'Option 1: 1 v 1 Duel' : m === '2v2' ? 'Option 2: 2 v 2 Clash' : 'Option 3: 4 v 4 Squad'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Teams & Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TEAM RED */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-rose-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                Team Red ({redPlayers.length})
              </h3>

              {myPlayer?.team !== 'RED' && (
                <button
                  onClick={() => onSwitchTeam('RED')}
                  className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 cursor-pointer"
                >
                  Join Red
                </button>
              )}
            </div>

            <div className="space-y-2 min-h-[100px]">
              {redPlayers.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="font-bold text-sm text-white">{p.name}</span>
                    {p.isHost && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    {p.isBot && <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">BOT</span>}
                  </div>
                  {p.id === myPlayerId && <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">YOU</span>}
                </div>
              ))}
            </div>
          </div>

          {/* TEAM BLUE */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-blue-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Team Blue ({bluePlayers.length})
              </h3>

              {myPlayer?.team !== 'BLUE' && (
                <button
                  onClick={() => onSwitchTeam('BLUE')}
                  className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 text-xs font-semibold border border-blue-800 cursor-pointer"
                >
                  Join Blue
                </button>
              )}
            </div>

            <div className="space-y-2 min-h-[100px]">
              {bluePlayers.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="font-bold text-sm text-white">{p.name}</span>
                    {p.isHost && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    {p.isBot && <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">BOT</span>}
                  </div>
                  {p.id === myPlayerId && <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold">YOU</span>}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Action Bar (Start CTF / Fill Bots) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {room.players.length < room.maxPlayers ? (
              <span>
                💡 Click <button onClick={onFillBots} className="text-cyan-400 underline font-bold cursor-pointer">Fill with Bots</button> to auto-fill the remaining {room.maxPlayers - room.players.length} slot(s) and start immediately!
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                ✓ Teams full and ready! Click Start to begin the CTF riddle race.
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onFillBots()}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-colors"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Fill with Bots</span>
            </button>

            <button
              onClick={() => onStartGame()}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 cursor-pointer text-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START CTF MATCH</span>
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
              <h3 className="text-xl font-black text-white mb-1">Scan to Join CTF Room</h3>
              <p className="text-xs text-slate-400 mb-4">
                Point any phone camera at this QR code to join Room <strong className="text-cyan-400">{room.code}</strong>.
              </p>

              <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 shadow-lg">
                {qrDataUrl && <img src={qrDataUrl} alt="Room QR Code" className="w-64 h-64 mx-auto" />}
              </div>

              <button
                onClick={handleCopyInviteLink}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct URL'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: WELCOME / CHOOSE MODE & CREATE OR JOIN
  // =========================================================================
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Welcome */}
      <div className="text-center space-y-3 pt-2 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold font-mono uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" /> Cyber CTF Riddle Race
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          Cyber, Crypto & <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Forensics CTF</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Crack riddles in <strong>Cryptography</strong>, <strong>Cybersecurity</strong>, <strong>Mathematics</strong>, and <strong>Digital Forensics</strong>. Starts from Beginner to Advanced — whoever solves first wins!
        </p>
      </div>

      {/* Challenge Tier Selector in Welcome View */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Select Challenge Difficulty Tier (5 Riddles / Match)
          </span>
          <span className="text-[11px] font-mono text-cyan-400 font-normal hidden sm:inline">
            Each match generates 5 unique questions from our cyber bank
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'BEGINNER', label: 'Beginner', count: '5 Riddles', desc: 'Caesar ciphers, port 22, binary math, PNG magic bytes', color: 'emerald' },
            { id: 'INTERMEDIATE', label: 'Intermediate', count: '5 Riddles', desc: 'Vigenere, RSA totients, hex payloads, SQL injections', color: 'amber' },
            { id: 'ADVANCED', label: 'Advanced', count: '5 Riddles', desc: 'Diffie-Hellman, AES keys, buffer overflows, secp256k1', color: 'rose' },
            { id: 'ALL', label: 'All Tiers Gauntlet', count: '15 Riddles', desc: 'Full 15-riddle campaign: Beginner → Inter → Advanced', color: 'indigo' },
          ].map(t => {
            const active = selectedTier === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTier(t.id as TierSelection)}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                  active
                    ? t.color === 'emerald'
                      ? 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/10'
                      : t.color === 'amber'
                      ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400 shadow-lg shadow-amber-500/10'
                      : t.color === 'rose'
                      ? 'border-rose-400 bg-rose-500/15 ring-2 ring-rose-400 shadow-lg shadow-rose-500/10'
                      : 'border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-black uppercase ${active ? 'text-white' : 'text-slate-300'}`}>
                    {t.label}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    active ? 'bg-slate-900 text-cyan-300 font-bold border border-cyan-800' : 'bg-slate-900/60 text-slate-500'
                  }`}>
                    {t.count}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2">
                  {t.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Picker Options Requested by User */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          Choose Match Mode (With Friends or Bots)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Option 1: 1v1 */}
          <div
            onClick={() => setSelectedMode('1v1')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMode === '1v1'
                ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/10'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                OPTION 1
              </span>
              <h3 className="text-xl font-black text-white">1 v 1 Duel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Head-to-head speed riddle race against a friend or bot. First to decode wins!
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleCreateRoomSubmit('1v1'); }}
              className="mt-4 w-full py-2.5 rounded-xl font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Play 1 v 1 ({selectedTier})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 2: 2v2 */}
          <div
            onClick={() => setSelectedMode('2v2')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMode === '2v2'
                ? 'border-blue-400 bg-blue-500/15 ring-2 ring-blue-400 shadow-xl shadow-blue-500/10'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                OPTION 2
              </span>
              <h3 className="text-xl font-black text-white">2 v 2 Team Clash</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Team Red vs Team Blue (2 players each). Collaborate or compete with bots.
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleCreateRoomSubmit('2v2'); }}
              className="mt-4 w-full py-2.5 rounded-xl font-black bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Play 2 v 2 ({selectedTier})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 3: 4v4 */}
          <div
            onClick={() => setSelectedMode('4v4')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMode === '4v4'
                ? 'border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-400 shadow-xl shadow-indigo-500/10'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                OPTION 3
              </span>
              <h3 className="text-xl font-black text-white">4 v 4 Squad CTF</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full 8-player cyber warfare. 4 on Team Red vs 4 on Team Blue.
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleCreateRoomSubmit('4v4'); }}
              className="mt-4 w-full py-2.5 rounded-xl font-black bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Play 4 v 4 ({selectedTier})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Join with Code Card */}
      <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Join With 4-Letter Room Code
        </h3>
        <form onSubmit={handleJoinWithCodeSubmit} className="space-y-3">
          <input
            type="text"
            maxLength={4}
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            placeholder="e.g. ABCD"
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-center font-mono text-xl font-black tracking-widest text-cyan-300 focus:outline-none uppercase"
          />
          <button
            type="submit"
            disabled={joinCodeInput.trim().length < 3}
            className="w-full py-2.5 rounded-xl font-black bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <span>JOIN ROOM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Public Rooms List */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Active Public CTF Grids</span>
          <button
            onClick={onRefreshRooms}
            className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {publicRooms.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            No public rooms active. Select Option 1, 2, or 3 above to start a match!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publicRooms.map(r => (
              <div key={r.code} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono flex-wrap">
                    <span className="font-bold text-cyan-400">{r.code}</span>
                    <span className="text-white text-xs font-bold">{r.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase font-mono">{r.mode}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase font-mono">
                      {r.selectedTier || r.currentTier || 'BEGINNER'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Host: {r.hostName} · {r.playerCount}/{r.maxPlayers} players
                  </div>
                </div>
                <button
                  onClick={() => onJoinRoom(r.code, playerName, avatar, '#38bdf8')}
                  disabled={r.playerCount >= r.maxPlayers}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
