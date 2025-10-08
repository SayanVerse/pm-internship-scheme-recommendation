import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-language";
import { translations } from "@/locales";

const LANGUAGE_OPTIONS = Object.keys(translations) as Array<
  keyof typeof translations
>;

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className={cn("flex gap-1 sm:gap-2", className)}>
      {LANGUAGE_OPTIONS.map((code) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={cn(
            "px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300",
            language === code
              ? "bg-neutral-900/10 dark:bg-white/30 text-neutral-900 dark:text-white shadow"
              : "text-neutral-600 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-900/5 dark:hover:bg-white/10",
          )}
        >
          {t(`common.languageNames.${code}`)}
        </button>
      ))}
    </div>
  );
}
