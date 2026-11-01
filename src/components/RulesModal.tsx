import React from 'react';
import { X, Key, Shield, Binary, Search, Trophy, Swords, Terminal, Bot } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">CTF Riddle Duel Rules</h2>
            <p className="text-xs sm:text-sm text-slate-400">Cryptography · Cybersecurity · Mathematics · Digital Forensics</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          
          {/* Game Modes */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Swords className="w-4 h-4 text-cyan-400" />
              Game Modes (With Friends or Bots)
            </h3>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li><strong className="text-cyan-300">Option 1 (1 v 1):</strong> Solo speed race against 1 friend or bot.</li>
              <li><strong className="text-blue-300">Option 2 (2 v 2):</strong> Team Red vs Team Blue (2 players per team).</li>
              <li><strong className="text-indigo-300">Option 3 (4 v 4):</strong> Full 8-player squad battle (4 Red vs 4 Blue).</li>
            </ul>
          </div>

          {/* Riddle Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <Key className="w-4 h-4" /> Cryptography
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Crack Caesar ciphers, Base64 strings, XOR keys, ROT13, hashes, and RSA public key math.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                <Shield className="w-4 h-4" /> Cybersecurity
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Spot SQL injections, default port protocols, XSS vectors, and NOP sled buffer overflows.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <Binary className="w-4 h-4" /> Mathematics
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Solve modular arithmetic, binary/hex conversions, prime totients, and Diffie-Hellman secrets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
                <Search className="w-4 h-4" /> Digital Forensics
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Inspect file magic bytes, EXIF steganography, Wireshark PCAP headers, and memory dumps.
              </p>
            </div>

          </div>

          {/* Level Progression */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30">
            <h3 className="font-bold text-cyan-300 text-sm mb-1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Beginner to Advanced Progression
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Challenges start at <strong>Beginner</strong>, advance to <strong>Intermediate</strong>, and conclude with the <strong>Advanced Boss Tier</strong>. Whoever cracks each flag first claims the speed bonus, and the first player or team to finish the tiers wins the CTF championship!
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer text-xs"
          >
            Ready to Hack!
          </button>
        </div>

      </div>
    </div>
  );
};
