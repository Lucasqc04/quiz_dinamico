import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateAIPrompt } from '../../utils/generatePrompt';
import { QuizSettings } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Copy, Sparkles, Loader2, Info } from 'lucide-react';
import { generateQuizWithGemini, ModelStrategy, availableModels } from '../../services/openRouterService';
import { useGeneratedContent } from '../../context/GeneratedContentContext';
import { Tooltip } from '../ui/Tooltip';

const initialSettings: QuizSettings = {
  questionCount: null,
  optionCount: null,
  topic: '',
  questionTypes: ['multiple'],
  language: 'pt-BR',
  includeExplanations: true,
  difficulty: '', // Modificado para começar vazio
};

const languageOptions = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en-US', label: 'Inglês' },
  { value: 'es-ES', label: 'Espanhol' },
  { value: 'fr-FR', label: 'Francês' },
];

interface PromptFormProps {
  onGeminiGeneration?: () => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onGeminiGeneration }) => {
  const [settings, setSettings] = useState<QuizSettings>(initialSettings);
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
      validValue = Math.max(1, Math.min(20, numValue));
    } else if (key === 'optionCount') {
      validValue = Math.max(3, Math.min(6, numValue));
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

  const modelStrategyOptions = [
    { value: 'balanced', label: 'Equilibrado (Recomendado)' },
    { value: 'speed', label: 'Priorizar Velocidade' },
    { value: 'quality', label: 'Priorizar Qualidade' },
    { value: 'reliable-json', label: 'Foco em JSON correto' }
  ];

  const showOptionCountInput = settings.questionTypes.includes('multiple');

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
                value={settings.questionCount ?? ''}
                onChange={(e) => handleNumericInputChange('questionCount', e.target.value)}
                onFocus={(e) => e.target.value === '' && setSettings(prev => ({ ...prev, questionCount: null }))}
                placeholder="1-20"
                required
              />
              
              {showOptionCountInput && (
                <Input
                  label="Opções por Questão"
                  type="number"
                  min={3}
                  max={6}
                  value={settings.optionCount ?? ''}
                  onChange={(e) => handleNumericInputChange('optionCount', e.target.value)}
                  onFocus={(e) => e.target.value === '' && setSettings(prev => ({ ...prev, optionCount: null }))}
                  placeholder="3-6"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Idioma das Questões"
                options={languageOptions}
                value={settings.language}
                onChange={(value) => handleInputChange('language', value)}
              />
              
              <Input
                label="Nível de Dificuldade"
                placeholder="Ex: Fácil, Médio, Difícil, Avançado..."
                value={settings.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipos de Questões
              </label>
              <div className="flex flex-wrap gap-4">
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
              {settings.questionTypes.includes('multiple') && settings.questionTypes.includes('truefalse') && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  O quiz terá uma mistura de questões de múltipla escolha e verdadeiro/falso
                </p>
              )}
            </div>
            
            <div className="pt-2">
              <Switch
                label="Incluir explicações para as respostas"
                checked={settings.includeExplanations}
                onChange={(checked) => handleInputChange('includeExplanations', checked)}
              />
            </div>
            
            <div className="mt-6">
              <Button 
                type="submit" 
                className="w-full py-3 text-lg font-medium flex items-center justify-center bg-primary-600 hover:bg-primary-700"
                disabled={!settings.topic || settings.topic.trim() === ''}
              >
                <span className="mr-2">✓</span> Gerar Prompt (Método Recomendado)
              </Button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Após gerar o prompt, copie-o e cole em uma IA como ChatGPT ou Claude para criar seu quiz.
              </p>
            </div>
            
            {error && (
              <div className="p-3 text-sm bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300 rounded-md">
                {error}
              </div>
            )}

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
              
              <div className="mb-4 p-3 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-md text-sm">
                <p><strong>Importante:</strong> Esta opção utiliza modelos de IA gratuitos que podem:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Apresentar instabilidades e falhas ocasionais</li>
                  <li>Demorar mais tempo para responder</li>
                  <li>Gerar resultados de qualidade variável</li>
                  <li>Produzir JSONs com erros de formatação</li>
                </ul>
              </div>
              
              <Select
                label="Estratégia de modelo"
                options={modelStrategyOptions}
                value={modelStrategy}
                onChange={(value) => setModelStrategy(value as ModelStrategy)}
              />
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p className="mb-2">Características das estratégias:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Equilibrado:</strong> Bom balanço entre velocidade e qualidade</li>
                  <li><strong>Velocidade:</strong> Tenta os modelos mais rápidos primeiro</li>
                  <li><strong>Qualidade:</strong> Prioriza modelos com melhor conteúdo, mas mais lentos</li>
                  <li><strong>JSON correto:</strong> Foco em modelos que geram estrutura JSON mais confiável</li>
                </ul>
              </div>
              
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full mt-4 py-3 text-sm sm:text-base flex items-center justify-center"
                onClick={handleGenerateWithGemini}
                disabled={isGenerating || !settings.topic || settings.topic.trim() === ''}
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 mr-2" />
                )}
                {isGenerating ? 'Gerando...' : 'Gerar Quiz Diretamente com IA'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
          <p>
            <strong>Sobre as opções de geração:</strong> O método recomendado (copiar prompt) 
            oferece mais controle e melhores resultados. A opção de geração direta com IA usa 
            modelos gratuitos que podem ser mais limitados, mas oferece a comodidade de obter 
            resultados em um único clique.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};