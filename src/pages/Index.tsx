import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowRight, Sparkles, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRoomStore } from '@/lib/roomStore';
import { toast } from 'sonner';
import { ensureCsrfToken, getApiBase, getCookie } from '@/network';

type AuthUser = {
  displayName: string;
  email: string;
  picture?: string;
};

const Index = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useRoomStore();

  useEffect(() => {
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (user?.displayName || user?.email) {
      setPlayerName(user.displayName ?? user.email.split('@')[0]);
    }
  }, [user]);



  const checkUserStatus = async () => {
    try {
      const apiUrl = getApiBase();
      const res = await fetch(`${apiUrl}/api/auth/me`, {
        method: 'GET',
        credentials: "include",
      });
      
      if(res.status === 401) {
        console.log('Not authenticated, (401');
        setUser(null);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Auth check failed:', res.status, errorText);
        setUser(null);
        return;
      }

      const userData = await res.json();
      console.log('User authenticated:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user status:', error);
      setUser(null);
    }
  };

  const handleCreate = async () => {
    const loggedIn = await checkLogin();
    if (!loggedIn) return;

    if (!playerName.trim()) {
     toast.error('Please enter your name');
     return;
    }

    try {
      const apiUrl = getApiBase();
      await ensureCsrfToken();
      const csrfToken = getCookie('XSRF-TOKEN');

      const res = await fetch(`${apiUrl}/api/rooms/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Create room failed: ${res.status}`);
      }

      const roomId = await res.text();
      createRoom(roomId, playerName.trim());
      toast.success(`Room ${roomId} created!`);
      navigate('/host');
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  const checkLogin = async () => {
    try {
      const apiUrl = getApiBase();

      const res = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: "include", 
      });

      if (res.status === 401) {
        toast.error('Please login to continue');
        handleLogin(); // OAuth2 redirect
        return false;
      }

      return res.ok;
    } catch (error) {
      console.error('Login check failed:', error);
      toast.error('Failed to verify login status');
      return false;
    }
  };

  const handleJoin = async() => {
    const loggedIn = await checkLogin();
    if (!loggedIn) return;

    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (roomCode.length !== 6) {
      toast.error('Please enter a valid 6-digit room code');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await ensureCsrfToken();
      const csrfToken = getCookie('XSRF-TOKEN');

      const res = await fetch(`${apiUrl}/api/rooms/${roomCode}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Join room failed: ${res.status}`);
      }

      joinRoom(roomCode, playerName.trim());
      toast.success('Joined room successfully!');
      navigate('/play');
    } catch (error) {
      toast.error('Failed to join room');
    }
  };

  const handleLogin = () => {
    const apiUrl = getApiBase();
    window.location.href = `${apiUrl}/oauth2/authorization/google`;
  };

  const handleLogout = async () => {
    try {
      const apiUrl = getApiBase();
      await ensureCsrfToken();
      const res = await fetch(`${apiUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(getCookie('XSRF-TOKEN') && {
            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
          }),
        },
      });
      if(!res.ok){
        const errorText = await res.text();
        console.error('Logout failed:', res.status, errorText);
        throw new Error('Logout failed');
      }
      setUser(null);
      toast.success('Logged out successfully');

    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Profile Icon - Login/User Dropdown */}
      <div className="absolute top-6 right-6 z-20">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:scale-105">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.picture || ""} alt={user.displayName} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {user.displayName?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56"> 
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
              onClick={handleLogin}
              className="flex items-center text-white gap-3 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </Button>
        )}
      </div>

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
          <p className="text-muted-foreground">Real-time Quizzes</p>
        </div>


        {mode === 'initial' && (
          <div className="space-y-4 animate-fade-in">
            <Button
              variant="hero"
              className="w-full"
              onClick={() => user ? setMode('create') : handleLogin()}
            >
              <Plus className="w-5 h-5" />
              Create a Room
            </Button>
            
            <Button
              variant="glass"
              size="xl"
              className="w-full"
              onClick={() => user ? setMode('join') : handleLogin()}
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
