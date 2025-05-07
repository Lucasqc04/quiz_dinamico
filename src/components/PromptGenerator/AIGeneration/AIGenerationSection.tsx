import React from 'react';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { Tooltip } from '../../ui/Tooltip';
import { ModelStrategy } from '../../../services/openRouterService';

interface AIGenerationSectionProps {
  modelStrategy: ModelStrategy;
  onStrategyChange: (value: ModelStrategy) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
}

const modelStrategyOptions = [
  { value: 'balanced', label: 'Equilibrado (Recomendado)' },
  { value: 'speed', label: 'Priorizar Velocidade' },
  { value: 'quality', label: 'Priorizar Qualidade' },
  { value: 'reliable-json', label: 'Foco em JSON correto' }
];

export const AIGenerationSection: React.FC<AIGenerationSectionProps> = ({
  modelStrategy,
  onStrategyChange,
  onGenerate,
  isGenerating,
  isDisabled,
}) => {
  return (
    <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Geração Direta com IA
        </h3>
        <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
          BETA
        </span>
        <Tooltip 
          content="Usamos modelos gratuitos através do OpenRouter, o que pode limitar a qualidade e confiabilidade dos resultados. O método manual é mais confiável."
          position="bottom"
        >
          <Info className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
        </Tooltip>
      </div>

      {/* ... resto do seu código de avisos e opções ... */}
      
      <Select
        label="Estratégia de modelo"
        options={modelStrategyOptions}
        value={modelStrategy}
        onChange={(value) => onStrategyChange(value as ModelStrategy)}
      />
      
      <Button 
        type="button" 
        variant="secondary" 
        className="w-full mt-4 py-3 text-sm sm:text-base flex items-center justify-center"
        onClick={onGenerate}
        disabled={isDisabled || isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5 mr-2" />
        )}
        {isGenerating ? 'Gerando...' : 'Gerar Quiz Diretamente com IA'}
      </Button>
    </div>
  );
};
