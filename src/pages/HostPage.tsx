import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomHeader } from '@/components/RoomHeader';
import QuestionBuilder from '@/components/QuestionBuilder';
import { useRoomStore } from '@/lib/roomStore';
import { toast } from 'sonner';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ensureCsrfToken, getApiBase, getCookie } from '@/network';
import { Question } from '@/lib/question';
import { WsEvent } from '@/lib/wsEvents';


const HostPage = () => {
  const [activeTab, setActiveTab] = useState('question');
  const {
    roomId,
    isHost,
    setLeaderboard,
    setCurrentQuestion,
    addPlayer,
  } = useRoomStore();

  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'MCQ',
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      correctAnswerIndexes: [],
      correctAnswerText: '',
      duration: 30,
    },
  ]);

  const q = questions[currentIndex];
  const isLocked = q?.sent === true;
  /* ================= ACCESS CHECK ================= */
  useEffect(() => {
    if (!roomId || !isHost) navigate('/');
  }, [roomId, isHost, navigate]);

  /* ================= QUESTION STATE ================= */
  const updateQuestion = (updatedQuestion) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[currentIndex] = updatedQuestion;
      return copy;
    });
  };

  const handleNext = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'MCQ',
        text: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        correctAnswerIndexes: [],
        correctAnswerText: '',
        duration: 30,
      },
    ]);
    setCurrentIndex(i => i + 1);
  };


  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  /* ================= WEBSOCKET (RESTORED – REQUIRED FOR LEADERBOARD) ================= */
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
          const event: WsEvent = JSON.parse(message.body);

          if (event.type === 'PLAYER_JOINED') {
            addPlayer(event.payload);
          }

          if (event.type === 'QUESTION') {
            const payload = event.payload;
            setCurrentQuestion({
              id: String(payload.id),
              type: payload.type,
              text: payload.text,
              options: payload.options ?? [],
              endTime: payload.endTime,
              questionKey: payload.questionKey,
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
        } catch (e) {
          console.error('WS error', e);
        }
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [roomId, navigate, addPlayer, setCurrentQuestion, setLeaderboard]);

  /* ================= SEND QUESTION ================= */
  const broadcastQuestion = async () => {
    if (!roomId) return;
    const q = questions[currentIndex];

    if (!q.text.trim()) {
      toast.error('Question text is empty');
      return;
    }

    // Validation per type
    if (q.type !== 'NAT' && q.options.some(o => !o.trim())) {
      toast.error('All options must be filled');
      return;
    }

    if (q.type === 'MCQ' && q.correctAnswerIndex == null) {
      toast.error('Select one correct answer');
      return;
    }

    if (q.type === 'MSQ' && (!q.correctAnswerIndexes?.length)) {
      toast.error('Select at least one correct answer');
      return;
    }

    if (q.type === 'NAT' && !q.correctAnswerText?.trim()) {
      toast.error('Enter correct answer for NAT');
      return;
    }

    try {
      const apiUrl = getApiBase();
      await ensureCsrfToken();
      const csrfToken = getCookie('XSRF-TOKEN');

      const endTime = new Date(
        Date.now() + q.duration * 1000
      ).toISOString();

      const correctAnswer =
        q.type === 'MCQ'
          ? [q.options[q.correctAnswerIndex]]
          : q.type === 'MSQ'
          ? q.correctAnswerIndexes.map(i => q.options[i])
          : [q.correctAnswerText];

      const payload = {
        id: q.id,
        type: q.type,
        text: q.text,
        optionsJson: q.type === 'NAT' ? null : JSON.stringify(q.options),
        correctAnswer,
        points: 2,
        timeLimitSeconds: q.duration,
        endTime,
      };

      const res = await fetch(
        `${apiUrl}/api/rooms/${roomId}/quiz/question`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      setQuestions(prev => {
        const copy = [...prev];
        copy[currentIndex] = {
          ...copy[currentIndex],
          sent: true,
        };
        return copy;
      });
      
      toast.success(`Question ${currentIndex + 1} sent`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to send question');
    }
  };


  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex flex-col">
      <RoomHeader showNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <QuestionBuilder
              question={questions[currentIndex]}
              locked={isLocked}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onChange={updateQuestion}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSend={broadcastQuestion} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HostPage;
