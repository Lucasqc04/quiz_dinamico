import { QuizSettings } from '../types';

export const generateAIPrompt = (settings: QuizSettings): string => {
  const { questionCount, optionCount, topic, questionType, includeExplanations } = settings;
  
  const questionTypeText = questionType === 'multiple' 
    ? `questões de múltipla escolha com ${optionCount} opções cada` 
    : 'questões de verdadeiro/falso';
  
  const explanationsText = includeExplanations 
    ? 'Por favor, inclua uma explicação para cada resposta.' 
    : 'Não é necessário incluir explicações para as respostas.';
  
  return `Crie um quiz sobre "${topic}" com ${questionCount} ${questionTypeText}. ${explanationsText}

Por favor, formate sua resposta como um objeto JSON com a seguinte estrutura:
{
  "title": "Título do Quiz",
  "description": "Breve descrição do quiz",
  "questions": [
    {
      "text": "Texto da pergunta aqui?",
      "options": [
        { "text": "Opção 1", "isCorrect": false },
        { "text": "Opção 2", "isCorrect": true },
        { "text": "Opção 3", "isCorrect": false }${questionType === 'multiple' && optionCount > 3 ? ',\n        { "text": "Opção 4", "isCorrect": false }' : ''}
      ]${includeExplanations ? ',\n      "explanation": "Explicação para a resposta correta aqui."' : ''}
    }
  ]
}

Certifique-se de que:
1. Cada questão tenha exatamente uma resposta correta
2. O conteúdo seja preciso e educativo
3. O JSON esteja formatado corretamente e seja válido`;
};