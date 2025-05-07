import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Quiz, QuizResult, QuizSummary } from '../types';
import { saveToStorage, getFromStorage } from '../utils/storage';
import { useSettings } from './SettingsContext';
import { shuffleArray } from '../utils/arrayUtils';

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
  endQuiz: (finalResults?: QuizResult[]) => void;
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

  // Ref para evitar duplicação do resumo no histórico
  const lastSummaryAdded = useRef<string | null>(null);

  const { settings } = useSettings();

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

  const setQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    resetQuiz();
  };

  const startQuiz = () => {
    if (!currentQuiz) return;

    let processedQuiz = { ...currentQuiz };

    // Embaralhar questões se a configuração estiver ativada
    if (settings.shuffleQuestions) {
      processedQuiz = {
        ...processedQuiz,
        questions: shuffleArray([...processedQuiz.questions])
      };
    }

    // Embaralhar opções de cada questão se a configuração estiver ativada
    if (settings.shuffleOptions) {
      processedQuiz = {
        ...processedQuiz,
        questions: processedQuiz.questions.map(question => ({
          ...question,
          options: shuffleArray([...question.options])
        }))
      };
    }

    setCurrentQuiz(processedQuiz);
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setQuizResults([]);
    setQuizSummaryState(null);
    saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, []);
    saveToStorage(STORAGE_KEYS.QUIZ_SUMMARY, null);
  };

  // Modificação na função endQuiz para garantir resultados corretos
  const endQuiz = (finalResults?: QuizResult[]) => {
    setIsQuizActive(false);
    
    if (!currentQuiz) return;
    
    // Garantir que temos resultados para processar
    const resultsToProcess = finalResults || quizResults;
    
    if (resultsToProcess.length === 0) return;
    
    // Calcular estatísticas usando os resultados finais
    const correctAnswers = resultsToProcess.filter(result => result.isCorrect).length;
    const totalTime = resultsToProcess.reduce((sum, result) => sum + result.timeTaken, 0);
    
    const summary: QuizSummary = {
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      totalQuestions: currentQuiz.questions.length,
      correctAnswers: correctAnswers,
      totalTime: totalTime,
      results: resultsToProcess,
      completedAt: new Date().toISOString()
    };
    
    // Salvar resumo e atualizar histórico
    setQuizSummaryState(summary);
    const updatedHistory = [...quizHistory, summary];
    setQuizHistory(updatedHistory);
    saveToStorage(STORAGE_KEYS.QUIZ_HISTORY, updatedHistory);
    saveToStorage(STORAGE_KEYS.QUIZ_SUMMARY, summary);
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

  // Modificação na função addResult para melhorar sincronização
  const addResult = (result: QuizResult) => {
    const updatedResults = [...quizResults, result];
    
    // Atualiza o estado e storage imediatamente
    setQuizResults(updatedResults);
    saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, updatedResults);
    
    // Verifica se é a última questão
    if (currentQuiz && updatedResults.length === currentQuiz.questions.length) {
      // Importante: usamos updatedResults diretamente para garantir que todos
      // os resultados sejam incluídos ao finalizar o quiz
      endQuiz(updatedResults);
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