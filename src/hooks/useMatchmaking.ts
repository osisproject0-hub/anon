import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, serverTimestamp, getDocs, limit, Unsubscribe } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useMatchmaking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const queueDocRef = useRef<string | null>(null);

  const cleanup = async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (queueDocRef.current) {
      try {
        await deleteDoc(doc(db, 'queue', queueDocRef.current));
      } catch (e) {
        console.error("Error cleaning up queue doc:", e);
      }
      queueDocRef.current = null;
    }
    setIsSearching(false);
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startMatchmaking = async (interests: string[] = []) => {
    if (!user) return;
    
    // Cleanup any existing search
    await cleanup();
    
    setIsSearching(true);
    setMatchError(null);

    try {
      // 1. Check if there is anyone in the queue
      const queueRef = collection(db, 'queue');
      const q = query(
        queueRef,
        where('userId', '!=', user.uid),
        limit(1)
      );
      
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Found a match!
        const match = snapshot.docs[0];
        const partnerId = match.data().userId;
        
        // Optimistic locking or transaction would be better here, but for simplicity:
        // Try to delete the match from queue to "claim" it
        try {
            await deleteDoc(doc(db, 'queue', match.id));
        } catch (e) {
            // Someone else took it, retry
            return startMatchmaking(interests);
        }

        // Create a chat room
        const roomRef = await addDoc(collection(db, 'chat_rooms'), {
          participants: [user.uid, partnerId],
          createdAt: serverTimestamp(),
          active: true,
          type: '1v1',
          interests: interests
        });

        setIsSearching(false);
        navigate(`/chat/${roomRef.id}`);
      } else {
        // No match found, add self to queue
        const docRef = await addDoc(queueRef, {
          userId: user.uid,
          createdAt: serverTimestamp(),
          interests
        });
        queueDocRef.current = docRef.id;

        // Listen for a match
        const unsubscribe = onSnapshot(collection(db, 'chat_rooms'), (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const room = change.doc.data();
              if (room.participants && room.participants.includes(user.uid)) {
                // We were matched!
                cleanup(); // Remove from queue and stop listening
                navigate(`/chat/${change.doc.id}`);
              }
            }
          });
        });
        unsubscribeRef.current = unsubscribe;
      }
    } catch (err) {
      console.error("Matchmaking error:", err);
      setMatchError("Failed to find a match.");
      setIsSearching(false);
      cleanup();
    }
  };

  return { startMatchmaking, cancelMatchmaking: cleanup, isSearching, matchError };
};

