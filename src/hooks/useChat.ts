import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  type: 'text' | 'image' | 'system';
  fileUrl?: string;
}

export const useChat = (roomId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'chat_rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setLoading(false);
      dummy.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (text: string, type: 'text' | 'image' = 'text', fileUrl?: string) => {
    if (!user || !roomId) return;

    await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), {
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      type,
      fileUrl: fileUrl || null
    });
    
    // Update last message in room
    await updateDoc(doc(db, 'chat_rooms', roomId), {
        lastMessage: text,
        lastMessageTime: serverTimestamp()
    });
  };

  const leaveRoom = async () => {
      // Logic to leave room
      // Maybe notify other user
      if (!roomId || !user) return;
      await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), {
          text: 'User has left the chat.',
          senderId: 'system',
          createdAt: serverTimestamp(),
          type: 'system'
      });
  };

  return { messages, sendMessage, loading, dummy, leaveRoom };
};
