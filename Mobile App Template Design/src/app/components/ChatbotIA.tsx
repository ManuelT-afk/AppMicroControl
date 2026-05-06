import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Zap, User, Bot, Sparkles } from 'lucide-react';
import { chatearConAntigravity } from '@/services/antigravity';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
};

export default function ChatbotIA() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: '¡Hola! Soy Antigravity, tu asistente financiero. ¿En qué puedo ayudarte hoy? Puedo darte tips de ahorro o explicarte cómo funciona la app. 🚀',
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Preparar historial para Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatearConAntigravity(input, history);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[300] w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/40 flex items-center justify-center border border-white/20"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-[300] w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Antigravity IA</h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium">En línea para ayudarte</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide no-scrollbar"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-slate-800 text-slate-400' : 'bg-purple-600/20 text-purple-400'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700/50 flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" />
                      <div className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-800">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu duda o pide un tip..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-4 pl-4 pr-14 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
