import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../../context/QuizContext';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, Clock, RotateCcw, ArrowLeft } from 'lucide-react';

export const QuizResults: React.FC<{ onStartOver: () => void }> = ({ onStartOver }) => {
  const { currentQuiz, quizResults, startQuiz } = useQuiz();
  const { settings } = useSettings();

  if (!currentQuiz || quizResults.length === 0) {
    return null;
  }

  const correctAnswers = quizResults.filter(result => result.isCorrect).length;
  const totalQuestions = currentQuiz.questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const totalTime = quizResults.reduce((sum, result) => sum + result.timeTaken, 0);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Get feedback message based on score
  const getFeedbackMessage = () => {
    if (score >= 90) return "Excellent! You're a master of this topic!";
    if (score >= 70) return "Great job! You have a solid understanding.";
    if (score >= 50) return "Good effort! Keep practicing to improve.";
    return "Don't give up! Try again to improve your score.";
  };

  const restartQuiz = () => {
    startQuiz();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quiz Results</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
            <motion.div 
              className="text-5xl font-bold text-primary-600 dark:text-primary-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {score}%
            </motion.div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {correctAnswers} of {totalQuestions} correct
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {getFeedbackMessage()}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <Clock className="h-6 w-6 mx-auto text-gray-500 mb-2" />
              <div className="text-lg font-semibold">{formatTime(totalTime)}</div>
              <p className="text-xs text-gray-500">Total Time</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <Clock className="h-6 w-6 mx-auto text-gray-500 mb-2" />
              <div className="text-lg font-semibold">{formatTime(Math.round(totalTime / totalQuestions))}</div>
              <p className="text-xs text-gray-500">Avg. Time per Question</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="font-medium text-gray-900 dark:text-white">Question Summary</h3>
            
            {quizResults.map((result, index) => {
              const question = currentQuiz.questions.find(q => q.id === result.questionId);
              if (!question) return null;
              
              const selectedOption = question.options.find(o => o.id === result.selectedOptionId);
              const correctOption = question.options.find(o => o.isCorrect);
              
              return (
                <motion.div 
                  key={result.questionId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-3 rounded-md border border-gray-200 dark:border-gray-800"
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
                            Correct answer: <span className="text-success-600 dark:text-success-400">{correctOption.text}</span>
                          </p>
                          {selectedOption && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Your answer: <span className="text-danger-600 dark:text-danger-400">{selectedOption.text}</span>
                            </p>
                          )}
                          {!selectedOption && (
                            <p className="text-xs text-danger-600 dark:text-danger-400">
                              Time expired
                            </p>
                          )}
                        </div>
                      )}
                      
                      {settings.showExplanations === 'end' && question.explanation && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-2 rounded">
                          <span className="font-medium">Explanation:</span> {question.explanation}
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
            Back to Home
          </Button>
          
          <Button
            onClick={restartQuiz}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart Quiz
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};