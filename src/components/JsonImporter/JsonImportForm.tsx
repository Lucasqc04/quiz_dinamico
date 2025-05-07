import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { validateQuizJson } from '../../schemas/quizSchema';
import { useQuiz } from '../../context/QuizContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const JsonImportForm: React.FC<{ onImportSuccess: () => void }> = ({ onImportSuccess }) => {
  const { setQuiz } = useQuiz();
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationError(null);
    setIsValid(false);

    try {
      const result = validateQuizJson(jsonInput);
      
      if (result.success) {
        setQuiz(result.data);
        setIsValid(true);
        // Slight delay to show success state before transitioning
        setTimeout(() => {
          onImportSuccess();
        }, 1000);
      } else {
        const error = result.error;
        let errorMessage = 'Invalid JSON format';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = JSON.stringify(error);
        }
        
        setValidationError(errorMessage);
      }
    } catch (error) {
      setValidationError('Failed to parse JSON: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Import Quiz JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextArea
              label="Paste your quiz JSON here"
              placeholder="Paste the JSON response from your AI here..."
              rows={10}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              error={validationError || undefined}
              helper="Your quiz data should be in JSON format with questions, options, and optionally explanations."
              required
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm">
                {isValid && (
                  <span className="text-success-500 dark:text-success-400 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valid quiz format!
                  </span>
                )}
                {validationError && (
                  <span className="text-danger-500 dark:text-danger-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Validation failed
                  </span>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={isValidating || jsonInput.trim() === ''}
                className="flex items-center"
              >
                {isValidating ? 'Validating...' : 'Validate & Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expected JSON Format:
            </h3>
            <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
{`{
  "title": "Quiz Title",
  "description": "Optional quiz description",
  "questions": [
    {
      "text": "Question text?",
      "options": [
        { "text": "Option 1", "isCorrect": false },
        { "text": "Option 2", "isCorrect": true },
        { "text": "Option 3", "isCorrect": false }
      ],
      "explanation": "Optional explanation for the answer"
    },
    // more questions...
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};