import { useEffect, useState } from 'react';
import { useRoomStore } from '@/lib/roomStore';
import { cn } from '@/lib/utils';
import { ensureCsrfToken, getApiBase, getCookie } from '@/network';
import { useCountdown } from '@/lib/useCountDown';

export const QuestionDisplay = () => {
  const { currentQuestion, roomId } = useRoomStore();

  /* ---------- local state ---------- */
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [natAnswer, setNatAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);

  /* ---------- timer ---------- */
  const remaining = useCountdown(currentQuestion?.endTime ?? null);
  const isLocked = hasAnswered || remaining === 0;

  /* ---------- reset on new question ---------- */
  useEffect(() => {
    setSelectedIndexes([]);
    setNatAnswer('');
    setHasAnswered(false);
  }, [currentQuestion?.questionKey]);

  if (!currentQuestion) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for next question…
      </div>
    );
  }

  /* ---------- submit ---------- */
  const submitAnswer = async (answer: string) => {
    if (!roomId || isLocked) return;

    setHasAnswered(true);

    try {
      const apiUrl = getApiBase();
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

      if (!res.ok) throw new Error();
    } catch {
      setHasAnswered(false);
    }
  };

  /* ---------- helpers ---------- */
  const toggleOption = (index: number) => {
    if (currentQuestion.type === 'MCQ') {
      setSelectedIndexes([index]); // only one allowed
    } else {
      setSelectedIndexes(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    }
  };

  const submitMCQ_MSQ = () => {
    const answers = selectedIndexes
      .map(i => currentQuestion.options[i])
      .map(a => a.trim())
      .sort(); // 🔥 IMPORTANT

    submitAnswer(answers.join(',')); // "A,B" always same order
  };


  return (
    <div className="flex flex-col h-full p-6">

      {/* ⏱ TIMER */}
      <div className="text-center text-sm text-muted-foreground mb-1">
        ⏱ {remaining}s remaining
      </div>

      {/* 🏷 QUESTION TYPE */}
      <div className="text-center text-xs uppercase tracking-wider text-primary mb-4">
        {currentQuestion.type} Question
      </div>

      {/* ❓ QUESTION */}
      <div className="glass-strong p-6 rounded-xl mb-6 text-center text-xl font-semibold">
        {currentQuestion.text}
      </div>

      {/* ================= NAT ================= */}
      {currentQuestion.type === 'NAT' && (
        <div className="flex flex-col gap-4">
          <input
            value={natAnswer}
            onChange={e => setNatAnswer(e.target.value)}
            disabled={isLocked}
            placeholder="Enter your answer"
            className="w-full rounded-xl bg-secondary px-4 py-3 text-lg"
          />

          <button
            disabled={isLocked || !natAnswer.trim()}
            onClick={() => submitAnswer(natAnswer)}
            className={cn(
              'rounded-xl px-6 py-3 font-semibold',
              isLocked
                ? 'bg-secondary opacity-50'
                : 'bg-primary text-primary-foreground'
            )}
          >
            Submit
          </button>
        </div>
      )}

      {/* ================= MCQ / MSQ ================= */}
      {(currentQuestion.type === 'MCQ' ||
        currentQuestion.type === 'MSQ') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const selected = selectedIndexes.includes(index);

              return (
                <button
                  key={index}
                  disabled={isLocked}
                  onClick={() => toggleOption(index)}
                  className={cn(
                    'p-4 rounded-xl text-left transition',
                    selected
                      ? 'bg-primary/20 border border-primary'
                      : 'glass hover:border-primary/40',
                    isLocked && 'opacity-50'
                  )}
                >
                  <span className="font-bold mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              disabled={isLocked || selectedIndexes.length === 0}
              onClick={submitMCQ_MSQ}
              className={cn(
                'rounded-xl px-8 py-3 font-semibold',
                isLocked
                  ? 'bg-secondary opacity-50'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              Submit
            </button>
          </div>
        </>
      )}

      {hasAnswered && (
        <div className="mt-6 text-center text-green-400 font-semibold">
          ✅ Answer submitted
        </div>
      )}
    </div>
  );
};
