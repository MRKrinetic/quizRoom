import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomHeader } from '@/components/RoomHeader';
import { Leaderboard } from '@/components/Leaderboard';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { useRoomStore } from '@/lib/roomStore';
import { getApiBase } from '@/network';
import { toast } from 'sonner';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const PlayerPage = () => {
  const roomId = useRoomStore((s) => s.roomId);
  const addPlayer = useRoomStore((s) => s.addPlayer);
  const setPlayers = useRoomStore((s) => s.setPlayers);
  const setCurrentQuestion = useRoomStore((s) => s.setCurrentQuestion);
  const setLeaderboard = useRoomStore((s) => s.setLeaderboard);
  const leaveRoom = useRoomStore((s) => s.leaveRoom);

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      toast.error('Room expired');
      navigate('/');
      return;
    }

    const apiUrl = getApiBase();
    const socket = new SockJS(`${apiUrl}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    const init = async () => {
      try {
        /* =======================
           1️⃣ AUTH
        ======================= */
        const authRes = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: 'include',
        });

        if (authRes.status === 401) {
          toast.error('Please login to continue');
          navigate('/');
          return;
        }

        /* =======================
           2️⃣ ROOM SNAPSHOT
        ======================= */
        const stateRes = await fetch(
          `${apiUrl}/api/rooms/${roomId}/state`,
          { credentials: 'include' }
        );

        if (!stateRes.ok) {
          toast.error('Room not found');
          navigate('/');
          return;
        }

        const state = await stateRes.json();

        setPlayers(state.players || []);

        if (state.leaderboard) {
          setLeaderboard(state.leaderboard);
        }

        if (state.currentQuestion) {
          setCurrentQuestion({
            id: String(state.currentQuestion.id),
            text: state.currentQuestion.text,
            options: state.currentQuestion.optionsJson
              ? JSON.parse(state.currentQuestion.optionsJson)
              : [],
          });
        }

        /* =======================
           3️⃣ REALTIME UPDATES
        ======================= */
        client.onConnect = () => {
          client.subscribe(`/topic/room/${roomId}`, (message) => {
            const event = JSON.parse(message.body);

            switch (event.type) {
              case 'PLAYER_JOINED':
                addPlayer(event.payload);
                break;

              case 'QUESTION':
                setCurrentQuestion({
                  id: String(event.payload.id),
                  text: event.payload.text,
                  options: event.payload.optionsJson
                    ? JSON.parse(event.payload.optionsJson)
                    : [],
                });
                break;

              case 'LEADERBOARD':
                setLeaderboard(event.payload);
                break;

              case 'ROOM_ENDED':
                leaveRoom();
                toast.error('Room ended');
                navigate('/');
                break;

              case 'QUIZ_ENDED':
                toast.success('Quiz ended');
                break;
            }
          });
        };

        client.activate();
      } catch {
        toast.error('Failed to join room');
        navigate('/');
      }
    };

    init();

    return () => {
      client.deactivate();
    };
  }, [addPlayer, leaveRoom, navigate, roomId, setCurrentQuestion, setLeaderboard, setPlayers]);

  return (
    <div className="min-h-screen flex flex-col">
      <RoomHeader />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <QuestionDisplay />
        </main>
      </div>
    </div>
  );
};

export default PlayerPage;
