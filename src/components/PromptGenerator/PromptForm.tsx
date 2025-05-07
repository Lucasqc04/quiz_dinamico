import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateAIPrompt } from '../../utils/generatePrompt';
import { QuizSettings } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Copy } from 'lucide-react';

const initialSettings: QuizSettings = {
  questionCount: 5,
  optionCount: 4,
  topic: '',
  questionTypes: ['multiple'],
  language: 'pt-BR',
  includeExplanations: true,
};

const languageOptions = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en-US', label: 'Inglês' },
  { value: 'es-ES', label: 'Espanhol' },
  { value: 'fr-FR', label: 'Francês' },
];

export const PromptForm: React.FC = () => {
  const [settings, setSettings] = useState<QuizSettings>(initialSettings);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (key: keyof QuizSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleQuestionTypeChange = (type: 'multiple' | 'truefalse') => {
    setSettings(prev => {
      const types = prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type];
      return { ...prev, questionTypes: types.length ? types : [type] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = generateAIPrompt(settings);
    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Gerar Prompt para Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tema"
              placeholder="Ex: História do Brasil, Programação Python, Ciências"
              value={settings.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Questões"
                type="number"
                min={1}
                max={20}
                value={settings.questionCount}
                onChange={(e) => handleInputChange('questionCount', parseInt(e.target.value))}
                required
              />
              
              <Input
                label="Opções por Questão"
                type="number"
                min={2}
                max={6}
                value={settings.optionCount}
                onChange={(e) => handleInputChange('optionCount', parseInt(e.target.value))}
                required
              />
            </div>

            <Select
              label="Idioma das Questões"
              options={languageOptions}
              value={settings.language}
              onChange={(value) => handleInputChange('language', value)}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipos de Questões
              </label>
              <div className="flex gap-4">
                <Switch
                  label="Múltipla Escolha"
                  checked={settings.questionTypes.includes('multiple')}
                  onChange={() => handleQuestionTypeChange('multiple')}
                />
                <Switch
                  label="Verdadeiro/Falso"
                  checked={settings.questionTypes.includes('truefalse')}
                  onChange={() => handleQuestionTypeChange('truefalse')}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Switch
                label="Incluir explicações para as respostas"
                checked={settings.includeExplanations}
                onChange={(checked) => handleInputChange('includeExplanations', checked)}
              />
            </div>
            
            <Button type="submit" className="mt-4">
              Gerar Prompt
            </Button>
          </form>
          
          {generatedPrompt && (
            <motion.div 
              className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md relative"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Copie este prompt para sua IA favorita:
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <pre className="text-xs sm:text-sm bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap">
                {generatedPrompt}
              </pre>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
          <p>
            Após gerar, copie o prompt e cole no ChatGPT ou sua IA preferida para criar seu quiz.
            Em seguida, copie a resposta JSON para o próximo passo.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};