'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import type { ChatMessage } from '@/types';

interface ChatModalProps {
  hotelId: string;
  roomId: string;
  guestName: string;
  onClose: () => void;
}

export default function ChatModal({ hotelId, roomId, guestName, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data as ChatMessage[]);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-chat-modal-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);

    const { error } = await supabase.from('chat_messages').insert({
      hotel_id: hotelId,
      room_id: roomId,
      sender_role: 'guest',
      sender_name: guestName,
      message: input.trim(),
    });

    if (!error) setInput('');
    setIsSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-20"
    >
      <motion.div
        initial={{ y: 40, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.95 }}
        className="tv-widget w-full max-w-4xl h-full flex flex-col bg-slate-900/60 border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-slate-900/40">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 text-2xl border border-teal-500/30">💬</div>
              <div className="flex flex-col">
                 <h2 className="text-white text-3xl font-bold tv-font-display">Concierge Chat</h2>
                 <p className="text-teal-400 text-xs font-black uppercase tracking-widest mt-1">Direct Line to Front Office</p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="tv-focusable px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10"
             data-focusable="true"
             autoFocus
           >
             Close [esc]
           </button>
        </div>

        {/* Messages List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-6 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 text-center">
               <span className="text-6xl mb-4">💬</span>
               <p className="text-xl font-bold font-display italic">No messages yet...</p>
               <p className="text-sm">Start a conversation with our staff.</p>
            </div>
          ) : messages.map((msg) => {
            const isGuest = msg.sender_role === 'guest';
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isGuest ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[70%] p-5 rounded-3xl text-lg ${
                  isGuest 
                    ? 'bg-teal-500 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-white/90 border border-white/5 rounded-tl-none shadow-xl'
                }`}>
                  {msg.message}
                </div>
                <span className="mt-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  {isGuest ? 'You' : (msg.sender_name || 'Staff')} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Input Area */}
        <div className="p-8 border-t border-white/10 bg-slate-900/40 flex items-center gap-4">
           <div className="flex-1 relative">
              <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                 placeholder="Type your message..."
                 className="tv-focusable w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white text-xl placeholder:text-white/20 outline-none"
                 data-focusable="true"
              />
              <p className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 text-xs font-bold uppercase tracking-widest">Select to Type</p>
           </div>
           <button 
             onClick={sendMessage}
             disabled={!input.trim() || isSending}
             className="tv-focusable h-[68px] px-10 rounded-2xl bg-teal-500 text-white font-black uppercase tracking-widest disabled:opacity-50"
             data-focusable="true"
           >
             {isSending ? '...' : 'Send'}
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
