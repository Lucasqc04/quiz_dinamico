import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { RotateCcw } from 'lucide-react';

export const UserPreferences: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Preferências do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
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
              helper="Quanto tempo é permitido para cada questão"
            />
            
            <Switch
              label="Reiniciar quiz ao errar"
              checked={settings.restartOnError}
              onChange={(checked) => 
                updateSettings({ restartOnError: checked })
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
              helper="Quando mostrar explicações para respostas corretas"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Configurações de Acessibilidade
            </h3>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>Atalhos de teclado:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Alt+C: Ir para página Criar</li>
                <li>Alt+I: Ir para página Importar</li>
                <li>Alt+Q: Ir para página Quiz</li>
                <li>Alt+S: Ir para página Configurações</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline"
            onClick={resetSettings}
            className="flex items-center"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar Padrões
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};