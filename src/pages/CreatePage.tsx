import React from 'react';
import { Container } from '../components/Layout/Container';
import { PromptForm } from '../components/PromptGenerator/PromptForm';

interface CreatePageProps {
  onGeminiGeneration?: () => void;
}

export const CreatePage: React.FC<CreatePageProps> = ({ onGeminiGeneration }) => {
  return (
    <Container
      title="Criar Prompt de Quiz"
      subtitle="Gere um prompt para criar seu quiz com IA"
    >
      <PromptForm onGeminiGeneration={onGeminiGeneration} />
    </Container>
  );
};