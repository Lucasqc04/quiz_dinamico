import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuiz } from '../../context/QuizContext';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Check, X, Clock, RotateCcw, ArrowLeft, History, 
  Share, Download, ChevronDown, Camera
} from 'lucide-react';
import { ResultCard } from './ResultCard';
import { generateImage, saveImage, shareImage } from '../../utils/imageUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import { toast } from '../ui/Toast';
import { FaTelegramPlane} from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

export const QuizResults: React.FC<{ onStartOver: () => void }> = ({ onStartOver }) => {
  const { currentQuiz, quizResults, quizSummary, setQuizSummary, resetQuiz } = useQuiz();
  const { settings } = useSettings();
  const [showHistory, setShowHistory] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    const totalTime = quizResults.reduce((sum, result) => sum + result.timeTaken, 0);
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    
    // Funções para lidar com a imagem
    const handleSaveImage = async () => {
      if (!resultCardRef.current) return;
      
      try {
        setIsGeneratingImage(true);
        const dataUrl = await generateImage(resultCardRef.current);
        saveImage(dataUrl, `quiz-resultado-${currentQuiz.title || 'quiz'}.png`);
        toast({
          title: "Imagem salva",
          description: "Sua imagem foi salva com sucesso!",
          variant: "success",
        });
      } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a imagem. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingImage(false);
      }
    };
    
    const handleShareImage = async (platform?: 'whatsapp' | 'telegram' | 'x' | 'facebook') => {
      if (!resultCardRef.current) return;
      
      try {
        setIsGeneratingImage(true);
        const dataUrl = await generateImage(resultCardRef.current);
        const quizTitle = currentQuiz.title || 'Quiz';
        const shareText = `Consegui ${score}% de acertos no ${quizTitle}! Veja meu resultado!`;
        
        await shareImage(dataUrl, `Resultado: ${quizTitle}`, shareText, platform);
        toast({
          title: "Compartilhado",
          description: "Seu resultado foi compartilhado com sucesso!",
          variant: "success",
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar sua imagem. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingImage(false);
      }
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

        {/* Novo cartão de resultado destacado */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <ResultCard 
            ref={resultCardRef}
            score={score}
            correctAnswers={correctAnswers}
            totalQuestions={currentQuiz.questions.length}
            totalTime={totalTime}
            quizTitle={currentQuiz.title}
          />

          {/* Botões de compartilhamento e salvamento */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              onClick={handleSaveImage}
              disabled={isGeneratingImage}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Salvar Resultado
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isGeneratingImage}
                  className="flex items-center"
                >
                  <Share className="mr-2 h-4 w-4" />
                  Compartilhar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShareImage()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Compartilhar Imagem
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShareImage('whatsapp')}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareImage('telegram')}>
                  <FaTelegramPlane className="mr-2 h-4 w-4 text-[#0088cc]" />
                  Telegram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareImage('x')}>
                  <FaXTwitter className="mr-2 h-4 w-4 text-[#ffffff]" />
                  X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareImage('facebook')}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                <div className="text-lg font-semibold">{formatTime(Math.round(totalTime / currentQuiz.questions.length))}</div>
                <p className="text-xs text-gray-500">Tempo Médio por Questão</p>
              </motion.div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white">Resumo das Questões</h3>
              
              {quizResults.map((result, index) => {
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
            
            <Button
              variant="outline"
              onClick={resetQuiz}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Configurar Quiz
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
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
};

// Função auxiliar para formatar o tempo
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}