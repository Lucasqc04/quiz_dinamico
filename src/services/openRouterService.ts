export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
  created: number;
  model: string;
}

export interface OpenRouterError {
  error: string;
  message: string;
  status?: number;
}

// Tipo para representar os modelos disponíveis com suas características
export interface AIModel {
  id: string;         // ID do modelo para a API
  name: string;       // Nome amigável para exibição
  speed: 'rápido' | 'médio' | 'lento'; // Velocidade relativa
  quality: 'básica' | 'boa' | 'excelente'; // Qualidade das respostas
  description: string; // Descrição curta do modelo
}

// Modelos disponíveis categorizados
export const availableModels: AIModel[] = [
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini Flash',
    speed: 'rápido',
    quality: 'boa',
    description: 'Rápido e eficiente, boas respostas na maioria dos casos.'
  },
  {
    id: 'google/gemini-2.5-pro-exp-03-25:free',
    name: 'Gemini Pro',
    speed: 'médio',
    quality: 'excelente',
    description: 'Excelente qualidade, bom equilíbrio entre velocidade e precisão.'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    speed: 'médio',
    quality: 'excelente',
    description: 'Mais preciso para tarefas complexas e estruturadas.'
  },
  {
    id: 'deepseek/deepseek-v3-base:free',
    name: 'DeepSeek Base',
    speed: 'rápido',
    quality: 'boa',
    description: 'Bom desempenho geral para quizzes de dificuldade média.'
  },
  {
    id: 'tngtech/deepseek-r1t-chimera:free',
    name: 'DeepSeek Chimera',
    speed: 'lento',
    quality: 'excelente',
    description: 'Excelente para formatar corretamente o JSON e conteúdo detalhado.'
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 (8B)',
    speed: 'rápido',
    quality: 'básica',
    description: 'Mais rápido, mas com respostas mais simples.'
  },
  {
    id: 'meta-llama/llama-3.3-nemotron-super-49b-v1:free',
    name: 'Llama 3.3 Nemotron',
    speed: 'lento',
    quality: 'excelente',
    description: 'Grande modelo de linguagem com excelente qualidade de conteúdo.'
  },
  {
    id: 'shisa-ai/shisa-v2-llama3.3-70b:free',
    name: 'Shisa V2 (70B)',
    speed: 'lento',
    quality: 'excelente',
    description: 'Modelo grande com alta precisão e raciocínio avançado.'
  }
];

// Diferentes estratégias de ordenação pré-definidas
export type ModelStrategy = 'balanced' | 'speed' | 'quality' | 'reliable-json';

export function getModelsByStrategy(strategy: ModelStrategy): string[] {
  switch (strategy) {
    case 'speed':
      // Prioriza velocidade sobre qualidade
      return availableModels
        .sort((a, b) => {
          const speedOrder = {'rápido': 0, 'médio': 1, 'lento': 2};
          return speedOrder[a.speed] - speedOrder[b.speed];
        })
        .map(model => model.id);
    
    case 'quality':
      // Prioriza qualidade sobre velocidade
      return availableModels
        .sort((a, b) => {
          const qualityOrder = {'excelente': 0, 'boa': 1, 'básica': 2};
          return qualityOrder[a.quality] - qualityOrder[b.quality];
        })
        .map(model => model.id);
    
    case 'reliable-json':
      // Prioriza modelos que entregam JSON mais consistente
      return [
        'tngtech/deepseek-r1t-chimera:free',
        'deepseek/deepseek-r1:free',
        'google/gemini-2.5-pro-exp-03-25:free',
        'deepseek/deepseek-v3-base:free',
        'shisa-ai/shisa-v2-llama3.3-70b:free',
        'meta-llama/llama-3.3-nemotron-super-49b-v1:free',
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.1-8b-instruct:free',
      ];
    
    case 'balanced':
    default:
      // Estratégia padrão equilibrada
      return [
        'deepseek/deepseek-v3-base:free',
        'google/gemini-2.0-flash-exp:free',
        'deepseek/deepseek-r1:free',
        'google/gemini-2.5-pro-exp-03-25:free',
        'tngtech/deepseek-r1t-chimera:free',
        'meta-llama/llama-3.1-8b-instruct:free',
        'meta-llama/llama-3.3-nemotron-super-49b-v1:free',
        'shisa-ai/shisa-v2-llama3.3-70b:free'
      ];
  }
}

