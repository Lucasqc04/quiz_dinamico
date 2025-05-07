import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { Copy } from 'lucide-react';

interface PromptDisplayProps {
  prompt: string;
  onCopy: () => void;
  isCopied: boolean;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({
  prompt,
  onCopy,
  isCopied,
}) => {
  return (
    <motion.div 
      className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md relative"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Copie este prompt para sua IA favorita:
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCopy}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Copy className="h-4 w-4 mr-1" />
          {isCopied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
      <pre className="text-xs sm:text-sm bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap">
        {prompt}
      </pre>
    </motion.div>
  );
};
