import React from 'react';
import { Container } from '../components/Layout/Container';
import { QuizSettings } from '../components/Quiz/QuizSettings';
import { QuizQuestion } from '../components/Quiz/QuizQuestion';
import { QuizResults } from '../components/Quiz/QuizResults';
import { useQuiz } from '../context/QuizContext';

interface QuizPageProps {
  onStartOver: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ onStartOver }) => {
  const { currentQuiz, isQuizActive, quizSummary } = useQuiz();

  // Show different components based on quiz state
  const renderContent = () => {
    if (quizSummary) {
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
        title: "Start a Quiz",
        subtitle: "Import a quiz first to begin"
      };
    }
    
    if (quizSummary) {
      return {
        title: "Quiz Complete",
        subtitle: `You've finished "${currentQuiz.title}"`
      };
    }
    
    if (isQuizActive) {
      return {
        title: currentQuiz.title,
        subtitle: currentQuiz.description
      };
    }
    
    return {
      title: "Quiz Settings",
      subtitle: "Configure and start your quiz"
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