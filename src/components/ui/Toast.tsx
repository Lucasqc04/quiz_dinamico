import React from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'success' | 'destructive' | 'warning' | 'info';
  duration?: number;
}

interface ToastState {
  toasts: Array<ToastProps & { id: string }>;
}

let toastState: ToastState = {
  toasts: [],
};

let listeners: Array<(state: ToastState) => void> = [];

function updateState(newState: ToastState) {
  toastState = newState;
  listeners.forEach((listener) => listener(toastState));
}

const Toast: React.FC<ToastProps & { id: string; onClose: () => void }> = ({ title, description, variant = 'info', id, onClose }) => {
  // Ícone com base na variante
  const Icon = {
    success: CheckCircle,
    destructive: XCircle,
    warning: AlertCircle,
    info: Info,
  }[variant];

  const variantClasses = {
    success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
    destructive: 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
    warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
    info: 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
  }[variant];

  const iconClasses = {
    success: 'text-success-500 dark:text-success-400',
    destructive: 'text-danger-500 dark:text-danger-400',
    warning: 'text-warning-500 dark:text-warning-400',
    info: 'text-primary-500 dark:text-primary-400',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`w-full max-w-md rounded-lg border shadow-lg p-4 flex gap-3 ${variantClasses}`}
    >
      <div className={iconClasses}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
        <X className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

// Componente que renderiza todos os toasts
const ToastContainer: React.FC = () => {
  const [state, setState] = React.useState<ToastState>(toastState);

  React.useEffect(() => {
    const listener = (newState: ToastState) => {
      setState({ ...newState });
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {state.toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => {
              updateState({
                toasts: toastState.toasts.filter((t) => t.id !== toast.id),
              });
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Inicializa o componente de toast uma vez
let toastContainerElement: HTMLDivElement | null = null;
function ensureToastContainer() {
  if (!toastContainerElement) {
    toastContainerElement = document.createElement('div');
    document.body.appendChild(toastContainerElement);
    const root = createRoot(toastContainerElement);
    root.render(<ToastContainer />);
  }
}

// Função para criar um toast
export function toast(props: ToastProps) {
  ensureToastContainer();
  
  const id = Math.random().toString(36).substring(2, 9);
  const toastProps = {
    ...props,
    id,
    duration: props.duration ?? 5000,
  };
  
  updateState({
    toasts: [...toastState.toasts, toastProps],
  });
  
  // Auto-remove o toast após a duração
  setTimeout(() => {
    updateState({
      toasts: toastState.toasts.filter((t) => t.id !== id),
    });
  }, toastProps.duration);
  
  return id;
}
