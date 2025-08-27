import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { cn } from "@/lib/utils";

export function DarkModeToggle({ className }: { className?: string }) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 group",
        isDarkMode 
          ? "bg-gradient-to-r from-blue-600 to-purple-600" 
          : "bg-gradient-to-r from-yellow-400 to-orange-500",
        className,
      )}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 transform rounded-full transition-all duration-300 flex items-center justify-center",
          isDarkMode 
            ? "translate-x-7 bg-gray-800 text-blue-200" 
            : "translate-x-1 bg-white text-yellow-600"
        )}
      >
        {isDarkMode ? (
          <Moon className="h-3 w-3" />
        ) : (
          <Sun className="h-3 w-3" />
        )}
      </span>

      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
        {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
      </div>
    </button>
  );
}
