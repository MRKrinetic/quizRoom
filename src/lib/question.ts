
export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export type Question = {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswerIndex?: number;       // MCQ
  correctAnswerIndexes?: number[];   // MSQ
  correctAnswerText?: string;        // NAT
  duration: number;
};
