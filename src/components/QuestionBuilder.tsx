import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Question, QuestionType } from '@/lib/question';
import { Send } from 'lucide-react';


type Props = {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onChange: (q: Question) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSend: () => void;
};

const DURATIONS = [10, 15, 30, 45, 60];

const QuestionBuilder = ({
  question,
  questionNumber,
  totalQuestions,
  onChange,
  onNext,
  onPrevious,
  onSend,
}: Props) => {
  const update = (partial: Partial<Question>) => {
    onChange({ ...question, ...partial });
  };

  const updateOption = (index: number, value: string) => {
    const opts = [...question.options];
    opts[index] = value;
    update({ options: opts });
  };

  const toggleMSQAnswer = (index: number) => {
    const set = new Set(question.correctAnswerIndexes || []);
    set.has(index) ? set.delete(index) : set.add(index);
    update({ correctAnswerIndexes: Array.from(set) });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={questionNumber === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        <div className="text-sm font-medium">
          Question {questionNumber} of {totalQuestions}
        </div>

        <Button variant="outline" onClick={onNext}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* QUESTION TYPE */}
      <div className="space-y-2">
        <Label>Question Type</Label>

        <div className="flex items-center justify-between">
            {/* LEFT: MCQ / MSQ / NAT */}
            <div className="flex gap-3">
            {(['MCQ', 'MSQ', 'NAT'] as QuestionType[]).map(type => (
                <Button
                key={type}
                variant={question.type === type ? 'default' : 'outline'}
                onClick={() =>
                    update({
                    type,
                    correctAnswerIndex: undefined,
                    correctAnswerIndexes: [],
                    correctAnswerText: '',
                    })
                }
                >
                {type}
                </Button>
            ))}
            </div>
        </div>
        </div>    

      {/* QUESTION */}
      <div className="space-y-2">
        <Label>Question</Label>
        <Input
          placeholder="Enter your question"
          value={question.text}
          onChange={e => update({ text: e.target.value })}
        />
      </div>

      {/* OPTIONS (MCQ / MSQ) */}
      {(question.type === 'MCQ' || question.type === 'MSQ') && (
        <div className="space-y-3">
          <Label>Options</Label>

          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              {question.type === 'MCQ' && (
                <input
                  type="radio"
                  checked={question.correctAnswerIndex === i}
                  onChange={() => update({ correctAnswerIndex: i })}
                />
              )}

              {question.type === 'MSQ' && (
                <input
                  type="checkbox"
                  checked={question.correctAnswerIndexes?.includes(i)}
                  onChange={() => toggleMSQAnswer(i)}
                />
              )}

              <Input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* NAT */}
      {question.type === 'NAT' && (
        <div className="space-y-2">
          <Label>Correct Answer (NAT)</Label>
          <Input
            placeholder="Enter correct answer"
            value={question.correctAnswerText || ''}
            onChange={e => update({ correctAnswerText: e.target.value })}
          />
        </div>
      )}

      {/* DURATION */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4" /> Time Limit
        </Label>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map(d => (
            <Button
              key={d}
              variant={question.duration === d ? 'default' : 'outline'}
              onClick={() => update({ duration: d })}
            >
              {d}s
            </Button>
          ))}
        </div>
        {/* RIGHT: SEND */}
           <div className='flex justify-end'>
            <Button
            onClick={onSend}
            className="h-10"
            >
            <Send className="w-4 h-4 mr-2" />
            Send
            </Button>
            </div>
      </div>
    </div>
  );
};

export default QuestionBuilder;
