import { QuizSettings } from '../types';

export const generateAIPrompt = (settings: QuizSettings): string => {
  const { 
    questionCount, 
    optionCount, 
    topic, 
    questionTypes, 
    includeExplanations, 
    language,
    difficulty 
  } = settings;
  
  // Verificar se há mais de um tipo de questão
  const hasMixedTypes = questionTypes.length > 1;
  
  // Texto para a descrição do tipo de questões
  let questionTypeText;
  if (hasMixedTypes) {
    questionTypeText = `uma mistura de questões de múltipla escolha com ${optionCount} opções e questões de verdadeiro/falso`;
  } else if (questionTypes.includes('multiple')) {
    questionTypeText = `questões de múltipla escolha com ${optionCount} opções cada`;
  } else {
    questionTypeText = 'questões de verdadeiro/falso';
  }
  
  // Texto sobre as explicações
  const explanationsText = includeExplanations 
    ? 'Por favor, inclua uma explicação para cada resposta.' 
    : 'Não é necessário incluir explicações para as respostas.';
  
  // Texto sobre o nível de dificuldade
  const difficultyText = difficulty === 'variado' 
    ? 'Crie questões com diferentes níveis de dificuldade, desde muito fáceis até muito difíceis.' 
    : `O nível de dificuldade deve ser "${difficulty}".`;
  
  let mixedTypesInstruction = '';
  if (hasMixedTypes) {
    mixedTypesInstruction = `\n\nCrie uma mistura de ambos os tipos (múltipla escolha e verdadeiro/falso).
Use o campo "type" em cada questão para indicar o tipo:
- Para questões de múltipla escolha, use: "type": "multiple"
- Para questões de verdadeiro/falso, use: "type": "truefalse" (estas devem ter exatamente 2 opções)`;
  }
  
  return `Crie um quiz sobre "${topic}" com ${questionCount} ${questionTypeText} no idioma ${language === 'pt-BR' ? 'português do Brasil' : language}. ${difficultyText} ${explanationsText}${mixedTypesInstruction}

Por favor, formate sua resposta como um objeto JSON com a seguinte estrutura:
{
  "title": "Título do Quiz",
  "description": "Breve descrição do quiz",
  "questions": [
    {
      "text": "Texto da pergunta aqui?",
      "type": "${hasMixedTypes ? 'multiple ou truefalse' : questionTypes[0]}",
      "options": [
        { "text": "Opção 1", "isCorrect": false },
        { "text": "Opção 2", "isCorrect": true }${questionTypes.includes('multiple') ? ',\n        { "text": "Opção 3", "isCorrect": false }' : ''}${questionTypes.includes('multiple') && optionCount > 3 ? ',\n        { "text": "Opção 4", "isCorrect": false }' : ''}
      ]${includeExplanations ? ',\n      "explanation": "Explicação para a resposta correta aqui."' : ''}
    }
  ]
}

Certifique-se de que:
1. Cada questão tenha exatamente uma resposta correta
2. O conteúdo seja preciso e educativo
3. O JSON esteja formatado corretamente e seja válido
4. Questões de verdadeiro/falso tenham exatamente 2 opções${hasMixedTypes ? '\n5. O campo "type" esteja presente em todas as questões' : ''}
6. As questões atendam ao nível de dificuldade solicitado: "${difficulty}"`;
};