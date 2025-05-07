import { z } from 'zod';

// Option schema
const quizOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean(),
});

// Question schema
const quizQuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(3, "Question must have at least 3 characters"),
  options: z.array(quizOptionSchema).min(2, "At least 2 options are required"),
  explanation: z.string().optional(),
}).transform(data => ({
  ...data,
  id: data.id || crypto.randomUUID(),
  options: data.options.map(option => ({
    ...option,
    id: option.id || crypto.randomUUID()
  })),
}));

// Quiz schema
export const quizSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must have at least 3 characters"),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema).min(1, "At least 1 question is required"),
}).transform(data => ({
  ...data,
  id: data.id || crypto.randomUUID(),
}));

export type QuizSchema = z.infer<typeof quizSchema>;

// Function to validate quiz JSON
export const validateQuizJson = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    return { success: true, data: quizSchema.parse(data) };
  } catch (error) {
    return { success: false, error };
  }
};