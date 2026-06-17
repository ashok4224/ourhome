import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Paperclip, Sparkles, Building2, User, HelpCircle, 
  FileText, Image as ImageIcon, CheckCircle2, ChevronRight, Clock, Bot, MessageSquare, Eye
} from 'lucide-react';
import { ChatMessage, TypingState, Property } from '../types';

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
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
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
  properties,
  onSelectProperty,
}) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'ai'>('builder');
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI search states
  const [aiInputText, setAiInputText] = useState('');
  const [aiMessages, setAiMessages] = useState<any[]>([
    {
      id: 'ai-init',
      sender: 'ai',
      text: 'Hello! I am your Gemini-powered home-search companion. Tell me what type of home you are looking for (e.g. "3 BHK in Gachibowli under 2.5 Crore facing East"), and I will match you with vetted listings.',
      timestamp: Date.now(),
    }
  ]);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for this specific property
  const chatHistory = messages.filter((m) => m.propertyId === propertyId);

  // Check if foreign role is typing
  const foreignRole = currentUserRole === 'customer' ? 'builder' : 'customer';
  const isTypingActive = typingStates.some(
    (t) => t.propertyId === propertyId && t.role === foreignRole && t.isTyping
  );

  // Scroll to bottom when history or typing states update
  useEffect(() => {
    if (activeTab === 'builder') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTypingActive, aiMessages, activeTab]);

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

  const handleSendAiText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim() || aiIsLoading) return;

    const query = aiInputText;
    setAiInputText('');

    // Append user message
    const userMsg = {
      id: `ai-msg-${Math.random()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiIsLoading(true);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, properties }),
      });

      if (res.ok) {
        const data = await res.json();
        
        let rationaleText = "Here are the best matches I found matching your criteria:";
        if (!data.matches || data.matches.length === 0) {
          rationaleText = "Sorry, I couldn't find any listings that closely match your criteria. Try adjusting your location, price, or details.";
        }

        const matchedProps = (data.matches || []).map((m: any) => {
          const prop = properties.find((p) => p.id === m.id);
          if (prop) {
            return {
              ...prop,
              rationale: m.rationale
            };
          }
          return null;
        }).filter(Boolean);

        const aiMsg = {
          id: `ai-msg-${Math.random()}`,
          sender: 'ai',
          text: rationaleText,
          timestamp: Date.now(),
          matches: matchedProps,
        };
        setAiMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      console.error(err);
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-msg-${Math.random()}`,
          sender: 'ai',
          text: 'There was a connection error while trying to query the listings database. Please try again.',
          timestamp: Date.now(),
        }
      ]);
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleAttachPreset = (name: string, type: 'image' | 'document', url: string) => {
    onSendMessage(`Sent document: ${name}`, { name, type, url });
    setShowAttachmentMenu(false);
  };

  const formatPrice = (p: Property) => {
    if (p.rentOrBuy === 'Rent') {
      return `₹${p.price.toLocaleString('en-IN')}/mo`;
    } else {
      return `₹${(p.price / 10000000).toFixed(2)} Cr`;
    }
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
        className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl animate-slide-in-right text-slate-850"
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
                  {activeTab === 'builder' ? 'Real-time Secure Room' : 'AI Companion Console'}
                </span>
                {activeTab === 'builder' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                )}
              </div>
              <h4 className="font-display font-bold text-sm text-slate-100 truncate">
                {activeTab === 'builder' ? propertyTitle : 'Gemini Home Matcher'}
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

        {/* Tab Selection */}
        <div className="bg-slate-100 p-1 flex border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Direct Builder Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" /> AI Search Assistant 🤖
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

        {/* Dynamic Panels */}
        {activeTab === 'builder' ? (
          /* HUMAN BUILDER DIRECT CHAT PANEL */
          <>
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
                      <span className="text-[9px] font-mono text-slate-400 tracking-wide px-1.5 flex items-center gap-1">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className={`max-w-[85%] rounded-2xl py-2 px-3 text-xs shadow-xs border ${
                        isMe 
                          ? currentUserRole === 'customer'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-white border-slate-200 text-slate-850'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        
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
          </>
        ) : (
          /* CONVERSATIONAL AI SEARCH DRAWER PANEL */
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {aiMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {/* Sender Metadata */}
                  <span className="text-[9px] font-mono text-slate-400 tracking-wide px-1.5 flex items-center gap-1">
                    {msg.sender === 'user' ? 'You' : 'Gemini AI Assistant 🤖'}
                  </span>

                  {/* Chat bubble */}
                  <div className={`max-w-[90%] rounded-2xl py-2.5 px-3 text-xs shadow-xs border ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-white border-slate-250/70 text-slate-850'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    
                    {/* Render matching property cards if AI returned recommendations */}
                    {msg.matches && msg.matches.length > 0 && (
                      <div className="mt-3.5 space-y-2 pt-2.5 border-t border-slate-150">
                        <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Matched Listings:</p>
                        {msg.matches.map((p: any) => (
                          <div 
                            key={p.id}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex gap-2.5 hover:border-slate-350 transition-all text-slate-800"
                          >
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col justify-between">
                              <div>
                                <h5 className="font-display font-semibold text-[10px] truncate text-slate-900">{p.title}</h5>
                                <p className="text-[8px] font-mono text-slate-400 truncate">{p.location}</p>
                                <p className="text-[9px] font-mono text-slate-500 italic mt-0.5 line-clamp-1 leading-normal bg-slate-100 p-1 rounded-sm border border-slate-150">
                                  💡 {p.rationale}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] font-mono font-bold text-emerald-700">{formatPrice(p)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onSelectProperty) {
                                      onSelectProperty(p);
                                      onClose();
                                    }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[8px] py-1 px-2 rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
                                >
                                  <Eye className="w-2.5 h-2.5" /> Inspect
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* AI Typing Indicator */}
              {aiIsLoading && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 italic bg-white/70 border border-slate-200/50 py-1.5 px-3 rounded-xl max-w-max animate-pulse">
                  <span className="flex space-x-1 shrink-0">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span>Gemini is scanning property registry...</span>
                </div>
              )}
              <div ref={aiMessagesEndRef} />
            </div>

            {/* Input Form for AI Tab */}
            <div className="p-3 border-t border-slate-200 bg-white shrink-0">
              <form onSubmit={handleSendAiText} className="flex gap-2 items-end">
                <textarea
                  rows={1}
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAiText(e);
                    }
                  }}
                  placeholder="Ask AI: e.g. 3BHK flat in Jubilee Hills..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-900 placeholder-slate-400 resize-none max-h-20"
                />

                <button
                  type="submit"
                  disabled={!aiInputText.trim() || aiIsLoading}
                  className={`p-2.5 rounded-xl text-white transition-all shrink-0 cursor-pointer ${
                    aiInputText.trim() && !aiIsLoading
                      ? 'bg-emerald-650 hover:bg-emerald-500 shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-1.5 px-0.5">
                <span>🤖 Powered by Gemini 2.0 Flash</span>
                <span>OurHome Intelligence</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
