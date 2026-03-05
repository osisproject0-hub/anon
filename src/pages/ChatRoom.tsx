import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MoreVertical, SkipForward } from 'lucide-react';
import { useMatchmaking } from '../hooks/useMatchmaking';

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { messages, sendMessage, loading, dummy, leaveRoom } = useChat(roomId || '');
  const { startMatchmaking, isSearching } = useMatchmaking();

  const handleNext = async () => {
    await leaveRoom();
    await startMatchmaking(); // This might need to be adjusted to handle navigation
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Anonymous Stranger</h2>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleNext}
            disabled={isSearching}
            className="hidden md:flex"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Next Partner
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4 max-w-3xl mx-auto">
            <div className="text-center text-xs text-gray-400 my-4">
                You are now connected with a random stranger. Say hi!
            </div>
            {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={dummy} />
        </div>
      </main>

      {/* Input Area */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}
