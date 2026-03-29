'use client';

import { useState, useEffect, useRef, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRoom {
  room_id: string;
  room_code: string;
  guest_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_type: 'guest' | 'staff';
  message: string;
  created_at: string;
}

export default function StaffChatPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = use(params);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchRooms();
    const channel = supabase
      .channel('staff_chat_rooms')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      fetchMessages(selectedRoomId);
      const msgChannel = supabase
        .channel(`room_${selectedRoomId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoomId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      return () => { supabase.removeChannel(msgChannel); };
    }
  }, [selectedRoomId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchRooms = async () => {
    // This would typically be a view or a complex query joining rooms and latest messages
    const { data } = await supabase
      .from('rooms')
      .select('id, room_code, guest_name')
      .not('guest_name', 'is', null)
      .order('room_code');
    
    if (data) {
      // For demo purposes, we map them. In production, we'd join with chat_messages
      setRooms(data.map(r => ({
        room_id: r.id,
        room_code: r.room_code,
        guest_name: r.guest_name || 'Guest',
        last_message: 'Waiting for response...',
        last_message_at: new Date().toISOString(),
        unread_count: 0
      })));
    }
    setIsLoading(false);
  };

  const fetchMessages = async (roomId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data as Message[]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoomId) return;

    const { data: userData } = await supabase.auth.getUser();
    const hotelId = userData.user?.user_metadata?.hotel_id;

    const { error } = await supabase.from('chat_messages').insert({
      room_id: selectedRoomId,
      hotel_id: hotelId,
      message: newMessage,
      sender_type: 'staff',
      sender_name: userData.user?.user_metadata?.name || 'Staff'
    });

    if (!error) setNewMessage('');
  };

  const selectedRoom = rooms.find(r => r.room_id === selectedRoomId);

  return (
    <div className="flex h-[calc(100vh-80px)] font-staff bg-white">
      {/* Sidebar / Room List */}
      <div className="w-[380px] border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Guest Chat</h2>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Active Conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
             <div className="flex flex-col gap-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
             </div>
          ) : rooms.map((room) => (
            <button
              key={room.room_id}
              onClick={() => setSelectedRoomId(room.room_id)}
              className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center gap-4 ${
                selectedRoomId === room.room_id 
                  ? 'bg-white border-teal-500 shadow-lg shadow-teal-500/5' 
                  : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border ${selectedRoomId === room.room_id ? 'bg-teal-500 text-white border-teal-400' : 'bg-white text-slate-400 border-slate-200'}`}>
                {room.room_code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                   <p className={`font-bold text-sm truncate ${selectedRoomId === room.room_id ? 'text-slate-900' : 'text-slate-600'}`}>
                     {room.guest_name}
                   </p>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                     {new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                <p className="text-xs text-slate-400 truncate font-medium">{room.last_message}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-white">
        {selectedRoomId ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                    {selectedRoom?.room_code}
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 leading-none mb-1.5">{selectedRoom?.guest_name}</h3>
                    <div className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Session</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">👤</button>
                 <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">⚙️</button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/20"
            >
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'staff' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-3xl shadow-sm border ${
                      msg.sender_type === 'staff'
                        ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none'
                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed font-medium">{msg.message}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${msg.sender_type === 'staff' ? 'text-slate-400' : 'text-slate-300'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="bg-slate-50 rounded-[32px] p-2 flex items-center gap-3 border border-slate-100 focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all">
                 <input
                   type="text"
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                   placeholder="Type a message to the guest..."
                   className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-medium py-3"
                 />
                 <button 
                   onClick={sendMessage}
                   className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
                 >
                   ➔
                 </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
             <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center text-6xl mb-8 border border-slate-100">💬</div>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select a Chat</h3>
             <p className="text-slate-400 text-sm max-w-xs mt-3 font-medium">Choose a guest room from the left to start communicating in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
