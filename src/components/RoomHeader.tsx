import { Copy, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/lib/roomStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface RoomHeaderProps {
  showNav?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const RoomHeader = ({ showNav, activeTab, onTabChange }: RoomHeaderProps) => {
  const { roomId, leaveRoom } = useRoomStore();
  const navigate = useNavigate();

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    }
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const tabs = ['leaderboard', 'question', 'dashboard'];

  return (
    <header className="h-14 glass-strong border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        
        {showNav && (
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={copyRoomId}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:border-primary/50 transition-all duration-200 group"
        >
          <span className="text-sm text-muted-foreground">Room:</span>
          <span className="font-mono font-bold text-primary">{roomId}</span>
          <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
        
        <Button variant="ghost" size="icon" onClick={handleLeave} className="text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
