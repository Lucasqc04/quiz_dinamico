import React, { useEffect } from 'react';
import { Container } from '../components/Layout/Container';
import { QuizSettings } from '../components/Quiz/QuizSettings';
import { QuizQuestion } from '../components/Quiz/QuizQuestion';
import { QuizResults } from '../components/Quiz/QuizResults';
import { useQuiz } from '../context/QuizContext';

interface QuizPageProps {
  onStartOver: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ onStartOver }) => {
  const { currentQuiz, isQuizActive, quizSummary, quizResults } = useQuiz();

  // Verificar se todas as perguntas foram respondidas
  const isQuizCompleted = currentQuiz && quizResults.length === currentQuiz.questions.length;

  // Show different components based on quiz state
  const renderContent = () => {
    // Mostrar resultados quando tiver um resumo ou quando o quiz estiver completo e não ativo
    if (quizSummary || (isQuizCompleted && !isQuizActive)) {
      return <QuizResults onStartOver={onStartOver} />;
    }
    
    if (isQuizActive) {
      return <QuizQuestion />;
    }
    
    return <QuizSettings />;
  };

  // Dynamic title and subtitle based on quiz state
  const getPageInfo = () => {
    if (!currentQuiz) {
      return {
        title: "Iniciar um Quiz",
        subtitle: "Importe um quiz primeiro para começar"
      };
    }
    
    if (quizSummary || (isQuizCompleted && !isQuizActive)) {
      return {
        title: "Quiz Concluído",
        subtitle: `Você terminou "${currentQuiz.title}"`
      };
    }
    
    if (isQuizActive) {
      return {
        title: currentQuiz.title,
        subtitle: currentQuiz.description
      };
    }
    
    return {
      title: "Configurações do Quiz",
      subtitle: "Configure e inicie seu quiz"
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <Container
      title={title}
      subtitle={subtitle}
    >
      {renderContent()}
    </Container>
  );
};