export async function generateQuizWithGemini(prompt: string, strategy: ModelStrategy = 'balanced'): Promise<string> {
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  console.log(`Estratégia selecionada: ${strategy}`);

  if (!OPENROUTER_API_KEY) {
    throw new Error("API key do OpenRouter não encontrada. Certifique-se de configurá-la como variável de ambiente.");
  }

  // Obter a lista de modelos ordenados pela estratégia escolhida
  const models = getModelsByStrategy(strategy);

  console.log("Chave de API carregada:", OPENROUTER_API_KEY);  

  let lastError: Error | null = null;
  let successfulModel = '';

  for (const model of models) {
    try {
      console.log(`Tentando gerar quiz com o modelo: ${model}`);
      
      // Criando um prompt melhorado com instruções específicas para JSON válido
      const enhancedPrompt = `
${prompt}

INSTRUÇÕES DE FORMATO:
- Responda APENAS com JSON válido
- NÃO inclua blocos de código markdown (como \`\`\`json)
- NÃO inclua explicações, pensamentos ou qualquer texto que não faça parte do JSON
- Certifique-se de que todas as strings estão entre aspas duplas
- Verifique se todos os campos (type, isCorrect, etc.) estão corretamente formatados
- O JSON deve começar com { e terminar com } sem nenhum caractere antes ou depois
`;
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'HastyQuiz',
        },
        body: JSON.stringify({
          model,
          messages: [{ 
            role: 'user', 
            content: enhancedPrompt
          }],
          temperature: 0.5,           // Valor mais baixo para ser mais determinístico
          max_tokens: 4000,
          top_p: 0.9,
          frequency_penalty: 0.2      // Evita repetições
        }),
      });

      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('Resposta de erro detalhada:', errorData);
          
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage += `: ${errorData.error}`;
            } else if (typeof errorData.error === 'object') {
              errorMessage += `: ${JSON.stringify(errorData.error)}`;
            }
          }
        } catch (parseError) {
          errorMessage += ` (Não foi possível analisar o erro: ${response.statusText})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error("Resposta recebida em formato inesperado: " + JSON.stringify(data));
      }
      
      const firstChoice = data.choices[0];
      if (!firstChoice.message || typeof firstChoice.message.content !== 'string') {
        throw new Error("Resposta não contém conteúdo de texto válido");
      }
      
      let content = firstChoice.message.content.trim();
      
      if (content === '') {
        throw new Error("O modelo retornou uma resposta vazia");
      }
      
      // Extrair e corrigir JSON da resposta
      content = extractAndRepairJson(content);
      
      // Verificação final de JSON válido
      try {
        JSON.parse(content);
      } catch (jsonError) {
        console.error("JSON inválido:", content);
        const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
        throw new Error(`O modelo retornou dados que não são um JSON válido: ${errorMessage}`);
      }
      
      successfulModel = model;
      console.log(`Quiz gerado com sucesso usando o modelo: ${model}`);
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Erro ao usar o modelo ${model}:`, errorMessage);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw new Error(
    `Todos os modelos disponíveis falharam. ${successfulModel ? 
      `Último modelo tentado: ${successfulModel}. ` : 
      ''}Último erro: ${lastError?.message || 'Desconhecido'}`
  );
}

/**
 * Extrai o conteúdo JSON presente entre a primeira e a última chave.
 */
function extractAndRepairJson(text: string): string {
  const firstBraceIndex = text.indexOf('{');
  const lastBraceIndex = text.lastIndexOf('}');
  if (firstBraceIndex === -1 || lastBraceIndex === -1) {
    throw new Error("Não foi possível encontrar um objeto JSON na resposta");
  }
  return text.substring(firstBraceIndex, lastBraceIndex + 1);
}
