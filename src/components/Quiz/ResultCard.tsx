import React, { forwardRef } from 'react';
import { Clock, Trophy, Award, Star, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface ResultCardProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalTime: number;
  quizTitle?: string;
}

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ score, correctAnswers, totalQuestions, totalTime, quizTitle = "Quiz" }, ref) => {
    
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

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
      <div ref={ref}>
        <Card className="overflow-hidden border-2 border-primary-500 dark:border-primary-400 shadow-lg">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 text-white p-6 text-center">
            <h2 className="text-2xl font-bold mb-1">{quizTitle}</h2>
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
      </div>
    );
  }
);

ResultCard.displayName = 'ResultCard';
