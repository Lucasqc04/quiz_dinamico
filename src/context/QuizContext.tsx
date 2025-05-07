import React, { createContext, useContext, useState } from 'react';
import { Quiz, QuizResult, QuizSummary } from '../types';

interface QuizContextType {
  currentQuiz: Quiz | null;
  isQuizActive: boolean;
  currentQuestionIndex: number;
  quizResults: QuizResult[];
  quizSummary: QuizSummary | null;
  setQuiz: (quiz: Quiz) => void;
  startQuiz: () => void;
  endQuiz: () => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => boolean;
  addResult: (result: QuizResult) => void;
  setQuizSummary: (summary: QuizSummary) => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizSummary, setQuizSummaryState] = useState<QuizSummary | null>(null);

  const setQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    resetQuiz();
  };

  const startQuiz = () => {
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setQuizResults([]);
    setQuizSummaryState(null);
  };

  const endQuiz = () => {
    setIsQuizActive(false);
  };

  const goToNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      return true;
    }
    return false;
  };

  const addResult = (result: QuizResult) => {
    setQuizResults(prev => [...prev, result]);
  };

  const setQuizSummary = (summary: QuizSummary) => {
    setQuizSummaryState(summary);
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setQuizResults([]);
    setQuizSummaryState(null);
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuiz,
        isQuizActive,
        currentQuestionIndex,
        quizResults,
        quizSummary,
        setQuiz,
        startQuiz,
        endQuiz,
        goToNextQuestion,
        goToPreviousQuestion,
        addResult,
        setQuizSummary,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};