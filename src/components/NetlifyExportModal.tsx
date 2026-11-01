import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Cloud, Sparkles, FolderArchive, Download } from 'lucide-react';

interface NetlifyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetlifyExportModal: React.FC<NetlifyExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNetlifyToml = () => {
    const tomlContent = `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
    const blob = new Blob([tomlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'netlify.toml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Live Multiplayer & Netlify Ready</h2>
            <p className="text-xs sm:text-sm text-slate-400">Share with anyone across devices instantly</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Option 1: Instant Live URL */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Instant Live Web URL
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                Active & Running
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              This app is already hosted and accessible to anyone right now! Send this link to friends or open it on other phones:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 select-all"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Option 2: Netlify Drop instructions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-cyan-400" />
              Netlify Drag & Drop Deployment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              To deploy using Netlify Drop (<a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">app.netlify.com/drop <ExternalLink className="w-3 h-3" /></a>):
            </p>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1 mb-4">
              <li>Build the production package (<code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded">npm run build</code>)</li>
              <li>Include configuration <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded">netlify.toml</code></li>
              <li>Drag & drop the build folder directly to Netlify Drop for instant worldwide hosting.</li>
            </ol>

            <button
              onClick={handleDownloadNetlifyToml}
              className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Download Netlify Configuration (netlify.toml)
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
