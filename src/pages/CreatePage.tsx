import React from 'react';
import { Container } from '../components/Layout/Container';
import { PromptForm } from '../components/PromptGenerator/PromptForm';

export const CreatePage: React.FC = () => {
  return (
    <Container
      title="Create Quiz Prompt"
      subtitle="Generate a prompt to create your quiz with AI"
    >
      <PromptForm />
    </Container>
  );
};