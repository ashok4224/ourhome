import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Paperclip, Sparkles, Building2, User, HelpCircle, 
  FileText, Image as ImageIcon, CheckCircle2, ChevronRight, Clock
} from 'lucide-react';
import { ChatMessage, TypingState } from '../types';

interface LiveChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: 'customer' | 'builder';
  currentUserName: string;
  propertyId: string;
  propertyTitle: string;
  messages: ChatMessage[];
  typingStates: TypingState[];
  onSendMessage: (text: string, attachment?: { name: string; type: 'image' | 'document'; url: string }) => void;
  onSendTyping: (isTyping: boolean) => void;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  currentUserName,
  propertyId,
  propertyTitle,
  messages,
  typingStates,
  onSendMessage,
  onSendTyping,
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter messages for this specific property
  const chatHistory = messages.filter((m) => m.propertyId === propertyId);

  // Check if foreign role is typing (customer sees if builder is typing, builder sees if customer is typing)
  const foreignRole = currentUserRole === 'customer' ? 'builder' : 'customer';
  const isTypingActive = typingStates.some(
    (t) => t.propertyId === propertyId && t.role === foreignRole && t.isTyping
  );

  // Scroll to bottom when history or typing states update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTypingActive]);

  // Handle keys & typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    
    // Broadcast typing triggers
    onSendTyping(true);

    // Debounce typing status clear
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onSendTyping(false);
    }, 2500);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText);
    setInputText('');
    onSendTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleAttachPreset = (name: string, type: 'image' | 'document', url: string) => {
    onSendMessage(`Sent document: ${name}`, { name, type, url });
    setShowAttachmentMenu(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dynamic Slideout Panel */}
      <div 
        id="live-chat-panel"
        className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl animate-slide-in-right text-slate-850"
      >
        {/* Chat Panel Header */}
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${currentUserRole === 'customer' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  Real-time Secure Room
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              </div>
              <h4 className="font-display font-bold text-sm text-slate-100 truncate">
                {propertyTitle}
              </h4>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity HUD */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/65 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Active Role: <strong className="text-slate-800 tracking-wider uppercase">{currentUserRole}</strong>
          </span>
          <span className="truncate max-w-[180px]">
            User: {currentUserName}
          </span>
        </div>

        {/* Message Thread Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
              <div className="max-w-[240px] space-y-1">
                <p className="font-display font-semibold text-xs text-slate-800">No Messages Yet</p>
                <p className="text-[10px] text-slate-400 leading-normal font-mono">
                  All messages typed here transmit securely over active HTTP stream links directly without refreshing.
                </p>
              </div>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isMe = msg.sender === currentUserRole;
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {/* Sender metadata info label */}
                  <span className="text-[9px] font-mono text-slate-400 tracking-wide px-1.5 flex items-center gap-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Message Bubble container */}
                  <div className={`max-w-[85%] rounded-2xl py-2 px-3 text-xs shadow-xs border ${
                    isMe 
                      ? currentUserRole === 'customer'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white border-slate-200 text-slate-850'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    
                    {/* Attachment preview banner */}
                    {msg.attachment && (
                      <div className={`mt-2 p-2 rounded-lg border flex items-center gap-2 ${
                        isMe ? 'bg-black/15 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        {msg.attachment.type === 'document' ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono truncate font-semibold leading-tight">
                            {msg.attachment.name}
                          </p>
                          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block mt-0.5">
                            SECURE ATTACHMENT
                          </span>
                        </div>
                        <a 
                          href={msg.attachment.url}
                          target="_blank" 
                          rel="noreferrer"
                          className={`text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded-sm border ${
                            isMe 
                              ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' 
                              : 'bg-slate-200 hover:bg-slate-350 border-slate-300 text-slate-700'
                          }`}
                        >
                          OPEN
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Active Indicator bar */}
          {isTypingActive && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 italic bg-white/70 border border-slate-200/50 py-1.5 px-3 rounded-xl max-w-max animate-pulse">
              <span className="flex space-x-1 shrink-0">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span>{foreignRole === 'builder' ? 'Arjun' : 'Customer'} is typing real-time answers...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Preset Attachment Menu Overlay Drawer */}
        {showAttachmentMenu && (
          <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-2 animate-scale-in">
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              🛠️ Share Estate Certifications &amp; Blueprints
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleAttachPreset('TS-RERA approved Blueprint.pdf', 'document', '#')}
                className="p-2 bg-white hover:bg-slate-100 border rounded-xl text-left text-[10px] flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>RERA Blueprint Plan</span>
              </button>
              <button
                type="button"
                onClick={() => handleAttachPreset('Site Soil Valuation Report.pdf', 'document', '#')}
                className="p-2 bg-white hover:bg-slate-100 border rounded-xl text-left text-[10px] flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Soil Appraisal Doc</span>
              </button>
              <button
                type="button"
                onClick={() => handleAttachPreset('Penthouse Italian Marble Mockup.jpg', 'image', '#')}
                className="p-2 bg-white hover:bg-slate-100 border rounded-xl text-left text-[10px] flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Marble Mockup</span>
              </button>
              <button
                type="button"
                onClick={() => handleAttachPreset('Approved Deed Certificate.pdf', 'document', '#')}
                className="p-2 bg-white hover:bg-slate-100 border rounded-xl text-left text-[10px] flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Legal Deed copy</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Form container */}
        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
          <form onSubmit={handleSendText} className="flex gap-2 items-end">
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className={`p-2.5 rounded-xl border transition-all ${
                showAttachmentMenu 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-550 hover:text-slate-900'
              } cursor-pointer shrink-0`}
              title="Attach legal document specs"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText(e);
                }
              }}
              placeholder="Type secure real-time message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-900 placeholder-slate-400 resize-none max-h-20"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl text-white transition-all shrink-0 cursor-pointer ${
                inputText.trim() 
                  ? currentUserRole === 'customer' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-1.5 px-0.5">
            <span>🔐 Cryptographically Signed room session</span>
            <span>Estates Live Link™</span>
          </div>
        </div>
      </div>
    </>
  );
};
