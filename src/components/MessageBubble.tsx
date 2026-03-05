import React from 'react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Message } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isMe = message.senderId === user?.uid;
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full mb-4", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
          isMe
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-gray-900 rounded-bl-none dark:bg-gray-700 dark:text-white"
        )}
      >
        {message.type === 'image' && message.fileUrl ? (
            <img src={message.fileUrl} alt="Shared image" className="rounded-lg max-w-full mb-2" />
        ) : (
            <p className="text-sm md:text-base break-words">{message.text}</p>
        )}
        <div className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-blue-100" : "text-gray-500 dark:text-gray-300")}>
          {message.createdAt?.toDate ? format(message.createdAt.toDate(), 'HH:mm') : 'Sending...'}
        </div>
      </div>
    </div>
  );
};
