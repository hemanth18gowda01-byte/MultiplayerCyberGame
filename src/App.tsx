/**
 * Cyber CTF Clash - Real-Time Multi-Device Riddle Battle
 * Cryptography, Cybersecurity, Mathematics & Digital Forensics
 * Modes: 1v1, 2v2, 4v4 (With Friends or Bots)
 */

import React, { useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { Navbar } from './components/Navbar';
import { LobbyView } from './components/LobbyView';
import { CTFPlayScreen } from './components/CTFPlayScreen';
import { CTFVictoryScreen } from './components/CTFVictoryScreen';
import { ChatAndReactions } from './components/ChatAndReactions';
import { RulesModal } from './components/RulesModal';
import { NetlifyExportModal } from './components/NetlifyExportModal';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const {
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
  } = useGameSocket();

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-400 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        connected={connected}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        roomCode={room?.code}
        onLeaveRoom={room ? leaveRoom : undefined}
      />

      {/* Global Error Banner */}
      {error && (
        <div className="max-w-xl mx-auto px-4 mt-4 w-full">
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Game Screen Router */}
      <main className="flex-1 flex flex-col">
        {!room || room.status === 'LOBBY' ? (
          <LobbyView
            room={room}
            myPlayerId={myPlayerId}
            publicRooms={publicRooms}
            connected={connected}
            onRefreshRooms={listRooms}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onLeaveRoom={leaveRoom}
            onSetReady={setReady}
            onSetMode={setMode}
            onSetTier={setTier}
            onSwitchTeam={switchTeam}
            onFillBots={fillBots}
            onStartGame={startGame}
            onSendReaction={sendReaction}
          />
        ) : room.status === 'PLAYING' && room.ctfState ? (
          <CTFPlayScreen
            ctfState={room.ctfState}
            players={room.players}
            myPlayerId={myPlayerId}
            onSubmitFlag={submitFlag}
            onSkipChallenge={skipChallenge}
            onAntiCheatViolation={reportAntiCheat}
            antiCheatAlert={antiCheatAlert}
            onClearAntiCheatAlert={clearAntiCheatAlert}
          />
        ) : room.status === 'GAME_OVER' ? (
          <CTFVictoryScreen
            players={room.players}
            myPlayerId={myPlayerId}
            mode={room.mode}
            onPlayAgain={playAgain}
            onLeaveRoom={leaveRoom}
          />
        ) : null}
      </main>

      {/* Live Chat & Reactions (Available in-room) */}
      {room && (
        <ChatAndReactions
          chatMessages={room.chatMessages}
          floatingReactions={floatingReactions}
          onSendChat={sendChat}
          onSendReaction={sendReaction}
          myPlayerId={myPlayerId}
        />
      )}

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Netlify Export Modal */}
      <NetlifyExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

    </div>
  );
}
