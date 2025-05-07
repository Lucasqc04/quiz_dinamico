import React from 'react';
import { Container } from '../components/Layout/Container';
import { JsonImportForm } from '../components/JsonImporter/JsonImportForm';

interface ImportPageProps {
  onImportSuccess: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onImportSuccess }) => {
  return (
    <Container
      title="Importar Quiz"
      subtitle="Cole seu JSON de quiz gerado por IA para começar"
    >
      <JsonImportForm onImportSuccess={onImportSuccess} />
    </Container>
  );
};