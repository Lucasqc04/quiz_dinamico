import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateAIPrompt } from '../../utils/generatePrompt';
import { QuizSettings } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateQuizWithGemini, ModelStrategy } from '../../services/openRouterService';
import { useGeneratedContent } from '../../context/GeneratedContentContext';
import { QuizFormFields } from './FormFields/QuizFormFields';
import { PromptDisplay } from './GeneratedPrompt/PromptDisplay';
import { AIGenerationSection } from './AIGeneration/AIGenerationSection';
import { getLastGeneratorConfig, saveLastGeneratorConfig } from '../../utils/storage';

const initialSettings: QuizSettings = {
  questionCount: null,
  optionCount: null,
  topic: '',
  questionTypes: ['multiple'],
  language: 'pt-BR',
  includeExplanations: true,
  difficulty: '',
};

interface PromptFormProps {
  onGeminiGeneration?: () => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onGeminiGeneration }) => {
  // Carregar última configuração do storage
  const [settings, setSettings] = useState<QuizSettings>(() => {
    const lastConfig = getLastGeneratorConfig();
    return {
      ...initialSettings,
      questionCount: lastConfig.questionCount,
      optionCount: lastConfig.optionCount,
      difficulty: lastConfig.difficulty,
    };
  });

  // Salvar configurações quando mudarem
  useEffect(() => {
    saveLastGeneratorConfig({
      questionCount: settings.questionCount,
      optionCount: settings.optionCount,
      difficulty: settings.difficulty,
    });
  }, [settings.questionCount, settings.optionCount, settings.difficulty]);

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setGeneratedContent } = useGeneratedContent();
  const [modelStrategy, setModelStrategy] = useState<ModelStrategy>('balanced');

  // Função segura para lidar com mudanças de valores numéricos
  const handleNumericInputChange = (key: 'questionCount' | 'optionCount', value: string) => {
    if (value === '') {
      setSettings(prev => ({ ...prev, [key]: null }));
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    let validValue = numValue;
    
    if (key === 'questionCount') {
      validValue = Math.max(1, Math.min(30, numValue)); // Alterado para 30
    } else if (key === 'optionCount') {
      validValue = Math.max(2, Math.min(8, numValue)); // Alterado para 8
    }
    
    setSettings(prev => ({ ...prev, [key]: validValue }));
  };

  // Função para atualizar texto e valores booleanos
  const handleInputChange = (key: keyof QuizSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Função específica para os tipos de pergunta (checkboxes)
  const handleQuestionTypeChange = (type: 'multiple' | 'truefalse') => {
    setSettings(prev => {
      const isSelected = prev.questionTypes.includes(type);
      
      if (isSelected && prev.questionTypes.length === 1) {
        return prev;
      }
      
      const newTypes = isSelected 
        ? prev.questionTypes.filter(t => t !== type) 
        : [...prev.questionTypes, type];
      
      return { ...prev, questionTypes: newTypes };
    });
  };

  // Gera apenas o prompt (sem chamar API)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prompt = generateAIPrompt(settings);
      setGeneratedPrompt(prompt);
      setError(null);
    } catch (err) {
      setError("Erro ao gerar o prompt. Verifique os parâmetros.");
      console.error("Erro na geração do prompt:", err);
    }
  };

  // Copia o prompt para a área de transferência
  const copyToClipboard = () => {
    if (!generatedPrompt) return;
    
    navigator.clipboard.writeText(generatedPrompt)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Erro ao copiar texto:", err);
        setError("Não foi possível copiar o texto para a área de transferência.");
      });
  };

  // Função que chama a API OpenRouter com o Gemini
  const handleGenerateWithGemini = async () => {
    if (!settings.topic || settings.topic.trim() === '') {
      setError("Por favor, informe o tema do quiz.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = generateAIPrompt(settings);
      
      try {
        const generatedQuiz = await generateQuizWithGemini(prompt, modelStrategy);
        
        if (!generatedQuiz || generatedQuiz.trim() === '') {
          throw new Error("A API retornou um resultado vazio");
        }
        
        try {
          JSON.parse(generatedQuiz);
          
          setGeneratedContent(generatedQuiz);
          
          if (onGeminiGeneration) {
            onGeminiGeneration();
          }
        } catch (jsonError) {
          setError(`O JSON gerado está inválido. Tente gerar novamente ou use o prompt manual.`);
          setGeneratedPrompt(prompt);
        }
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : "Erro ao gerar o quiz.";
        setError(`${errorMessage} Tente o método manual: gere o prompt e cole-o em uma IA como o ChatGPT.`);
        setGeneratedPrompt(prompt);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao preparar o prompt.";
      setError(errorMessage);
      console.error("Erro ao gerar:", err);
    } finally {
      setIsGenerating(false);
    }
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
            <QuizFormFields
              settings={settings}
              onNumericChange={handleNumericInputChange}
              onInputChange={handleInputChange}
              onQuestionTypeChange={handleQuestionTypeChange}
            />
            
            {/* Botão principal e mensagem de erro */}
            <div className="mt-6">
              <Button 
                type="submit" 
                className="w-full py-3 text-lg font-medium flex items-center justify-center bg-primary-600 hover:bg-primary-700"
                disabled={!settings.topic || settings.topic.trim() === ''}
              >
                <span className="mr-2">✓</span> Gerar Prompt (Método Recomendado)
              </Button>
            </div>

            {error && (
              <div className="p-3 text-sm bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300 rounded-md">
                {error}
              </div>
            )}

            {generatedPrompt && (
              <PromptDisplay
                prompt={generatedPrompt}
                onCopy={copyToClipboard}
                isCopied={copied}
              />
            )}

            <AIGenerationSection
              modelStrategy={modelStrategy}
              onStrategyChange={(value) => setModelStrategy(value)}
              onGenerate={handleGenerateWithGemini}
              isGenerating={isGenerating}
              isDisabled={!settings.topic || settings.topic.trim() === ''}
            />
          </form>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
          <p><strong>Sobre as opções de geração:</strong> O método recomendado oferece mais controle e melhores resultados...</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};