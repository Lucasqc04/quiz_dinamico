import React from 'react';
import { motion } from 'framer-motion';

interface ContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, title, subtitle }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {(title || subtitle) && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
};