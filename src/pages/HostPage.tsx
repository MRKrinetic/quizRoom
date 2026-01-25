import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoomHeader } from '@/components/RoomHeader';
import { Leaderboard } from '@/components/Leaderboard';
import { ChatInterface } from '@/components/ChatInterface';
import { useRoomStore } from '@/lib/roomStore';
import { toast } from 'sonner';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ensureCsrfToken, getApiBase, getCookie } from '@/network';

const HostPage = () => {
  const [activeTab, setActiveTab] = useState('question');
  const { roomId, currentQuestion, isHost, setCurrentQuestion, setLeaderboard } = useRoomStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId || !isHost) {
      navigate('/');
    }
  }, [roomId, isHost, navigate]);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!roomId) return;
      const apiUrl = getApiBase();

      const authRes = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: 'include',
      });

      if (authRes.status === 401) {
        toast.error('Please login to continue');
        navigate('/');
        return;
      }

      const hostRes = await fetch(`${apiUrl}/api/rooms/${roomId}/validate-host`, {
        credentials: 'include',
      });

      if (!hostRes.ok) {
        toast.error('Not authorized to host this room');
        navigate('/');
      }
    };

    verifyAccess();
  }, [roomId, navigate]);

  useEffect(() => {
    if (!roomId) return;

    const apiUrl = getApiBase();

    fetch(`${apiUrl}/api/rooms/${roomId}/players`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load players');
        return res.json();
      })
      .then((players) => {
        players.forEach((player) => {
          useRoomStore.getState().addPlayer(player);
        });
      })
      .catch(() => {
        toast.error('Failed to load players');
      });
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const apiUrl = getApiBase();
    const socket = new SockJS(`${apiUrl}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const event = JSON.parse(message.body);

          if (event.type === 'PLAYER_JOINED') {
            useRoomStore.getState().addPlayer(event.payload);
          }

          if (event.type === 'QUESTION') {
            const payload = event.payload;
            const options = payload?.optionsJson
              ? JSON.parse(payload.optionsJson)
              : [];

            setCurrentQuestion({
              id: String(payload?.id ?? Date.now()),
              text: payload?.text ?? '',
              options,
            });
          }

          if (event.type === 'LEADERBOARD') {
            setLeaderboard(event.payload);
          }

          if (event.type === 'ROOM_ENDED') {
            toast.error('Room ended');
            navigate('/');
          }

          if (event.type === 'QUIZ_ENDED') {
            toast.success('Quiz ended');
          }
        } catch (err) {
          console.error('WS message error', err);
        }
      });
    };


    client.activate();
    return () => {
      client.deactivate();
    }
  }, [roomId, navigate, setCurrentQuestion, setLeaderboard]);

  const broadcastQuestion = async () => {
    if (!currentQuestion || !roomId) return;

    try {
      const apiUrl = getApiBase();
      await ensureCsrfToken();
      const csrfToken = getCookie('XSRF-TOKEN');
      const timeLimitSeconds = 30;
      const endTime = new Date(Date.now() + timeLimitSeconds * 1000).toISOString();
      const questionId = Number(currentQuestion.id) || Date.now();

      const res = await fetch(`${apiUrl}/api/rooms/${roomId}/quiz/question`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
        },
        body: JSON.stringify({
          id: questionId,
          type: 'MCQ',
          text: currentQuestion.text,
          optionsJson: JSON.stringify(currentQuestion.options),
          correctAnswer: currentQuestion.correctAnswerIndex !== undefined
            ? currentQuestion.options[currentQuestion.correctAnswerIndex]
            : '',
          points: 100,
          endTime,
          timeLimitSeconds,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Broadcast failed: ${res.status}`);
      }

      toast.success('Question sent to all players!');
    } catch (error) {
      toast.error('Failed to send question');
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
