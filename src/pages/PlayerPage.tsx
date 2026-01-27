import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomHeader } from '@/components/RoomHeader';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { useRoomStore } from '@/lib/roomStore';
import { getApiBase } from '@/network';
import { toast } from 'sonner';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const PlayerPage = () => {
  const {
    roomId,
    addPlayer,
    setPlayers,
    setCurrentQuestion,
    setLeaderboard,
    leaveRoom,
  } = useRoomStore();

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      useRoomStore.getState().resetRoom();
    };
  }, []);

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
      reconnectDelay: 3000,
    });

    client.onConnect = async () => {
      /* ✅ SUBSCRIBE FIRST */
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const event = JSON.parse(message.body);

        switch (event.type) {
          case 'PLAYER_JOINED':
            addPlayer(event.payload);
            break;

          case 'QUESTION':
            setCurrentQuestion({
              id: String(event.payload.id),
              type: event.payload.type,
              text: event.payload.text,
              options: event.payload.options ?? [],
              endTime: event.payload.endTime,
              questionKey: event.payload.questionKey,
            });
            break;

          case 'LEADERBOARD':
            setLeaderboard(event.payload);
            break;

          case 'ROOM_ENDED':
            toast.error('Room ended');
            useRoomStore.getState().resetRoom();
            client.deactivate();
            navigate('/', {replace: true});
            break;

          case 'QUESTION_ENDED':
            setCurrentQuestion(null);
            break;

        }
      });

      /* ✅ THEN SNAPSHOT */
      try {
        const res = await fetch(
          `${apiUrl}/api/rooms/${roomId}/state`,
          { credentials: 'include' }
        );

        if (!res.ok) return;

        const state = await res.json();

        setPlayers(state.players || []);
        if (state.leaderboard) setLeaderboard(state.leaderboard);

        if (state.currentQuestion) {
          const raw = state.currentQuestion.options;

          setCurrentQuestion({
            id: String(state.currentQuestion.id),
            type: state.currentQuestion.type,
            text: state.currentQuestion.text,
            options: Array.isArray(raw)
              ? raw
              : typeof raw === 'string'
                ? JSON.parse(raw)
                : [],
            endTime: state.currentQuestion.endTime,
            questionKey: state.currentQuestion.questionKey,
          });
        } else {
          setCurrentQuestion(null);
        }

      } catch {
        toast.error('Failed to load room');
      }
    };

    client.activate();
    return () => {
      client.deactivate();
    }
  }, [roomId, navigate, addPlayer, setPlayers, setCurrentQuestion, setLeaderboard]);

  return (
    <div className="min-h-screen flex flex-col">
      <RoomHeader />
      <main className="flex-1 overflow-hidden">
        <QuestionDisplay />
      </main>
    </div>
  );
};

export default PlayerPage;
