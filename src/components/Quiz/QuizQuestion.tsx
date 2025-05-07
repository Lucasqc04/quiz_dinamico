import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../../context/QuizContext';
import { useSettings } from '../../context/SettingsContext';
import { QuizOption, QuizResult } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock, AlertCircle, ArrowRight, Check, X } from 'lucide-react';

// Adicionar esta linha para resolver o erro do namespace NodeJS
/// <reference types="node" />

export const QuizQuestion: React.FC = () => {
  const { 
    currentQuiz, 
    currentQuestionIndex, 
    isQuizActive, 
    goToNextQuestion, 
    addResult, 
    endQuiz,
    quizResults
  } = useQuiz();
  const { settings } = useSettings();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef(Date.now());

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (currentQuiz?.questions.length || 0) - 1;
  const correctOption = currentQuestion?.options.find(option => option.isCorrect);

  useEffect(() => {
    if (!isQuizActive || !currentQuestion) return;
    
    // Reset state for new question
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setTimeLeft(settings.timePerQuestion);
    startTime.current = Date.now();
    
    // Start timer
    timerId.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [currentQuestionIndex, isQuizActive, settings.timePerQuestion]);

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, []);

  if (!currentQuiz || !currentQuestion || !isQuizActive) {
    return null;
  }

  // Verificar o tipo de questão para aplicar estilos específicos
  const isTrueFalse = currentQuestion.type === 'truefalse';

  const handleOptionSelect = (option: QuizOption) => {
    if (selectedOption !== null) return; // Already answered
    
    if (timerId.current) clearInterval(timerId.current);
    
    const timeTaken = Math.min(
      Math.round((Date.now() - startTime.current) / 1000),
      settings.timePerQuestion
    );
    
    const correct = option.isCorrect;
    setSelectedOption(option.id);
    setIsCorrect(correct);
    
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedOptionId: option.id,
      isCorrect: correct,
      timeTaken: timeTaken,
    };
    
    // Adicionar o resultado e verificar se é a última questão
    addResult(result);
    
    // Se errou e está configurado para voltar ao início
    if (!correct && settings.restartOnError) {
      if (settings.showExplanations === 'depois') {
        setShowExplanation(true);
      } else {
        setTimeout(() => {
          endQuiz([...quizResults, result]); // Passar todos os resultados incluindo o atual
        }, 1500);
      }
      return;
    }

    // Mostra explicação se configurado
    if (settings.showExplanations === 'depois' && currentQuestion.explanation) {
      setShowExplanation(true);
    } else if (isLastQuestion) {
      // Importante: Passar explicitamente todos os resultados, incluindo o atual
      setTimeout(() => {
        endQuiz([...quizResults, result]);
      }, 1500);
    } else {
      if (!isLastQuestion && settings.showExplanations !== 'depois') {
        setTimeout(() => {
          goToNextQuestion();
        }, 1500);
      }
    }
  };

  const handleTimeUp = () => {
    // Create result with no selection
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedOptionId: null,
      isCorrect: false,
      timeTaken: settings.timePerQuestion,
    };
    
    addResult(result);
    setIsCorrect(false);
    
    if (settings.restartOnError) {
      setTimeout(() => {
        endQuiz([...quizResults, result]); // Passar todos os resultados incluindo o atual
      }, 1500);
    } else if (isLastQuestion) {
      // Passar explicitamente todos os resultados
      setTimeout(() => {
        endQuiz([...quizResults, result]);
      }, 1500);
    } else {
      setTimeout(() => {
        goToNextQuestion();
      }, 1500);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Se é a última questão, garantir que o resultado atual seja incluído
      const currentResult = quizResults.find(r => r.questionId === currentQuestion.id);
      if (currentResult) {
        endQuiz([...quizResults]); // Usar todos os resultados atuais
      }
    } else {
      goToNextQuestion();
    }
  };

  // Calculate time percentage for progress bar
  const timePercentage = (timeLeft / settings.timePerQuestion) * 100;
  
  // Color for timer based on time remaining
  const timerColorClass = 
    timePercentage > 50 ? 'bg-success-500' :
    timePercentage > 20 ? 'bg-warning-500' :
    'bg-danger-500';

  return (
    <motion.div
      key={currentQuestion.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      <Card>
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">
              Questão {currentQuestionIndex + 1} de {currentQuiz.questions.length}
              {isTrueFalse && <span className="ml-2 text-sm font-normal text-gray-500">(Verdadeiro/Falso)</span>}
            </CardTitle>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>{timeLeft}s</span>
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
            <motion.div 
              className={`h-full ${timerColorClass}`}
              initial={{ width: '100%' }}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-lg font-medium mb-4">
            {currentQuestion.text}
          </div>
          
          <div className={isTrueFalse ? "grid grid-cols-2 gap-3 mt-4" : "space-y-3 mt-4"}>
            {currentQuestion.options.map(option => {
              const isSelected = selectedOption === option.id;
              const isCorrectOption = option.isCorrect;
              const showCorrect = selectedOption !== null; // Only show if an option has been selected
              
              let optionClass = 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50';
              
              if (showCorrect) {
                if (isCorrectOption) {
                  optionClass = 'border-success-500 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300';
                } else if (isSelected) {
                  optionClass = 'border-danger-500 bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300';
                } else {
                  optionClass = 'opacity-60';
                }
              }
              
              // Adicionar classes específicas para botões de verdadeiro/falso
              if (isTrueFalse) {
                optionClass += ' flex items-center justify-center py-4 h-full';
              }
              
              return (
                <motion.div 
                  key={option.id}
                  whileHover={{ scale: selectedOption === null ? 1.01 : 1 }}
                  className={`p-3 rounded-md cursor-pointer flex items-center ${optionClass}`}
                  onClick={() => selectedOption === null && handleOptionSelect(option)}
                >
                  <div className="flex-1 text-center">{option.text}</div>
                  
                  {showCorrect && isCorrectOption && (
                    <Check className="h-5 w-5 text-success-500 ml-2" />
                  )}
                  
                  {showCorrect && isSelected && !isCorrectOption && (
                    <X className="h-5 w-5 text-danger-500 ml-2" />
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {showExplanation && currentQuestion.explanation && (
            <motion.div 
              className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Explicação:
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
        
        {/* Modificar a condição do CardFooter */}
        {selectedOption !== null && settings.showExplanations !== 'nunca' && (
          settings.showExplanations === 'depois' ? (
            <CardFooter className="flex justify-end border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <div className="w-full sm:w-auto">
                <Button onClick={handleNext} className="w-full">
                  {!isCorrect && settings.restartOnError ? (
                    'Configurar Quiz'
                  ) : (
                    isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'
                  )}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          ) : null
        )}
      </Card>
    </motion.div>
  );
};