import React from 'react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Switch } from '../../ui/Switch';
import { QuizSettings } from '../../../types';
import { InputWithSuggestions } from '../../ui/InputWithSuggestions';
import { NumberInput } from '../../ui/NumberInput';

interface QuizFormFieldsProps {
  settings: QuizSettings;
  onNumericChange: (key: 'questionCount' | 'optionCount', value: string) => void;
  onInputChange: (key: keyof QuizSettings, value: any) => void;
  onQuestionTypeChange: (type: 'multiple' | 'truefalse') => void;
}

const languageOptions = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en-US', label: 'Inglês' },
  { value: 'es-ES', label: 'Espanhol' },
  { value: 'fr-FR', label: 'Francês' },
];

const questionCountSuggestions = [
  { value: 5, label: '5 questões' },
  { value: 10, label: '10 questões' },
  { value: 15, label: '15 questões' },
  { value: 20, label: '20 questões' },
  { value: 25, label: '25 questões' },
  { value: 30, label: '30 questões' },
];

const optionCountSuggestions = [
  { value: 2, label: '2 opções' },
  { value: 3, label: '3 opções' },
  { value: 4, label: '4 opções' },
  { value: 5, label: '5 opções' },
  { value: 6, label: '6 opções' },
  { value: 7, label: '7 opções' },
  { value: 8, label: '8 opções' },
];

const difficultyLevelSuggestions = [
  { value: 'Fácil', label: 'Fácil' },
  { value: 'Médio', label: 'Médio' },
  { value: 'Difícil', label: 'Difícil' },
  { value: 'Muito Difícil', label: 'Muito Difícil' },
  { value: 'Iniciante', label: 'Iniciante' },
  { value: 'Avançado', label: 'Avançado' },
];

export const QuizFormFields: React.FC<QuizFormFieldsProps> = ({
  settings,
  onNumericChange,
  onInputChange,
  onQuestionTypeChange,
}) => {
  const showOptionCountInput = settings.questionTypes.includes('multiple');

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Input
          label="Tema"
          placeholder="Ex: História do Brasil, Programação Python, Ciências"
          value={settings.topic}
          onChange={(e) => onInputChange('topic', e.target.value)}
          required
          className="transition-all duration-200 border-2 focus-within:border-primary-500 
                    hover:border-gray-400 dark:hover:border-gray-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumberInput
          label="Número de Questões"
          value={settings.questionCount}
          onChange={(value) => onNumericChange('questionCount', value)}
          placeholder="Digite ou selecione (1-30)"
          min={1}
          max={30}
          required
          suggestions={questionCountSuggestions}
          onFocus={(e) => e.target.value === '' && onNumericChange('questionCount', '')}
        />
        
        {showOptionCountInput && (
          <NumberInput
            label="Opções por Questão"
            value={settings.optionCount}
            onChange={(value) => onNumericChange('optionCount', value)}
            placeholder="Digite ou selecione (2-8)"
            min={2}
            max={8}
            required
            suggestions={optionCountSuggestions}
            onFocus={(e) => e.target.value === '' && onNumericChange('optionCount', '')}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Idioma das Questões"
          options={languageOptions}
          value={settings.language}
          onChange={(value) => onInputChange('language', value)}
        />
        
        <InputWithSuggestions
          label="Nível de Dificuldade"
          value={settings.difficulty}
          onChange={(value) => onInputChange('difficulty', value)}
          suggestions={difficultyLevelSuggestions}
          placeholder="Ex: Fácil, Médio, Difícil..."
          required
        />
      </div>
      
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 
                    border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipos de Questões
        </label>
        <div className="flex flex-wrap gap-4">
          <Switch
            label="Múltipla Escolha"
            checked={settings.questionTypes.includes('multiple')}
            onChange={() => onQuestionTypeChange('multiple')}
          />
          <Switch
            label="Verdadeiro/Falso"
            checked={settings.questionTypes.includes('truefalse')}
            onChange={() => onQuestionTypeChange('truefalse')}
          />
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 
                    border-gray-200 dark:border-gray-700">
        <Switch
          label="Incluir explicações para as respostas"
          checked={settings.includeExplanations}
          onChange={(checked) => onInputChange('includeExplanations', checked)}
        />
      </div>
    </div>
  );
};
