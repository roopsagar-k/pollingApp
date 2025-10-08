export interface Option {
  id: number;
  text: string;
}

export interface Student {
  socketId: string;
  name: string;
}

export interface Question {
  text: string;
  options: Option[];
  answers: Record<string, { name: string; answer: string }>; // keyed by socketId
  createdAt: number;
  duration: number;
  isActive: boolean;
}

export interface Poll {
  id: string;
  teacherSocketId: string;
  students: Student[]; // changed from string[] to Student[]
  currentQuestion: Question | null;
  questions?: Question[];
  createdAt: number;
}
