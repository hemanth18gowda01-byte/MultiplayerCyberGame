import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, GameMode } from '../types/game';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { Trophy, RotateCcw, LogOut, Terminal, Swords, Shield, Award } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CTFVictoryScreenProps {
  players: Player[];
  myPlayerId: string | null;
  mode: GameMode;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export const CTFVictoryScreen: React.FC<CTFVictoryScreenProps> = ({
  players,
  myPlayerId,
  mode,
  onPlayAgain,
  onLeaveRoom
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const redScore = players.filter(p => p.team === 'RED').reduce((acc, p) => acc + p.score, 0);
  const blueScore = players.filter(p => p.team === 'BLUE').reduce((acc, p) => acc + p.score, 0);

  const winningTeam = redScore > blueScore ? 'RED' : blueScore > redScore ? 'BLUE' : 'TIE';
  const mvp = sortedPlayers[0];

  const myPlayer = players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;

  useEffect(() => {
    sounds.playCheer();
    const end = Date.now() + 3500;
    const colors = ['#06b6d4', '#3b82f6', '#ef4444', '#10b981'];

    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-1 flex flex-col justify-between">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
          <Terminal className="w-3.5 h-3.5" /> CTF Battle Completed
        </div>
        
        {mode === '1v1' ? (
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Champion: <span className="text-amber-400">{mvp?.name || 'Player'}</span>!
          </h2>
        ) : (
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {winningTeam === 'TIE' ? (
              <span className="text-amber-400">It's a Deadlock Tie!</span>
            ) : (
              <span>Team <span className={winningTeam === 'RED' ? 'text-rose-500' : 'text-blue-500'}>{winningTeam}</span> Wins the CTF!</span>
            )}
          </h2>
        )}

        <p className="text-slate-400 text-sm">
          All cryptography, cybersecurity, mathematics, and digital forensics tiers conquered!
        </p>
      </div>

      {/* Current Round Score Summary */}
      {mode !== '1v1' && (
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto w-full">
          <div className={`p-5 rounded-2xl border text-center ${
            winningTeam === 'RED' ? 'bg-rose-500/20 border-rose-500/50 ring-2 ring-rose-500 shadow-xl shadow-rose-500/20' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-xs uppercase tracking-widest font-bold text-rose-400">Team Red Round Score</span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-white mt-1">{redScore}</div>
            <div className="text-[11px] text-slate-400 mt-1">points</div>
          </div>

          <div className={`p-5 rounded-2xl border text-center ${
            winningTeam === 'BLUE' ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500 shadow-xl shadow-blue-500/20' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Team Blue Round Score</span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-white mt-1">{blueScore}</div>
            <div className="text-[11px] text-slate-400 mt-1">points</div>
          </div>
        </div>
      )}

      {/* MULTI-ROUND SESSION & GLOBAL LEADERBOARD COMPONENT */}
      <GlobalLeaderboard
        currentPlayers={players}
        mode={mode}
        winningTeam={winningTeam}
        redScore={redScore}
        blueScore={blueScore}
      />

      {/* Action Footer */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Cumulative session stats saved! Ready to clash in the next round?
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onLeaveRoom()}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Room</span>
          </button>

          {isHost && (
            <button
              onClick={() => onPlayAgain()}
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:brightness-110 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY NEXT ROUND</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
