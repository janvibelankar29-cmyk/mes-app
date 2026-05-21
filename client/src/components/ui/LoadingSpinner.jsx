import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LoadingSpinner = ({ className, size = 24, text = 'Loading...' }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2 text-primary", className)}>
      <Loader2 size={size} className="animate-spin" />
      {text && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{text}</span>}
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <LoadingSpinner size={48} text="Initializing MES Environment..." className="text-primary" />
  </div>
);
