import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuiz } from '../../context/QuizContext';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, Clock, RotateCcw, ArrowLeft, Award, Star, Trophy, ArrowUp, History, Save } from 'lucide-react';


export const QuizResults: React.FC<{ onStartOver: () => void }> = ({ onStartOver }) => {
  const { currentQuiz, quizResults, quizSummary, setQuizSummary, resetQuiz } = useQuiz();
  const { settings } = useSettings();
  const [showHistory, setShowHistory] = useState(false);

  // Cria um resumo se não existir ainda
  useEffect(() => {
    if (currentQuiz && quizResults.length > 0 && !quizSummary) {
      const correctAnswers = quizResults.filter(result => result.isCorrect).length;
      const totalTime = quizResults.reduce((sum, result) => sum + result.timeTaken, 0);
      
      setQuizSummary({
        quizId: currentQuiz.id,
        totalQuestions: currentQuiz.questions.length,
        correctAnswers: correctAnswers,
        totalTime: totalTime,
        results: quizResults,
        completedAt: new Date().toISOString()
      });
    }
  }, [currentQuiz, quizResults, quizSummary, setQuizSummary]);

  // Garante que temos dados para mostrar
  if (!currentQuiz) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum quiz disponível. Importe ou crie um quiz primeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Se temos resultados, mostra-os
  if (quizResults.length > 0) {
    const correctAnswers = quizResults.filter(result => result.isCorrect).length;
    return renderResults(correctAnswers, currentQuiz.questions.length, quizResults.reduce((sum, result) => sum + result.timeTaken, 0), quizResults);
  }

  // Caso de fallback - não deveria acontecer, mas para garantir
  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Complete o quiz para ver os resultados.
        </p>
        <Button onClick={resetQuiz} className="mt-4">
          <RotateCcw className="mr-2 h-4 w-4" />
          Configurar Quiz
        </Button>
      </CardContent>
    </Card>
  );

  // Função para renderizar os resultados com dados fornecidos
  function renderResults(correctAnswers: number, totalQuestions: number, totalTime: number, results: any[]) {
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Função para determinar a cor com base na pontuação
    const getScoreColorClass = () => {
      if (score >= 90) return 'text-green-600 dark:text-green-400';
      if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
      if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
      if (score >= 30) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    };

    // Função para determinar o ícone com base na pontuação
    const getScoreIcon = () => {
      if (score >= 90) return <Trophy className="h-8 w-8 mb-2" />;
      if (score >= 70) return <Award className="h-8 w-8 mb-2" />;
      if (score >= 50) return <Star className="h-8 w-8 mb-2" />;
      return <ArrowUp className="h-8 w-8 mb-2" />;
    };

    // Efeito para disparar confetti se a pontuação for alta
    useEffect(() => {
      if (score >= 80) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        
        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };
        
        const interval: NodeJS.Timeout = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          
          const particleCount = 50 * (timeLeft / duration);
          
          // Dispara confetti de ambos os lados
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);
        
        return () => clearInterval(interval);
      }
    }, [score]);

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Feedback personalizado baseado na pontuação
    const getFeedbackMessage = () => {
      if (score >= 90) return "Excelente! Você é um mestre neste assunto!";
      if (score >= 80) return "Incrível! Seu conhecimento é impressionante!";
      if (score >= 70) return "Muito bom! Você tem um sólido entendimento.";
      if (score >= 60) return "Bom trabalho! Você está no caminho certo.";
      if (score >= 50) return "Bom esforço! Continue praticando para melhorar.";
      if (score >= 40) return "Continue tentando! Você pode melhorar com prática.";
      return "Não desista! Tente novamente para melhorar sua pontuação.";
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        {/* Botões de histórico */}
        <div className="mb-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center"
          >
            <History className="mr-2 h-4 w-4" />
            {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
          </Button>
        </div>

        {/* Exibir histórico de tentativas se solicitado */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Quiz</CardTitle>
                  <CardDescription>Suas tentativas anteriores</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Funcionalidade de histórico em desenvolvimento
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Novo card de resumo destacado */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-2 border-primary-500 dark:border-primary-400 shadow-lg">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 text-white p-6 text-center">
              <h2 className="text-2xl font-bold mb-1">Parabéns por completar o quiz!</h2>
              <p className="text-primary-100">
                Você respondeu {correctAnswers} de {totalQuestions} questões corretamente
              </p>
            </div>
            
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColorClass()}`}>
                    {score}%
                  </span>
                </div>
                
                <svg viewBox="0 0 36 36" className="w-32 h-32">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                    className="stroke-gray-200 dark:stroke-gray-700"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray="100, 100"
                    strokeDashoffset={100 - score}
                    strokeLinecap="round"
                    strokeWidth="3"
                    className={score >= 90 ? 'stroke-green-500' : 
                            score >= 70 ? 'stroke-emerald-500' : 
                            score >= 50 ? 'stroke-yellow-500' : 
                            score >= 30 ? 'stroke-orange-500' : 
                            'stroke-red-500'}
                  />
                </svg>
              </div>
              
              <div className="text-center mt-4">
                <p className="font-medium text-lg mb-2">
                  {getFeedbackMessage()}
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Tempo total: {formatTime(totalTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detalhes do Quiz</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center shadow-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Clock className="h-6 w-6 mx-auto text-primary-500 mb-2" />
                <div className="text-lg font-semibold">{formatTime(totalTime)}</div>
                <p className="text-xs text-gray-500">Tempo Total</p>
              </motion.div>
              
              <motion.div 
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center shadow-sm"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Clock className="h-6 w-6 mx-auto text-primary-500 mb-2" />
                <div className="text-lg font-semibold">{formatTime(Math.round(totalTime / totalQuestions))}</div>
                <p className="text-xs text-gray-500">Tempo Médio por Questão</p>
              </motion.div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white">Resumo das Questões</h3>
              
              {results.map((result, index) => {
                const question = currentQuiz?.questions.find(q => q.id === result.questionId);
                if (!question) return null;
                
                const selectedOption = question.options.find(o => o.id === result.selectedOptionId);
                const correctOption = question.options.find(o => o.isCorrect);
                
                return (
                  <motion.div 
                    key={result.questionId || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-3 rounded-md border ${result.isCorrect ? 
                      'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' : 
                      'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        {result.isCorrect ? (
                          <Check className="h-5 w-5 text-success-500" />
                        ) : (
                          <X className="h-5 w-5 text-danger-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {question.text}
                        </p>
                        
                        {!result.isCorrect && correctOption && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Resposta correta: <span className="text-success-600 dark:text-success-400 font-medium">{correctOption.text}</span>
                            </p>
                            {selectedOption && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Sua resposta: <span className="text-danger-600 dark:text-danger-400 font-medium">{selectedOption.text}</span>
                              </p>
                            )}
                            {!selectedOption && (
                              <p className="text-xs text-danger-600 dark:text-danger-400">
                                Tempo esgotado
                              </p>
                            )}
                          </div>
                        )}
                        
                        {settings.showExplanations === 'final' && question.explanation && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-2 rounded">
                            <span className="font-medium">Explicação:</span> {question.explanation}
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {result.timeTaken}s
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              variant="outline"
              onClick={onStartOver}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetQuiz}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Configurar Quiz
              </Button>
              
              <Button
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Resultados
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
};