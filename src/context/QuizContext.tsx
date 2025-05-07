import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quiz, QuizResult, QuizSummary } from '../types';
import { saveToStorage, getFromStorage } from '../utils/storage';

// Chaves para armazenamento no localStorage
const STORAGE_KEYS = {
  CURRENT_QUIZ: 'quiz-app-current-quiz',
  QUIZ_RESULTS: 'quiz-app-results',
  QUIZ_SUMMARY: 'quiz-app-summary',
  QUIZ_HISTORY: 'quiz-app-history',
};

interface QuizContextType {
  currentQuiz: Quiz | null;
  isQuizActive: boolean;
  currentQuestionIndex: number;
  quizResults: QuizResult[];
  quizSummary: QuizSummary | null;
  quizHistory: QuizSummary[];
  setQuiz: (quiz: Quiz) => void;
  startQuiz: () => void;
  endQuiz: () => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => boolean;
  addResult: (result: QuizResult) => void;
  setQuizSummary: (summary: QuizSummary) => void;
  resetQuiz: () => void; // Função para reiniciar o quiz e voltar à tela de configurações
  restartQuiz: () => void; // Existente, reinicia o quiz imediatamente
  clearHistory: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Carregar do localStorage durante a inicialização
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(() => 
    getFromStorage<Quiz | null>(STORAGE_KEYS.CURRENT_QUIZ, null)
  );
  
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => 
    getFromStorage<QuizResult[]>(STORAGE_KEYS.QUIZ_RESULTS, [])
  );
  
  const [quizSummary, setQuizSummaryState] = useState<QuizSummary | null>(() => 
    getFromStorage<QuizSummary | null>(STORAGE_KEYS.QUIZ_SUMMARY, null)
  );
  
  const [quizHistory, setQuizHistory] = useState<QuizSummary[]>(() => 
    getFromStorage<QuizSummary[]>(STORAGE_KEYS.QUIZ_HISTORY, [])
  );

  // Salvar no localStorage sempre que os estados mudarem
  useEffect(() => {
    if (currentQuiz) {
      saveToStorage(STORAGE_KEYS.CURRENT_QUIZ, currentQuiz);
    }
  }, [currentQuiz]);

  useEffect(() => {
    if (quizResults.length > 0) {
      saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, quizResults);
    }
  }, [quizResults]);

  useEffect(() => {
    if (quizSummary) {
      saveToStorage(STORAGE_KEYS.QUIZ_SUMMARY, quizSummary);
      // Adiciona ao histórico quando um novo resumo é criado
      if (!quizHistory.some(summary => summary.completedAt === quizSummary.completedAt)) {
        const updatedHistory = [...quizHistory, quizSummary];
        setQuizHistory(updatedHistory);
        saveToStorage(STORAGE_KEYS.QUIZ_HISTORY, updatedHistory);
      }
    }
  }, [quizSummary]);

  const setQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    resetQuiz();
  };

  const startQuiz = () => {
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setQuizResults([]);
    setQuizSummaryState(null);
    // Limpar armazenamento de resultados anteriores
    saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, []);
    saveToStorage(STORAGE_KEYS.QUIZ_SUMMARY, null);
  };

  const endQuiz = () => {
    setIsQuizActive(false);
    
    // Criar automaticamente o resumo do quiz quando ele terminar
    if (currentQuiz && quizResults.length > 0) {
      const correctAnswers = quizResults.filter(result => result.isCorrect).length;
      const totalTime = quizResults.reduce((sum, result) => sum + result.timeTaken, 0);
      
      const summary: QuizSummary = {
        quizId: currentQuiz.id,
        totalQuestions: currentQuiz.questions.length,
        correctAnswers: correctAnswers,
        totalTime: totalTime,
        results: quizResults,
        completedAt: new Date().toISOString()
      };
      
      setQuizSummaryState(summary);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      return true;
    }
    // Se for a última questão, finaliza o quiz
    if (currentQuiz && currentQuestionIndex === currentQuiz.questions.length - 1) {
      endQuiz();
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
    const updatedResults = [...quizResults, result];
    setQuizResults(updatedResults);
    saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, updatedResults);
    
    // Verifica se todas as perguntas foram respondidas
    if (currentQuiz && updatedResults.length === currentQuiz.questions.length) {
      // Finalize o quiz automaticamente se todas as perguntas foram respondidas
      setTimeout(() => {
        endQuiz();
      }, 1000);
    }
  };

  const setQuizSummary = (summary: QuizSummary) => {
    setQuizSummaryState(summary);
    saveToStorage(STORAGE_KEYS.QUIZ_SUMMARY, summary);
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setQuizResults([]);
    setQuizSummaryState(null);
    // Limpar armazenamento de resultados anteriores
    saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, []);
    saveToStorage(STORAGE_KEYS.QUIZ_SUMMARY, null);
  };
  
  const restartQuiz = () => {
    if (currentQuiz) {
      resetQuiz();
      startQuiz();
    }
  };
  
  const clearHistory = () => {
    setQuizHistory([]);
    saveToStorage(STORAGE_KEYS.QUIZ_HISTORY, []);
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuiz,
        isQuizActive,
        currentQuestionIndex,
        quizResults,
        quizSummary,
        quizHistory,
        setQuiz,
        startQuiz,
        endQuiz,
        goToNextQuestion,
        goToPreviousQuestion,
        addResult,
        setQuizSummary,
        resetQuiz, // Adicionar a nova função ao contexto
        restartQuiz,
        clearHistory,
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