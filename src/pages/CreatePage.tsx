import React from 'react';
import { Container } from '../components/Layout/Container';
import { PromptForm } from '../components/PromptGenerator/PromptForm';

export const CreatePage: React.FC = () => {
  return (
    <Container
      title="Criar Prompt de Quiz"
      subtitle="Gere um prompt para criar seu quiz com IA"
    >
      <PromptForm />
    </Container>
  );
};