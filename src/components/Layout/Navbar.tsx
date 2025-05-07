import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavbarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onPageChange, currentPage }) => {
  const navItems = [
    { id: 'create', label: 'Criar', key: 'c' },
    { id: 'import', label: 'Importar', key: 'i' },
    { id: 'quiz', label: 'Quiz', key: 'q' },
    { id: 'settings', label: 'Configurações', key: 's' },
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        navItems.forEach(item => {
          if (e.key === item.key) {
            onPageChange(item.id);
            e.preventDefault();
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPageChange]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BrainCircuit className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">HastyQuiz</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                            ${currentPage === item.id 
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  {item.label} <span className="text-xs opacity-60">(Alt+{item.key})</span>
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="sm:hidden border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`py-2 text-sm font-medium transition-colors
                        ${currentPage === item.id 
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                          : 'text-gray-600 dark:text-gray-300'
                        }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};