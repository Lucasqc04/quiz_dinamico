import { z } from 'zod';

// Option schema
const quizOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Texto da opção não pode estar vazio"),
  isCorrect: z.boolean(),
});

// Question schema
const quizQuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(3, "A questão deve ter pelo menos 3 caracteres"),
  options: z.array(quizOptionSchema).min(2, "São necessárias pelo menos 2 opções")
    .max(8, "Máximo de 8 opções permitido"), // Atualizado para 8 opções
  explanation: z.string().optional(),
  type: z.enum(['multiple', 'truefalse']).optional(),
}).transform(data => ({
  ...data,
  id: data.id || crypto.randomUUID(),
  options: data.options.map(option => ({
    ...option,
    id: option.id || crypto.randomUUID()
  })),
  // Define o tipo baseado no número de opções, se não for especificado
  type: data.type || (data.options.length > 2 ? 'multiple' : 'truefalse')
}));

// Quiz schema - transformação retorna objeto não anulável
export const quizSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema)
    .min(1, "É necessária pelo menos 1 questão")
    .max(30, "Máximo de 30 questões permitido"), // Atualizado para 30 questões
  language: z.string().optional()
}).transform(data => ({
  ...data,
  id: data.id || crypto.randomUUID(),
  // Define 'pt-BR' como idioma padrão se não especificado
  language: data.language || 'pt-BR'
}));

export type QuizSchema = z.infer<typeof quizSchema>;

// Função para validar JSON do quiz
export const validateQuizJson = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    const result = quizSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error };
  }
};