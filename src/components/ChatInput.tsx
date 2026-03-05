import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from './ui/Button';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface ChatInputProps {
  onSendMessage: (text: string, type: 'text' | 'image', fileUrl?: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, 'text');
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `chat_images/${uuidv4()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onSendMessage('Image', 'image', url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 border-t bg-white dark:bg-gray-800 relative">
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-20 left-4 z-10">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2 h-10 w-10"
          onClick={() => setShowEmoji(!showEmoji)}
          disabled={disabled}
        >
          <Smile className="h-5 w-5 text-gray-500" />
        </Button>
        
        <div className="relative">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
            <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-2 h-10 w-10"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            >
            <ImageIcon className="h-5 w-5 text-gray-500" />
            </Button>
        </div>

        <div className="flex-1 relative">
          <TextareaAutosize
            minRows={1}
            maxRows={4}
            placeholder="Type a message..."
            className="w-full resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          className="rounded-full h-10 w-10 p-0"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
