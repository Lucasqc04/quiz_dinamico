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

export async function generateQuizWithGemini(prompt: string): Promise<string> {
  // Chave de API do OpenRouter
  const OPENROUTER_API_KEY = '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';
  
  if (!OPENROUTER_API_KEY) {
    throw new Error("API key do OpenRouter não encontrada.");
  }

  // Lista ATUALIZADA com modelos REALMENTE disponíveis no OpenRouter (verificados)
  const models = [
    'deepseek/deepseek-r1:free',
    'google/gemini-2.5-pro-exp-03-25:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1t-chimera:free',
    'deepseek/deepseek-v3-0324:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.3-nemotron-super-49b-v1:free',
    'shisa-ai/shisa-v2-llama3.3-70b:free'
  ];

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
          'X-Title': 'QuizMaster',
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
 * Extrai e repara o conteúdo JSON de uma string,
 * lidando com diversos problemas comuns de formatação
 */
function extractAndRepairJson(text: string): string {
  try {
    // Remover qualquer texto antes da primeira chave e após a última chave
    let firstBraceIndex = text.indexOf('{');
    let lastBraceIndex = text.lastIndexOf('}');
    
    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
      // Se não encontrar chaves, tente encontrar em blocos de código
      const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = text.match(codeBlockRegex);
      if (match && match[1]) {
        text = match[1].trim();
        firstBraceIndex = text.indexOf('{');
        lastBraceIndex = text.lastIndexOf('}');
        
        // Se ainda não encontrar, lance um erro
        if (firstBraceIndex === -1 || lastBraceIndex === -1) {
          throw new Error("Não foi possível encontrar um objeto JSON na resposta");
        }
      } else {
        throw new Error("Não foi possível encontrar um objeto JSON na resposta");
      }
    }
    
    // Extrair apenas o conteúdo entre chaves
    let jsonContent = text.substring(firstBraceIndex, lastBraceIndex + 1);
    
    // Correção para problemas comuns em JSON gerado por LLMs
    
    // 1. Corrigir type: multiple sem aspas (erro comum)
    jsonContent = jsonContent.replace(/("type"\s*:\s*)multiple/g, '$1"multiple"');
    
    // 2. Corrigir type: truefalse sem aspas
    jsonContent = jsonContent.replace(/("type"\s*:\s*)truefalse/g, '$1"truefalse"');
    
    // 3. Corrigir questões no singular quando deveriam estar no plural
    if (jsonContent.includes('"question":') && !jsonContent.includes('"questions":')) {
      jsonContent = jsonContent.replace(/"question":/g, '"questions":');
    }
    
    // 4. Corrigir vírgulas extras no final de arrays ou objetos
    jsonContent = jsonContent.replace(/,(\s*[\]}])/g, '$1');
    
    // 5. Adicionar vírgulas faltantes entre objetos em arrays
    jsonContent = jsonContent.replace(/}(\s*){/g, '},$1{');
    
    // 6. Corrigir aspas duplas não escapadas dentro de strings
    // (Esta é uma simplificação, uma solução completa seria mais complexa)
    jsonContent = fixNestedQuotes(jsonContent);
    
    // Tentar validar o JSON para identificar outros problemas
    try {
      JSON.parse(jsonContent);
    } catch (e) {
      console.warn("Problema na validação do JSON reparado:", e);
      console.log("JSON com problemas:", jsonContent);
      
      // Se ainda tiver problemas, tente estratégias mais agressivas de limpeza
      // Isso pode deformar o conteúdo, mas é uma tentativa de recuperação
      jsonContent = attemptJsonRecovery(jsonContent);
    }
    
    return jsonContent;
  } catch (error) {
    console.error("Erro ao extrair e reparar JSON:", error);
    console.log("Texto original:", text);
    
    // Retornar o texto original como último recurso
    return text;
  }
}

/**
 * Tenta consertar o problema de aspas aninhadas em strings JSON
 */
function fixNestedQuotes(json: string): string {
  // Esta é uma solução simplificada que funciona para muitos casos
  // Identifica padrões como: "text": "Este é um "exemplo" de texto"
  
  // Mantém controle de quando estamos dentro de uma string
  let inString = false;
  let result = '';
  let lastChar = '';
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    
    // Se encontrar aspas e não estiver escapado
    if (char === '"' && lastChar !== '\\') {
      // Alterna o estado de estar dentro/fora de uma string
      inString = !inString;
      
      // Se estamos dentro de uma string e a próxima aspas não for o fechamento
      if (inString) {
        let nextQuotePos = json.indexOf('"', i + 1);
        while (nextQuotePos > 0 && json[nextQuotePos - 1] === '\\') {
          nextQuotePos = json.indexOf('"', nextQuotePos + 1);
        }
        
        if (nextQuotePos > 0) {
          // Verifica se há aspas não escapadas entre o início e o fim da string
          const substring = json.substring(i + 1, nextQuotePos);
          if (substring.includes('"') && !substring.includes('\\"')) {
            // Substitui aspas internas por aspas escapadas
            const fixedSubstring = substring.replace(/"/g, '\\"');
            result += '"' + fixedSubstring + '"';
            i = nextQuotePos;
            inString = false;
            continue;
          }
        }
      }
    }
    
    result += char;
    lastChar = char;
  }
  
  return result;
}

/**
 * Tenta estratégias mais agressivas para recuperar JSON inválido
 */
function attemptJsonRecovery(json: string): string {
  // Tenta identificar objetos de alto nível e reconstruir o JSON
  try {
    // 1. Remover caracteres especiais que possam estar causando problemas
    let cleaned = json.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    
    // 2. Tentar validar novamente
    try {
      JSON.parse(cleaned);
      return cleaned; // Se funcionar, retorne a versão limpa
    } catch (e) {
      // Continuar com outras estratégias
    }
    
    // 3. Verificar se a estrutura do objeto questões está correta
    const questionsMatch = cleaned.match(/"questions"\s*:\s*\[([\s\S]*?)\]/);
    if (questionsMatch && questionsMatch[1]) {
      // Tentar reparar o array de questões
      let questions = questionsMatch[1];
      
      // Adicionar vírgulas faltantes entre objetos
      questions = questions.replace(/}(\s*){/g, '},$1{');
      
      // Remover vírgulas extras no final
      questions = questions.replace(/,(\s*$)/g, '');
      
      // Reconstruir o JSON
      const beforeQuestions = cleaned.substring(0, questionsMatch.index);
      const afterQuestions = questionsMatch && questionsMatch.index !== undefined
        ? cleaned.substring(questionsMatch.index + questionsMatch[0].length)
        : '';
      
      cleaned = `${beforeQuestions}"questions": [${questions}]${afterQuestions}`;
    }
    
    return cleaned;
  } catch (error) {
    console.error("Falha na recuperação do JSON:", error);
    return json; // Retornar original se tudo falhar
  }
}
