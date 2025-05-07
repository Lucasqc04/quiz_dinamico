import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateAIPrompt } from '../../utils/generatePrompt';
import { QuizSettings } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Copy, Sparkles, Loader2 } from 'lucide-react';
import { generateQuizWithGemini } from '../../services/openRouterService';
import { useGeneratedContent } from '../../context/GeneratedContentContext';

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
      // Gerar o prompt para enviar ao Gemini
      const prompt = generateAIPrompt(settings);
      
      // Chamar a API do OpenRouter com o Gemini
      const generatedQuiz = await generateQuizWithGemini(prompt);
      
      // Verificar se obtivemos um resultado válido
      if (!generatedQuiz || generatedQuiz.trim() === '') {
        throw new Error("A API retornou um resultado vazio");
      }
      
      // Salvar o conteúdo gerado no contexto
      setGeneratedContent(generatedQuiz);
      
      // Chamar o callback para navegar para a página de importação
      if (onGeminiGeneration) {
        onGeminiGeneration();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao gerar o quiz com Gemini.";
      setError(errorMessage);
      console.error("Erro ao gerar com Gemini:", err);
    } finally {
      setIsGenerating(false);
    }
  };

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
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-primary-600 hover:bg-primary-700"  /* Destacado como recomendado */
                disabled={!settings.topic || settings.topic.trim() === ''}
              >
                <span className="mr-1">✓</span> Gerar Prompt (Recomendado)
              </Button>
              
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1 flex items-center justify-center"
                onClick={handleGenerateWithGemini}
                disabled={isGenerating || !settings.topic || settings.topic.trim() === ''}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Gerando...' : (
                  <>
                    Gerar com Deepseek
                    <span className="ml-1.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">BETA</span>
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="p-3 text-sm bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300 rounded-md">
                {error}
              </div>
            )}
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
            <strong>Método recomendado:</strong> Gerar o prompt e copiá-lo para sua IA favorita (ChatGPT, Claude, etc).
            Após obter a resposta da IA, vá para <strong>Importar</strong> no menu e cole o JSON gerado lá.
            <br/><br/>
            Alternativamente, o botão "Gerar com Deepseek" (em fase beta) tenta criar automaticamente seu 
            quiz usando o modelo Deepseek pela OpenRouter e já redireciona para a página de importação, mas pode apresentar instabilidades.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};