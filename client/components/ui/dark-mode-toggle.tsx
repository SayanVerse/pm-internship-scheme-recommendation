import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { cn } from '@/lib/utils';

export function DarkModeToggle({ className }: { className?: string }) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        'dark-mode-toggle group relative',
        isDarkMode && 'dark',
        className
      )}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="flex items-center justify-center">
        {isDarkMode ? (
          <Moon className="h-4 w-4 text-white" />
        ) : (
          <Sun className="h-4 w-4 text-gray-900" />
        )}
      </span>
      
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
      </div>
    </button>
  );
}
