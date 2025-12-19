import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/lib/roomStore';
import { toast } from 'sonner';

const Index = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useRoomStore();

  const handleCreate = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    const roomId = createRoom(playerName.trim());
    toast.success(`Room ${roomId} created!`);
    navigate('/host');
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (roomCode.length !== 6) {
      toast.error('Please enter a valid 6-digit room code');
      return;
    }
    joinRoom(roomCode, playerName.trim());
    toast.success('Joined room successfully!');
    navigate('/play');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">QuizRoom</span>
          </h1>
          <p className="text-muted-foreground">Real-time AI-powered quizzes</p>
        </div>

        {mode === 'initial' && (
          <div className="space-y-4 animate-fade-in">
            <Button
              variant="hero"
              className="w-full"
              onClick={() => setMode('create')}
            >
              <Plus className="w-5 h-5" />
              Create a Room
            </Button>
            
            <Button
              variant="glass"
              size="xl"
              className="w-full"
              onClick={() => setMode('join')}
            >
              <Users className="w-5 h-5" />
              Join a Room
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Create New Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
                
                <Button onClick={handleCreate} className="w-full" size="lg">
                  Create Room
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <button
              onClick={() => setMode('initial')}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Join Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Room Code</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full h-14 px-4 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <Button onClick={handleJoin} className="w-full" size="lg">
                  Join Room
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <button
              onClick={() => setMode('initial')}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
