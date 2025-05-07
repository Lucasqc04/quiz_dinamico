import React from 'react';
import { Container } from '../components/Layout/Container';
import { JsonImportForm } from '../components/JsonImporter/JsonImportForm';

interface ImportPageProps {
  onImportSuccess: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onImportSuccess }) => {
  return (
    <Container
      title="Import Quiz"
      subtitle="Paste your AI-generated quiz JSON to start"
    >
      <JsonImportForm onImportSuccess={onImportSuccess} />
    </Container>
  );
};