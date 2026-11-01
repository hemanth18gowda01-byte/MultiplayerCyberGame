import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ReactionEvent } from '../types/game';
import { MessageSquare, Send, X, Smile, Flame } from 'lucide-react';

interface ChatAndReactionsProps {
  chatMessages: ChatMessage[];
  floatingReactions: Array<{ id: string; emoji: string; playerName: string }>;
  onSendChat: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  myPlayerId: string | null;
}

export const ChatAndReactions: React.FC<ChatAndReactionsProps> = ({
  chatMessages,
  floatingReactions,
  onSendChat,
  onSendReaction,
  myPlayerId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const quickEmojis = ['🎉', '😂', '🔥', '💀', '👀', '👏', '❤️', '😱'];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendChat(inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* Floating Reactions on Screen */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map(r => (
          <div
            key={r.id}
            className="absolute bottom-20 right-6 sm:right-12 animate-float text-4xl select-none flex items-center gap-2 drop-shadow-lg"
            style={{
              animation: 'floatBob 2.5s ease-out forwards',
              transform: `translate(${Math.random() * 40 - 20}px, 0)`
            }}
          >
            <span>{r.emoji}</span>
            <span className="text-[10px] bg-slate-900/90 text-white font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow-sm">
              {r.playerName}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Reaction Dock (always available bottom-left or bottom-center) */}
      <div className="fixed bottom-3 left-4 z-40 hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <span className="text-[10px] uppercase font-bold text-slate-500 px-1">Buzz</span>
        {quickEmojis.slice(0, 5).map(emoji => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 hover:scale-125 active:scale-95 transition-all text-base flex items-center justify-center cursor-pointer border border-slate-800 shadow-sm"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-4 right-4 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold flex items-center gap-2"
            aria-label="Open Chat"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span className="text-xs font-black hidden sm:inline">Party Chat</span>
            {chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-slate-950">
                {chatMessages.length > 9 ? '9+' : chatMessages.length}
              </span>
            )}
          </button>
        ) : (
          /* Chat Window */
          <div className="w-[320px] sm:w-[360px] h-[440px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-white">Party Chat</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick emoji reaction bar inside chat */}
            <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSendReaction(emoji)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-800 hover:scale-110 text-sm flex items-center justify-center cursor-pointer transition-all shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-8">
                  No messages yet. Say hi to the party!
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.playerId === myPlayerId;
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="text-center py-1">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-amber-300 inline-block font-medium">
                          {msg.avatar} {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <span>{msg.avatar}</span>
                        <span className="font-semibold">{msg.playerName}</span>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words leading-relaxed ${
                          isMe
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                maxLength={100}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Send chat message..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
