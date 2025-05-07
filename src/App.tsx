import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { GeneratedContentProvider } from './context/GeneratedContentContext';
import { Navbar } from './components/Layout/Navbar';
import { CreatePage } from './pages/CreatePage';
import { ImportPage } from './pages/ImportPage';
import { QuizPage } from './pages/QuizPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('create');
  const { currentQuiz } = useQuiz();

  // Navigate to quiz page when a quiz is imported
  const handleImportSuccess = () => {
    setCurrentPage('quiz');
  };
  
  // Navigate to import page when content is generated with Gemini
  const handleGeminiGeneration = () => {
    setCurrentPage('import');
  };
  
  // Reset to create page
  const handleStartOver = () => {
    setCurrentPage('create');
  };

  // If there's a quiz loaded in state but we're on the create page,
  // show the import page instead
  useEffect(() => {
    if (currentQuiz && currentPage === 'create') {
      setCurrentPage('quiz');
    }
  }, [currentQuiz]);

  const renderPage = () => {
    switch (currentPage) {
      case 'import':
        return <ImportPage onImportSuccess={handleImportSuccess} />;
      case 'quiz':
        return <QuizPage onStartOver={handleStartOver} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <CreatePage onGeminiGeneration={handleGeminiGeneration} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar onPageChange={setCurrentPage} currentPage={currentPage} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <footer className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>© 2025 HastyQuiz - Seu Aplicativo de Quiz com IA</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <QuizProvider>
          <GeneratedContentProvider>
            <AppContent />
          </GeneratedContentProvider>
        </QuizProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;