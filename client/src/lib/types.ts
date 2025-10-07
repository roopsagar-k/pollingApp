export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface PollResults {
  [studentName: string]: string;
}

export interface Question {
  text: string;
  duration: number;
  options: Option[];
}

export interface PollSummary {
  id: string;
  createdAt: number;
  currentQuestion: Question | null;
  students: string[];
}
