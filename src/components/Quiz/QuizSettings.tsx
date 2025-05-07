import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { useQuiz } from '../../context/QuizContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Play } from 'lucide-react';

export const QuizSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { currentQuiz, startQuiz } = useQuiz();

  if (!currentQuiz) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum quiz carregado. Por favor, importe um quiz primeiro.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleStartQuiz = () => {
    startQuiz();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurações do Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              {currentQuiz.title}
            </h3>
            {currentQuiz.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentQuiz.description}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {currentQuiz.questions.length} questões
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Tempo por questão (segundos)"
              type="number"
              min={5}
              max={300}
              value={settings.timePerQuestion}
              onChange={(e) => 
                updateSettings({ timePerQuestion: parseInt(e.target.value) })
              }
            />
            
            <Switch
              label="Reiniciar quiz ao errar"
              checked={settings.restartOnError}
              onChange={(checked) => 
                updateSettings({ restartOnError: checked })
              }
            />

            <Switch
              label="Embaralhar ordem das questões"
              checked={settings.shuffleQuestions}
              onChange={(checked) => 
                updateSettings({ shuffleQuestions: checked })
              }
            />

            <Switch
              label="Embaralhar ordem das opções"
              checked={settings.shuffleOptions}
              onChange={(checked) => 
                updateSettings({ shuffleOptions: checked })
              }
            />
            
            <Select
              label="Mostrar explicações"
              options={[
                { value: 'depois', label: 'Após cada questão' },
                { value: 'final', label: 'No final do quiz' },
                { value: 'nunca', label: 'Nunca' },
              ]}
              value={settings.showExplanations}
              onChange={(value) => 
                updateSettings({ showExplanations: value as 'depois' | 'final' | 'nunca' })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleStartQuiz}
            className="w-full sm:w-auto"
          >
            <Play className="mr-2 h-4 w-4" />
            Iniciar Quiz
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};