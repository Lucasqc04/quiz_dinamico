import React from 'react';
import { Container } from '../components/Layout/Container';
import { UserPreferences } from '../components/Settings/UserPreferences';

export const SettingsPage: React.FC = () => {
  return (
    <Container
      title="Configurações"
      subtitle="Personalize sua experiência de quiz"
    >
      <UserPreferences />
    </Container>
  );
};