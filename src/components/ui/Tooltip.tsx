import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Configurar posição do tooltip - garantindo que não seja cortado
  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2 origin-bottom',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2 origin-top',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2 origin-right',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2 origin-left',
  }[position];

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionStyles} max-w-xs bg-gray-900 text-gray-100 dark:bg-gray-800 dark:text-gray-100 text-xs p-2 rounded shadow-lg`}
            style={{
              // Garantir que o tooltip não seja cortado nas bordas
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
