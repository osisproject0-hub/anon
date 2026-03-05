import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { Loader2, Users, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [interest, setInterest] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const { startMatchmaking, isSearching, matchError } = useMatchmaking();
  const navigate = useNavigate();

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interest.trim()) {
      if (!interests.includes(interest.trim())) {
        setInterests([...interests, interest.trim()]);
      }
      setInterest('');
    }
  };

  const removeInterest = (tag: string) => {
    setInterests(interests.filter((i) => i !== tag));
  };

  const handleStartChat = async () => {
    await startMatchmaking(interests);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            AnonChat
          </h1>
          <p className="text-xl text-gray-400">
            Talk to strangers, make friends, stay anonymous.
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block text-left">
              Interests (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-blue-500/30"
                >
                  {tag}
                  <button
                    onClick={() => removeInterest(tag)}
                    className="hover:text-white ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Type interest and press Enter (e.g. anime, coding)"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              onKeyDown={handleAddInterest}
              className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:ring-blue-500"
            />
          </div>

          <Button
            size="lg"
            className="w-full text-lg h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-900/20"
            onClick={handleStartChat}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding a partner...
              </>
            ) : (
              'Start Chatting'
            )}
          </Button>

          {matchError && (
            <p className="text-red-400 text-sm">{matchError}</p>
          )}

          <div className="pt-6 grid grid-cols-3 gap-4 text-center text-sm text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gray-700/30 rounded-full">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <span>10k+ Online</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gray-700/30 rounded-full">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <span>Fully Anonymous</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gray-700/30 rounded-full">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <span>Fast Matching</span>
            </div>
          </div>
        </div>
        
        <footer className="text-gray-600 text-sm">
          &copy; 2024 AnonChat. Safe & Secure.
        </footer>
      </div>
    </div>
  );
}
