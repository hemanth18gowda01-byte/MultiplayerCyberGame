import React, { useState, useEffect } from 'react';
import { CTFGameState, Player } from '../types/game';
import { CyberToolkit } from './CyberToolkit';
import {
  Shield,
  Clock,
  Send,
  Sparkles,
  Lightbulb,
  Copy,
  Check,
  Flag,
  Zap,
  Flame,
  Award,
  Terminal,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface CTFPlayScreenProps {
  ctfState: CTFGameState;
  players: Player[];
  myPlayerId: string | null;
  onSubmitFlag: (flag: string) => void;
  onSkipChallenge?: () => void;
  onAntiCheatViolation?: (reason: string) => void;
  antiCheatAlert?: { playerName: string; message: string; reverted: boolean } | null;
  onClearAntiCheatAlert?: () => void;
}

export const CTFPlayScreen: React.FC<CTFPlayScreenProps> = ({
  ctfState,
  players,
  myPlayerId,
  onSubmitFlag,
  onSkipChallenge,
  onAntiCheatViolation,
  antiCheatAlert,
  onClearAntiCheatAlert
}) => {
  const [flagInput, setFlagInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [copiedArtifact, setCopiedArtifact] = useState(false);
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);
  const [violationReason, setViolationReason] = useState<string>('');

  const challenge = ctfState.activeChallenge;
  const myPlayer = players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;

  // Active Anti-Cheat Detection: Listen for tab-switching (visibilitychange) and window blur
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;

    const triggerAntiCheatRevert = (reason: string) => {
      if (debounceTimer) return;

      // Revert local progress
      setFlagInput('');
      setShowHint(false);
      setViolationReason(
        reason === 'tab_hidden'
          ? 'Browser Tab Switched or Minimized'
          : 'Terminal Window Lost Focus (Navigated Away)'
      );
      setShowAntiCheatModal(true);
      sounds.playWrong();

      if (onAntiCheatViolation) {
        onAntiCheatViolation(reason);
      }

      debounceTimer = setTimeout(() => {
        debounceTimer = null;
      }, 4000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerAntiCheatRevert('tab_hidden');
      }
    };

    const handleWindowBlur = () => {
      triggerAntiCheatRevert('window_blur');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [onAntiCheatViolation]);

  const redPlayers = players.filter(p => p.team === 'RED');
  const bluePlayers = players.filter(p => p.team === 'BLUE');

  const timerRatio = Math.max(0, ctfState.timeRemaining / ctfState.timerDuration);
  const timerPercent = timerRatio * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    onSubmitFlag(flagInput.trim());
    setFlagInput('');
  };

  const handleCopyArtifact = () => {
    navigator.clipboard.writeText(challenge.artifact);
    setCopiedArtifact(true);
    sounds.playDing();
    setTimeout(() => setCopiedArtifact(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'CRYPTOGRAPHY': return 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/40 text-emerald-300';
      case 'CYBERSECURITY': return 'from-rose-500/20 to-rose-950/40 border-rose-500/40 text-rose-300';
      case 'MATHEMATICS': return 'from-amber-500/20 to-amber-950/40 border-amber-500/40 text-amber-300';
      case 'DIGITAL_FORENSICS': return 'from-cyan-500/20 to-cyan-950/40 border-cyan-500/40 text-cyan-300';
      default: return 'from-slate-800 to-slate-900 border-slate-700 text-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 flex-1 flex flex-col justify-between">
      
      {/* Top Header: Scores, Mode & Timer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          
          {/* Mode & Tier Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              {ctfState.mode.toUpperCase()} CTF
            </span>

            <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border ${
              ctfState.currentTier === 'BEGINNER'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : ctfState.currentTier === 'INTERMEDIATE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              LEVEL {ctfState.tierNumber}: {ctfState.currentTier}
            </span>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Riddle {ctfState.currentChallengeIndex + 1} of {ctfState.totalChallengesInTier}
            </span>
          </div>

          {/* Team Scores (or Player Scores) */}
          <div className="flex items-center gap-4 text-xs font-black">
            <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-xl text-rose-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>TEAM RED:</span>
              <span className="font-mono text-base text-white">{ctfState.redScore} pts</span>
            </div>

            <div className="text-slate-600 font-bold">VS</div>

            <div className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 px-3 py-1.5 rounded-xl text-blue-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span>TEAM BLUE:</span>
              <span className="font-mono text-base text-white">{ctfState.blueScore} pts</span>
            </div>

            {/* Anti-cheat status badge in header */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700/80 text-[11px] text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Cheat Guard Active</span>
              {myPlayer && (myPlayer.stats.cheatViolations || 0) > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                  {myPlayer.stats.cheatViolations} Violation(s)
                </span>
              )}
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-1.5 font-mono text-base text-amber-400 font-bold ml-2">
              <Clock className="w-4 h-4" />
              <span>{ctfState.timeRemaining}s</span>
            </div>
          </div>
        </div>

        {/* Dynamic Timer Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timerRatio > 0.4
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                : timerRatio > 0.2
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-orange-500 to-rose-600'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Global Anti-Cheat Alert Banner */}
      {antiCheatAlert && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border-2 border-rose-500/60 text-rose-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl animate-bounce">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-mono uppercase text-rose-300">🚨 Anti-Cheat Revert Alert: </span>
              <span>{antiCheatAlert.playerName} tried to switch tabs or navigate away! Progress has been reverted and penalized.</span>
            </div>
          </div>
          {onClearAntiCheatAlert && (
            <button
              onClick={onClearAntiCheatAlert}
              className="text-xs text-rose-400 hover:text-white px-2 py-1 rounded bg-rose-900/50 cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Solver Alert Banner if cracked */}
      {ctfState.firstSolverName && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>🚩 FIRST BLOOD! {ctfState.firstSolverName} cracked the flag! Advancing to next riddle...</span>
        </div>
      )}

      {/* Main Riddle Terminal Card */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-b ${getCategoryColor(challenge.category)} border shadow-2xl space-y-4`}>
        
        {/* Category & Points Pill */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-slate-950/80 border border-white/10">
            {challenge.category}
          </span>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            +{challenge.points} POINTS
          </span>
        </div>

        {/* Riddle Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {challenge.title}
        </h2>

        {/* Narrative Riddle Story */}
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
          {challenge.story}
        </p>

        {/* The Cipher / Hex / Code Artifact Box */}
        <div className="relative mt-4">
          <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 font-mono text-sm sm:text-base text-cyan-300 shadow-inner whitespace-pre-wrap break-all leading-relaxed">
            {challenge.artifact}
          </div>
          <button
            onClick={handleCopyArtifact}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedArtifact ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedArtifact ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Hint Dropdown */}
        <div className="pt-2">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Need a clue? Reveal Challenge Hint</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2 animate-in fade-in">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Hint: </strong>
                {challenge.hint}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Flag Submission Bar */}
      <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-rose-400" /> Submit Decrypted Flag or Answer
          </span>
          <span className="text-[11px] text-slate-500">
            Case-insensitive · e.g. CTF&#123;...&#125; or raw text
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="Type flag or solution here..."
            className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none placeholder:text-slate-600 shadow-inner"
            autoFocus
          />

          <button
            type="submit"
            disabled={!flagInput.trim()}
            className="px-6 py-3 rounded-xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 disabled:opacity-40 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 text-sm shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT</span>
          </button>
        </div>
      </form>

      {/* Built-in Cyber Toolkit Decoder */}
      <CyberToolkit
        onInsertFlag={(text) => setFlagInput(text)}
        activeArtifact={challenge.artifact}
      />

      {/* Team Roster / Status Footer */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 font-bold">Team Red:</span>
            {redPlayers.map(p => (
              <span key={p.id} className="text-slate-300" title={`${p.name} (${p.score} pts)`}>
                {p.avatar} {p.name}
              </span>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-blue-400 font-bold">Team Blue:</span>
            {bluePlayers.map(p => (
              <span key={p.id} className="text-slate-300" title={`${p.name} (${p.score} pts)`}>
                {p.avatar} {p.name}
              </span>
            ))}
          </div>
        </div>

        {isHost && onSkipChallenge && (
          <button
            onClick={onSkipChallenge}
            className="text-[11px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
          >
            Skip Riddle →
          </button>
        )}
      </div>

      {/* Anti-Cheat Revert Modal */}
      {showAntiCheatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 sm:p-7 text-center shadow-2xl shadow-rose-950/60 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                Fair Play Enforcement System
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Anti-Cheat Revert Triggered!
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 text-left space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Detection: {violationReason}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                To prevent looking up riddle answers in another browser tab, your active challenge input has been cleared, hint status reverted, and a -200 point penalty registered.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowAntiCheatModal(false)}
                className="w-full py-3 rounded-xl font-black bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/25 transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>I Understand · Return to CTF Terminal</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
