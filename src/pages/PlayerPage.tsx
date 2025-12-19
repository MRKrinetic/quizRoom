import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomHeader } from '@/components/RoomHeader';
import { Leaderboard } from '@/components/Leaderboard';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { useRoomStore } from '@/lib/roomStore';

const PlayerPage = () => {
  const { roomId, isHost } = useRoomStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <RoomHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Leaderboard */}
        <aside className="hidden lg:flex w-72 border-r border-border flex-col bg-sidebar">
          <Leaderboard />
        </aside>

        {/* Main Content - Question Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <QuestionDisplay />
        </main>

        {/* Right Panel - Additional Info */}
        <aside className="hidden xl:flex w-80 border-l border-border flex-col bg-sidebar p-4">
          <div className="glass-strong rounded-xl p-4 mb-4">
            <h3 className="font-semibold mb-2">Game Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">0 / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correct</span>
                <span className="font-medium text-green-400">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streak</span>
                <span className="font-medium text-primary">0 🔥</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PlayerPage;
