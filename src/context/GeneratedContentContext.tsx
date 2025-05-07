import React, { createContext, useContext, useState } from 'react';

interface GeneratedContentContextType {
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
  clearGeneratedContent: () => void;
}

const GeneratedContentContext = createContext<GeneratedContentContextType | undefined>(undefined);

export const GeneratedContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [generatedContent, setGeneratedContent] = useState<string>('');

  const clearGeneratedContent = () => {
    setGeneratedContent('');
  };

  return (
    <GeneratedContentContext.Provider
      value={{
        generatedContent,
        setGeneratedContent,
        clearGeneratedContent,
      }}
    >
      {children}
    </GeneratedContentContext.Provider>
  );
};

export const useGeneratedContent = (): GeneratedContentContextType => {
  const context = useContext(GeneratedContentContext);
  if (context === undefined) {
    throw new Error('useGeneratedContent must be used within a GeneratedContentProvider');
  }
  return context;
};
