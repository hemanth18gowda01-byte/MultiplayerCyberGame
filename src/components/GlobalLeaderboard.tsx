import React, { useState, useEffect } from 'react';
import { Player, GameMode, TeamType } from '../types/game';
import {
  Trophy,
  Award,
  Medal,
  Users,
  Shield,
  Zap,
  Key,
  Binary,
  Search,
  Sparkles,
  BarChart3,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export interface SessionPlayerRecord {
  id: string;
  name: string;
  avatar: string;
  team: TeamType;
  roundsPlayed: number;
  roundsWon: number;
  totalScore: number;
  totalFlags: number;
  cryptoSolved: number;
  cyberSolved: number;
  mathSolved: number;
  forensicsSolved: number;
}

export interface SessionTeamRecord {
  team: TeamType;
  wins: number;
  losses: number;
  ties: number;
  totalScore: number;
  totalFlags: number;
}

export interface SessionHistoryEntry {
  roundId: string;
  timestamp: number;
  mode: GameMode;
  winningTeam: TeamType | 'TIE';
  redScore: number;
  blueScore: number;
  mvpName: string;
  mvpScore: number;
}

interface GlobalLeaderboardProps {
  currentPlayers: Player[];
  mode: GameMode;
  winningTeam: TeamType | 'TIE';
  redScore: number;
  blueScore: number;
}

const STORAGE_PLAYERS_KEY = 'ctf_session_players_v1';
const STORAGE_TEAMS_KEY = 'ctf_session_teams_v1';
const STORAGE_HISTORY_KEY = 'ctf_session_history_v1';

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  currentPlayers,
  mode,
  winningTeam,
  redScore,
  blueScore
}) => {
  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'TEAMS' | 'ROUNDS'>('PLAYERS');
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayerRecord[]>([]);
  const [sessionTeams, setSessionTeams] = useState<Record<TeamType, SessionTeamRecord>>({
    RED: { team: 'RED', wins: 0, losses: 0, ties: 0, totalScore: 0, totalFlags: 0 },
    BLUE: { team: 'BLUE', wins: 0, losses: 0, ties: 0, totalScore: 0, totalFlags: 0 }
  });
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);
  const [hasRecordedCurrentRound, setHasRecordedCurrentRound] = useState(false);

  // Load and record multi-round session data
  useEffect(() => {
    try {
      const storedPlayersRaw = localStorage.getItem(STORAGE_PLAYERS_KEY);
      const storedTeamsRaw = localStorage.getItem(STORAGE_TEAMS_KEY);
      const storedHistoryRaw = localStorage.getItem(STORAGE_HISTORY_KEY);

      let playersMap: Record<string, SessionPlayerRecord> = {};
      if (storedPlayersRaw) {
        try { playersMap = JSON.parse(storedPlayersRaw); } catch {}
      }

      let teamsData: Record<TeamType, SessionTeamRecord> = {
        RED: { team: 'RED', wins: 0, losses: 0, ties: 0, totalScore: 0, totalFlags: 0 },
        BLUE: { team: 'BLUE', wins: 0, losses: 0, ties: 0, totalScore: 0, totalFlags: 0 }
      };
      if (storedTeamsRaw) {
        try { teamsData = JSON.parse(storedTeamsRaw); } catch {}
      }

      let historyList: SessionHistoryEntry[] = [];
      if (storedHistoryRaw) {
        try { historyList = JSON.parse(storedHistoryRaw); } catch {}
      }

      // Check if we need to record this finished round
      const mvp = [...currentPlayers].sort((a, b) => b.score - a.score)[0];
      const roundKey = `${Date.now()}_${mode}`;

      if (!hasRecordedCurrentRound && currentPlayers.length > 0) {
        // 1. Update cumulative player stats
        currentPlayers.forEach(p => {
          const isWinner = mode === '1v1'
            ? p.id === mvp?.id
            : p.team === winningTeam;

          const existing = playersMap[p.name] || {
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            team: p.team,
            roundsPlayed: 0,
            roundsWon: 0,
            totalScore: 0,
            totalFlags: 0,
            cryptoSolved: 0,
            cyberSolved: 0,
            mathSolved: 0,
            forensicsSolved: 0
          };

          existing.avatar = p.avatar;
          existing.team = p.team;
          existing.roundsPlayed += 1;
          if (isWinner) existing.roundsWon += 1;
          existing.totalScore += p.score;
          existing.totalFlags += p.stats.flagsCaptured;
          existing.cryptoSolved += p.stats.cryptoSolved;
          existing.cyberSolved += p.stats.cyberSolved;
          existing.mathSolved += p.stats.mathSolved;
          existing.forensicsSolved += p.stats.forensicsSolved;

          playersMap[p.name] = existing;
        });

        // 2. Update team records
        const redFlags = currentPlayers.filter(p => p.team === 'RED').reduce((acc, p) => acc + p.stats.flagsCaptured, 0);
        const blueFlags = currentPlayers.filter(p => p.team === 'BLUE').reduce((acc, p) => acc + p.stats.flagsCaptured, 0);

        teamsData.RED.totalScore += redScore;
        teamsData.RED.totalFlags += redFlags;
        teamsData.BLUE.totalScore += blueScore;
        teamsData.BLUE.totalFlags += blueFlags;

        if (winningTeam === 'RED') {
          teamsData.RED.wins += 1;
          teamsData.BLUE.losses += 1;
        } else if (winningTeam === 'BLUE') {
          teamsData.BLUE.wins += 1;
          teamsData.RED.losses += 1;
        } else {
          teamsData.RED.ties += 1;
          teamsData.BLUE.ties += 1;
        }

        // 3. Record round entry
        const entry: SessionHistoryEntry = {
          roundId: roundKey,
          timestamp: Date.now(),
          mode,
          winningTeam,
          redScore,
          blueScore,
          mvpName: mvp?.name || 'Hacker',
          mvpScore: mvp?.score || 0
        };
        historyList = [entry, ...historyList.slice(0, 19)]; // Keep last 20 rounds

        // Save
        localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(playersMap));
        localStorage.setItem(STORAGE_TEAMS_KEY, JSON.stringify(teamsData));
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(historyList));

        setHasRecordedCurrentRound(true);
      }

      setSessionPlayers(Object.values(playersMap).sort((a, b) => b.totalScore - a.totalScore));
      setSessionTeams(teamsData);
      setSessionHistory(historyList);

    } catch (e) {
      console.error('Failed to update session leaderboard', e);
    }
  }, [currentPlayers, mode, winningTeam, redScore, blueScore, hasRecordedCurrentRound]);

  const handleResetSession = () => {
    localStorage.removeItem(STORAGE_PLAYERS_KEY);
    localStorage.removeItem(STORAGE_TEAMS_KEY);
    localStorage.removeItem(STORAGE_HISTORY_KEY);
    setSessionPlayers([]);
    setSessionTeams({
      RED: { team: 'RED', wins: 0, losses: 0, ties: 0, totalScore: 0, totalFlags: 0 },
      BLUE: { team: 'BLUE', wins: 0, losses: 0, ties: 0, totalScore: 0, totalFlags: 0 }
    });
    setSessionHistory([]);
  };

  const totalRoundsPlayed = sessionHistory.length;
  const redWinPct = totalRoundsPlayed > 0 ? Math.round((sessionTeams.RED.wins / totalRoundsPlayed) * 100) : 50;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      
      {/* Component Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Multi-Round Session Leaderboard
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Cumulative rankings, flags cracked, and team rivalry across all matches
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('PLAYERS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'PLAYERS'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Players
          </button>

          <button
            onClick={() => setActiveTab('TEAMS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'TEAMS'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Team Standings
          </button>

          <button
            onClick={() => setActiveTab('ROUNDS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ROUNDS'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Match History ({totalRoundsPlayed})
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TOP PLAYERS (ALL ROUNDS)
         ========================================================================= */}
      {activeTab === 'PLAYERS' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
              Ranked by cumulative match score & flags captured
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {sessionPlayers.length} Active Operative(s)
            </span>
          </div>

          <div className="space-y-2.5">
            {sessionPlayers.map((p, idx) => (
              <div
                key={p.id + idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  idx === 0
                    ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : idx === 1
                    ? 'bg-slate-950 border-slate-700'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                    idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>

                  <span className="text-2xl">{p.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{p.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        p.team === 'RED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {p.team}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Grandmaster
                        </span>
                      )}
                    </div>

                    {/* Category flags badge row */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-mono" title="Crypto solved">
                        🔑 {p.cryptoSolved}
                      </span>
                      <span>·</span>
                      <span className="text-rose-400 font-mono" title="Cyber solved">
                        🛡️ {p.cyberSolved}
                      </span>
                      <span>·</span>
                      <span className="text-amber-400 font-mono" title="Math solved">
                        🔢 {p.mathSolved}
                      </span>
                      <span>·</span>
                      <span className="text-cyan-400 font-mono" title="Forensics solved">
                        🔍 {p.forensicsSolved}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score and Flag Stats */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 text-right">
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Flags Cracked</div>
                    <div className="text-sm font-mono font-black text-cyan-300">{p.totalFlags} 🚩</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Rounds Won</div>
                    <div className="text-sm font-mono font-black text-emerald-400">{p.roundsWon}/{p.roundsPlayed}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Total Score</div>
                    <div className="text-base font-mono font-black text-amber-300">{p.totalScore} pts</div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TEAM STANDINGS & RIVALRY
         ========================================================================= */}
      {activeTab === 'TEAMS' && (
        <div className="space-y-6">
          
          {/* Dual Team Showdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* TEAM RED */}
            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-base uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  Team Red Record
                </h4>
                <span className="font-mono text-xs font-bold text-rose-300">
                  {sessionTeams.RED.wins} Wins · {sessionTeams.RED.losses} Losses
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-mono">Total Points</div>
                  <div className="text-2xl font-mono font-black text-white mt-0.5">{sessionTeams.RED.totalScore}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-mono">Total Flags</div>
                  <div className="text-2xl font-mono font-black text-rose-400 mt-0.5">{sessionTeams.RED.totalFlags} 🚩</div>
                </div>
              </div>
            </div>

            {/* TEAM BLUE */}
            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-blue-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-base uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Team Blue Record
                </h4>
                <span className="font-mono text-xs font-bold text-blue-300">
                  {sessionTeams.BLUE.wins} Wins · {sessionTeams.BLUE.losses} Losses
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-mono">Total Points</div>
                  <div className="text-2xl font-mono font-black text-white mt-0.5">{sessionTeams.BLUE.totalScore}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-mono">Total Flags</div>
                  <div className="text-2xl font-mono font-black text-blue-400 mt-0.5">{sessionTeams.BLUE.totalFlags} 🚩</div>
                </div>
              </div>
            </div>

          </div>

          {/* Session Dominance Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-rose-400">Team Red Dominance ({redWinPct}%)</span>
              <span className="text-blue-400">Team Blue Dominance ({100 - redWinPct}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800 flex">
              <div className="bg-rose-500 transition-all duration-700" style={{ width: `${redWinPct}%` }} />
              <div className="bg-blue-500 transition-all duration-700" style={{ width: `${100 - redWinPct}%` }} />
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: MULTI-ROUND MATCH HISTORY
         ========================================================================= */}
      {activeTab === 'ROUNDS' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-mono">
            Chronological log of rounds played in this session:
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {sessionHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No past rounds recorded yet. Complete more matches to build your history!
              </div>
            ) : (
              sessionHistory.map((h, i) => (
                <div
                  key={h.roundId + i}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-bold uppercase">
                      Round {sessionHistory.length - i}
                    </span>
                    <span className="text-cyan-400 uppercase font-bold">{h.mode}</span>
                    <span className="text-slate-300">
                      Winner: <strong className={h.winningTeam === 'RED' ? 'text-rose-400' : h.winningTeam === 'BLUE' ? 'text-blue-400' : 'text-amber-400'}>
                        {h.winningTeam === 'TIE' ? 'TIE' : `Team ${h.winningTeam}`}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      Red: <strong className="text-white">{h.redScore}</strong> · Blue: <strong className="text-white">{h.blueScore}</strong>
                    </span>
                    <span className="text-amber-300 hidden sm:inline">
                      MVP: {h.mvpName}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reset Session Option */}
      <div className="flex justify-end pt-2 border-t border-slate-800/80">
        <button
          onClick={handleResetSession}
          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Session Stats</span>
        </button>
      </div>

    </div>
  );
};
