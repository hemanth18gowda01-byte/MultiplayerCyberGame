import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, Download, Wifi, WifiOff } from 'lucide-react';
import { sounds } from '../utils/sound';

interface NavbarProps {
  connected: boolean;
  onOpenRules: () => void;
  onOpenExport: () => void;
  roomCode?: string;
  onLeaveRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  connected,
  onOpenRules,
  onOpenExport,
  roomCode,
  onLeaveRoom
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 shadow-md shadow-cyan-500/20">
            <span className="text-xl select-none">🛡️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                CYBER CTF CLASH
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Live CTF Battle
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Crypto · Cyber · Math · Digital Forensics Riddle Race
            </p>
          </div>
        </div>

        {/* Room badge & controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection status indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800">
            {connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-[11px] font-medium hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 text-[11px] font-medium">Connecting...</span>
              </>
            )}
          </div>

          {roomCode && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
              <span className="text-xs text-amber-300/80 font-medium hidden sm:inline">Room:</span>
              <span className="font-mono font-bold text-amber-400 tracking-wider text-sm">{roomCode}</span>
              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  className="ml-1 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded bg-slate-900 hover:bg-rose-950/40"
                  title="Leave Room"
                >
                  Exit
                </button>
              )}
            </div>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Rules button */}
          <button
            onClick={onOpenRules}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-medium"
            title="Game Rules"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Netlify / Share Package button */}
          <button
            onClick={onOpenExport}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold shadow-sm"
            title="Download Netlify Drop Package"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Netlify Ready</span>
          </button>
        </div>
      </div>
    </header>
  );
};
