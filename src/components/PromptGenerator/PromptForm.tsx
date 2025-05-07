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
  questionCount: 5,
  optionCount: 4,
  topic: '',
  questionTypes: ['multiple'],
  language: 'pt-BR',
  includeExplanations: true,
  difficulty: 'médio', // Valor padrão
};

const languageOptions = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en-US', label: 'Inglês' },
  { value: 'es-ES', label: 'Espanhol' },
  { value: 'fr-FR', label: 'Francês' },
];

// Opções de dificuldade pré-definidas
const difficultyOptions = [
  { value: 'muito fácil', label: 'Muito Fácil' },
  { value: 'fácil', label: 'Fácil' },
  { value: 'médio', label: 'Médio' },
  { value: 'difícil', label: 'Difícil' },
  { value: 'muito difícil', label: 'Muito Difícil' },
  { value: 'variado', label: 'Níveis Variados' },
  { value: 'personalizado', label: 'Personalizado...' },
];

interface PromptFormProps {
  onGeminiGeneration?: () => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onGeminiGeneration }) => {
  const [settings, setSettings] = useState<QuizSettings>(initialSettings);
  const [customDifficulty, setCustomDifficulty] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setGeneratedContent } = useGeneratedContent();
  const [modelStrategy, setModelStrategy] = useState<ModelStrategy>('balanced');

  // Função segura para lidar com mudanças de valores numéricos
  const handleNumericInputChange = (key: 'questionCount' | 'optionCount', value: string) => {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue)) return; // Ignora valores não numéricos
    
    let validValue = numValue;
    
    // Aplica limites para cada campo
    if (key === 'questionCount') {
      validValue = Math.max(1, Math.min(20, numValue)); // Entre 1 e 20
    } else if (key === 'optionCount') {
      validValue = Math.max(3, Math.min(6, numValue)); // Entre 3 e 6
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
      // Verifica se o tipo já está selecionado
      const isSelected = prev.questionTypes.includes(type);
      
      // Não remove se for o último item selecionado
      if (isSelected && prev.questionTypes.length === 1) {
        return prev;
      }
      
      // Adiciona ou remove o tipo
      const newTypes = isSelected 
        ? prev.questionTypes.filter(t => t !== type) 
        : [...prev.questionTypes, type];
      
      return { ...prev, questionTypes: newTypes };
    });
  };

  // Função para lidar com mudança na dificuldade
  const handleDifficultyChange = (value: string) => {
    setSettings(prev => ({ ...prev, difficulty: value }));
    // Resetar campo personalizado se não for a opção personalizada
    if (value !== 'personalizado') {
      setCustomDifficulty('');
    }
  };

  // Função para lidar com mudança na dificuldade personalizada
  const handleCustomDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDifficulty(value);
    // Atualizar a configuração com o valor personalizado
    setSettings(prev => ({ ...prev, difficulty: value }));
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
      // Gerar o prompt para enviar ao modelo
      const prompt = generateAIPrompt(settings);
      
      try {
        // Chamar a API do OpenRouter com a estratégia de modelo selecionada
        const generatedQuiz = await generateQuizWithGemini(prompt, modelStrategy);
        
        // Verificar se obtivemos um resultado válido
        if (!generatedQuiz || generatedQuiz.trim() === '') {
          throw new Error("A API retornou um resultado vazio");
        }
        
        try {
          // Validar o JSON antes de prosseguir
          JSON.parse(generatedQuiz);
          
          // Salvar o conteúdo gerado no contexto
          setGeneratedContent(generatedQuiz);
          
          // Chamar o callback para navegar para a página de importação
          if (onGeminiGeneration) {
            onGeminiGeneration();
          }
        } catch (jsonError) {
          // Erro na validação do JSON, mas temos um conteúdo
          setError(`O JSON gerado está inválido. Tente gerar novamente ou use o prompt manual.`);
          // Ainda assim, vamos gerar o prompt para que o usuário possa usar manualmente
          setGeneratedPrompt(prompt);
        }
      } catch (apiError) {
        // Erro na chamada da API
        const errorMessage = apiError instanceof Error ? apiError.message : "Erro ao gerar o quiz.";
        setError(`${errorMessage} Tente o método manual: gere o prompt e cole-o em uma IA como o ChatGPT.`);
        // Gerar o prompt para uso manual
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

  // Estratégias de modelo disponíveis para o dropdown
  const modelStrategyOptions = [
    { value: 'balanced', label: 'Equilibrado (Recomendado)' },
    { value: 'speed', label: 'Priorizar Velocidade' },
    { value: 'quality', label: 'Priorizar Qualidade' },
    { value: 'reliable-json', label: 'Foco em JSON correto' }
  ];

  // Determina se o número de opções deve ser ajustável
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
                value={settings.questionCount}
                onChange={(e) => handleNumericInputChange('questionCount', e.target.value)}
                required
              />
              
              {showOptionCountInput && (
                <Input
                  label="Opções por Questão"
                  type="number"
                  min={3}
                  max={6}
                  value={settings.optionCount}
                  onChange={(e) => handleNumericInputChange('optionCount', e.target.value)}
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
              
              <Select
                label="Nível de Dificuldade"
                options={difficultyOptions}
                value={settings.difficulty === customDifficulty && settings.difficulty !== 'personalizado' ? 'personalizado' : settings.difficulty}
                onChange={handleDifficultyChange}
              />
            </div>
            
            {settings.difficulty === 'personalizado' && (
              <Input
                label="Descreva o nível de dificuldade"
                placeholder="Ex: Adequado para estudantes do ensino médio"
                value={customDifficulty}
                onChange={handleCustomDifficultyChange}
                required={settings.difficulty === 'personalizado'}
              />
            )}
            
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
            
            {/* Botão principal para gerar prompt - FLUXO RECOMENDADO */}
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

            {/* MOVIDO: Caixa de prompt gerado aparece aqui agora */}
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
            
            {/* Seção de geração com IA - Agora aparece DEPOIS da caixa de prompt */}
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