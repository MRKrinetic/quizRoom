import { Trophy, Medal, Award } from 'lucide-react';
import { useRoomStore, Player } from '@/lib/roomStore';
import { cn } from '@/lib/utils';

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 1:
      return <Medal className="w-5 h-5 text-gray-300" />;
    case 2:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground text-sm">{index + 1}</span>;
  }
};

export const Leaderboard = () => {
  const { players } = useRoomStore();
  
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold gradient-text">Live Leaderboard</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sortedPlayers.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No players yet
          </p>
        ) : (
          sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 animate-fade-in",
                index === 0 ? "glass-strong border-primary/30" : "glass"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {getRankIcon(index)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{player.name}</p>
              </div>
              <div className="text-right">
                <span className={cn(
                  "font-bold tabular-nums",
                  index === 0 ? "text-primary" : "text-foreground"
                )}>
                  {player.score}
                </span>
                <span className="text-muted-foreground text-xs ml-1">pts</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
