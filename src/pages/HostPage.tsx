import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoomHeader } from '@/components/RoomHeader';
import { Leaderboard } from '@/components/Leaderboard';
import { ChatInterface } from '@/components/ChatInterface';
import { useRoomStore } from '@/lib/roomStore';
import { toast } from 'sonner';

const HostPage = () => {
  const [activeTab, setActiveTab] = useState('question');
  const { roomId, currentQuestion, isHost } = useRoomStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId || !isHost) {
      navigate('/');
    }
  }, [roomId, isHost, navigate]);

  const broadcastQuestion = () => {
    if (currentQuestion) {
      toast.success('Question sent to all players!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <RoomHeader showNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat History */}
        <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-sidebar">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm text-muted-foreground">New Chat</h3>
          </div>
          <div className="flex-1 p-2">
            {/* Chat history items would go here */}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface />
          
          {/* Send to Players Button */}
          {currentQuestion && (
            <div className="p-4 border-t border-border">
              <Button onClick={broadcastQuestion} className="w-full" size="lg">
                <Send className="w-5 h-5" />
                Send to Players
              </Button>
            </div>
          )}
        </main>

        {/* Right Sidebar - Leaderboard */}
        <aside className="hidden xl:flex w-72 border-l border-border flex-col bg-sidebar">
          <Leaderboard />
        </aside>
      </div>
    </div>
  );
};

export default HostPage;
