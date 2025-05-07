import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { validateQuizJson } from '../../schemas/quizSchema';
import { useQuiz } from '../../context/QuizContext';
import { useGeneratedContent } from '../../context/GeneratedContentContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Quiz, QuizQuestion } from '../../types';

export const JsonImportForm: React.FC<{ onImportSuccess: () => void }> = ({ onImportSuccess }) => {
  const { setQuiz } = useQuiz();
  const { generatedContent, clearGeneratedContent } = useGeneratedContent();
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [autoValidateTriggered, setAutoValidateTriggered] = useState(false);

  // Quando receber conteúdo gerado, preencher automaticamente o campo de entrada
  useEffect(() => {
    if (generatedContent && !autoValidateTriggered) {
      setJsonInput(generatedContent);
      setAutoValidateTriggered(true);
      
      // Opcional: validar automaticamente após um breve atraso
      const timer = setTimeout(() => {
        handleValidate(generatedContent);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [generatedContent]);

  const handleValidate = (content: string) => {
    setIsValidating(true);
    setValidationError(null);
    setIsValid(false);

    try {
      const result = validateQuizJson(content);
      
      if (result.success && result.data) {
        
        const quizData: Quiz = {
          id: result.data.id || crypto.randomUUID(),  
          title: result.data.title || "Quiz Sem Título",  
          description: result.data.description,
          language: result.data.language || 'pt-BR',
          questions: result.data.questions.map(q => ({
            id: q.id || crypto.randomUUID(),
            text: q.text,
            options: q.options,
            explanation: q.explanation,
            type: q.type || (q.options.length > 2 ? 'multiple' : 'truefalse')
          } as QuizQuestion))
        };
        
        setQuiz(quizData);
        setIsValid(true);
        
        // Limpar o conteúdo gerado após uso bem-sucedido
        clearGeneratedContent();
        
        // Slight delay to show success state before transitioning
        setTimeout(() => {
          onImportSuccess();
        }, 1000);
      } else {
        const error = result.error;
        let errorMessage = 'Formato JSON inválido';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = JSON.stringify(error);
        }
        
        setValidationError(errorMessage);
      }
    } catch (error) {
      setValidationError('Falha ao analisar JSON: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValidate(jsonInput);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Importar Quiz JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextArea
              label="Cole seu JSON de quiz aqui"
              placeholder="Cole a resposta JSON da sua IA aqui..."
              rows={10}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              error={validationError || undefined}
              helper="Seus dados de quiz devem estar no formato JSON com perguntas, opções e, opcionalmente, explicações."
              required
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm">
                {isValid && (
                  <span className="text-success-500 dark:text-success-400 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Formato de quiz válido!
                  </span>
                )}
                {validationError && (
                  <span className="text-danger-500 dark:text-danger-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Falha na validação
                  </span>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={isValidating || jsonInput.trim() === ''}
                className="flex items-center"
              >
                {isValidating ? 'Validando...' : 'Validar e Continuar'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato JSON Esperado:
            </h3>
            <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
{`{
  "title": "Título do Quiz",
  "description": "Descrição opcional do quiz",
  "questions": [
    {
      "text": "Texto da pergunta?",
      "options": [
        { "text": "Opção 1", "isCorrect": false },
        { "text": "Opção 2", "isCorrect": true },
        { "text": "Opção 3", "isCorrect": false }
      ],
      "explanation": "Explicação opcional para a resposta"
    },
    // mais questões...
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};