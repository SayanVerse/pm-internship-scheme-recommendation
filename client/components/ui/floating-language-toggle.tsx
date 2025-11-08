import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-language";
import { translations } from "@/locales";

const LANGUAGE_OPTIONS = Object.keys(translations) as Array<
  keyof typeof translations
>;

export function FloatingLanguageToggle() {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40 pointer-events-auto">
      {isOpen ? (
        <div className="glass-card p-2 sm:p-3 rounded-xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20">
          <div className="flex flex-col gap-2">
            {LANGUAGE_OPTIONS.map((code) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code);
                  setIsOpen(false);
                }}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                  language === code
                    ? "bg-neutral-900/20 dark:bg-white/30 text-neutral-900 dark:text-white shadow"
                    : "text-neutral-600 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-900/10 dark:hover:bg-white/20",
                )}
              >
                {t(`common.languageNames.${code}`)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="glass-card p-2 sm:p-3 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 hover:bg-white/20 dark:hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
          title="Change language"
        >
          <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-900 dark:text-white" />
        </button>
      )}
    </div>
  );
}
