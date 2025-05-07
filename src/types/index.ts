export interface QuizSettings {
  questionCount: number | null;
  optionCount: number | null;
  topic: string;
  questionTypes: ('multiple' | 'truefalse')[];
  language: string;
  includeExplanations: boolean;
  difficulty: string; // Novo campo para nível de dificuldade
}

export interface UserPreferences {
  timePerQuestion: number;
  restartOnError: boolean;
  showExplanations: 'depois' | 'final' | 'nunca';
  theme: 'light' | 'dark';
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  explanation?: string;
  type: 'multiple' | 'truefalse';
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  language: string;
}

export interface QuizResult {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeTaken: number;
}

export interface QuizSummary {
  quizId: string;
  quizTitle: string; // Novo campo para o título
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  results: QuizResult[];
  completedAt: string;
  tentativeNumber?: number; // Opcional, pode ser calculado dinamicamente
}