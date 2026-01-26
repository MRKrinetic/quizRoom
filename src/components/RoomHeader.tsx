import { Copy, LogOut, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/lib/roomStore';
import { useNavigate } from 'react-router-dom';
import { getApiBase } from '@/network';
import { toast } from 'sonner';
import { ensureCsrfToken, getCookie } from '@/network';
import { Leaderboard } from './Leaderboard';
import { useState, useEffect } from 'react';

interface RoomHeaderProps {
  showNav?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const RoomHeader = ({ showNav, activeTab, onTabChange }: RoomHeaderProps) => {
  const { roomId, isHost, leaveRoom } = useRoomStore();
  const navigate = useNavigate();

  // ✅ Hooks INSIDE component
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // ✅ Close on ESC
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLeaderboardOpen(false);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    }
  };

  const handleLeave = async () => {
    try {
      await ensureCsrfToken();
      const csrfToken = getCookie('XSRF-TOKEN');

      if (isHost && roomId) {
        await fetch(`${getApiBase()}/api/rooms/${roomId}/end`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
          },
        });
      }

      leaveRoom();
      navigate('/');
    } catch {
      toast.error('Failed to leave room');
    }
  };

  return (
    <>
      {/* BACKDROP */}
      {isLeaderboardOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden"
          onClick={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-full w-72 bg-sidebar border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isLeaderboardOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-14 border-b border-border flex items-center justify-end px-4">
           <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLeaderboardOpen(false)}
            className="text-muted-foreground hover:text-destructive"
          >
           <PanelLeft className="w-5 h-5" />
          </Button>
        </div>
        <Leaderboard />
      </aside>

      {/* HEADER */}
      <header className="h-14 glass-strong border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLeaderboardOpen(v => !v)}
            className="text-muted-foreground hover:text-primary"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
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

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLeave}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>
    </>
  );
};
