import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRoomStore } from '@/lib/roomStore';
import { cn } from '@/lib/utils';
import { ensureCsrfToken, getApiBase, getCookie } from '@/network';

export const QuestionDisplay = () => {
  const { currentQuestion, isHost, roomId } = useRoomStore();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <span className="text-4xl">🎯</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Waiting for Question</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {isHost 
            ? "Use the chat to generate a question, then send it to players"
            : "The host will send a question shortly. Get ready!"
          }
        </p>
      </div>
    );
  }

  const handleAnswer = async (index: number) => {
    if (hasAnswered || !currentQuestion || !roomId) return;
    setSelectedAnswer(index);
    setHasAnswered(true);

    try {
      const apiUrl = getApiBase();
      const answer = currentQuestion.options[index];
      await ensureCsrfToken();
      const csrfToken = getCookie('XSRF-TOKEN');

      const res = await fetch(
        `${apiUrl}/api/rooms/${roomId}/answers/${currentQuestion.id}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'text/plain',
            ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
          },
          body: answer,
        }
      );

      if (!res.ok) {
        throw new Error(`Answer submit failed: ${res.status}`);
      }
    } catch (error) {
      setHasAnswered(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {/* Question */}
        <div className="glass-strong rounded-2xl p-6 w-full mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-center">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((option, index) => {
            const correctIndex = currentQuestion.correctAnswerIndex;
            const showCorrectness = correctIndex !== undefined && correctIndex !== null;
            const isCorrect = showCorrectness && index === correctIndex;
            const isSelected = selectedAnswer === index;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={hasAnswered}
                className={cn(
                  "p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 group",
                  hasAnswered
                    ? isCorrect
                      ? "bg-green-500/20 border-2 border-green-500"
                      : isSelected
                        ? "bg-destructive/20 border-2 border-destructive"
                        : "glass opacity-50"
                    : "glass hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <span className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0",
                  hasAnswered && isCorrect
                    ? "bg-green-500 text-white"
                    : hasAnswered && isSelected
                      ? "bg-destructive text-white"
                      : "bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                )}>
                  {hasAnswered ? (
                    isCorrect ? <CheckCircle className="w-5 h-5" /> : isSelected ? <XCircle className="w-5 h-5" /> : optionLabels[index]
                  ) : optionLabels[index]}
                </span>
                <span className="font-medium">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Result Message */}
        {hasAnswered && (
          <div className={cn(
            "mt-8 p-4 rounded-xl text-center animate-scale-in",
            currentQuestion.correctAnswerIndex !== undefined
              ? selectedAnswer === currentQuestion.correctAnswerIndex
                ? "bg-green-500/20 text-green-400"
                : "bg-destructive/20 text-destructive"
              : "bg-secondary text-foreground"
          )}>
            <p className="text-lg font-semibold">
              {currentQuestion.correctAnswerIndex !== undefined
                ? selectedAnswer === currentQuestion.correctAnswerIndex
                  ? "🎉 Correct! +100 points"
                  : "❌ Wrong answer"
                : "Answer submitted"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
