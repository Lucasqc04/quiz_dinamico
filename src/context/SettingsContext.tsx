import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserPreferences } from '../types';
import { DEFAULT_PREFERENCES, getUserPreferences, saveUserPreferences } from '../utils/storage';

interface SettingsContextType {
  settings: UserPreferences;
  updateSettings: (newSettings: Partial<UserPreferences>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserPreferences>(() => getUserPreferences());

  useEffect(() => {
    // Save settings to localStorage whenever they change
    saveUserPreferences(settings);
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserPreferences>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_PREFERENCES);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};