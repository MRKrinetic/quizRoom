import { useState } from 'react';
import { Send, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomStore, Message } from '@/lib/roomStore';
import { cn } from '@/lib/utils';

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, setCurrentQuestion } = useRoomStore();

  const generateQuiz = async (prompt: string) => {
    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
    };
    addMessage(userMessage);
    
    // Simulate AI response (in real app, this would call LLM)
    setTimeout(() => {
      const mockQuestion = {
        id: Date.now().toString(),
        text: `Generated question based on: "${prompt}"`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswerIndex: 0,
      };
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've generated a quiz question for you:\n\n**${mockQuestion.text}**\n\nA) ${mockQuestion.options[0]}\nB) ${mockQuestion.options[1]}\nC) ${mockQuestion.options[2]}\nD) ${mockQuestion.options[3]}\n\nClick "Send to Players" to broadcast this question.`,
      };
      addMessage(assistantMessage);
      setCurrentQuestion(mockQuestion);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    generateQuiz(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-float">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generate Quiz Questions</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Describe what kind of quiz you want to create. For example: "Create a trivia question about space exploration"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex animate-fade-in",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'glass rounded-bl-md'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-center gap-2 glass rounded-xl p-2">
          <Button type="button" variant="ghost" size="icon" className="shrink-0">
            <Upload className="w-5 h-5" />
          </Button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your quiz question..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
