import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { translations, type SupportedLanguage } from "@/locales";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: unknown,
          containerId: string,
        ) => void;
      };
    };
  }
}

type TranslationValue = string | number | TranslationDictionary;

type TranslationDictionary = {
  [key: string]: TranslationValue;
};

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "app-language";
const DEFAULT_LANGUAGE: SupportedLanguage = "en";

function resolveTranslation(
  lang: SupportedLanguage,
  key: string,
): TranslationValue | undefined {
  const segments = key.split(".");
  let node: TranslationValue = translations[lang];

  for (const segment of segments) {
    if (typeof node === "object" && node !== null) {
      node = (node as TranslationDictionary)[segment];
    } else {
      return undefined;
    }
  }

  return node;
}

function formatValue(
  value: TranslationValue,
  params?: Record<string, string | number>,
): string {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (!params) return value;
    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
      return acc.replaceAll(`{{${paramKey}}}`, String(paramValue));
    }, value);
  }
  return "";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    const stored = window.localStorage.getItem(STORAGE_KEY) as
      | SupportedLanguage
      | null;
    if (stored && stored in translations) return stored;
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (next: SupportedLanguage) => {
    setLanguageState(next);
  };

  const t = useMemo(() => {
    const translate = (key: string, params?: Record<string, string | number>) => {
      let result = resolveTranslation(language, key);
      if (result === undefined) {
        result = resolveTranslation(DEFAULT_LANGUAGE, key);
      }
      if (result === undefined) {
        return key;
      }
      return formatValue(result, params);
    };
    return translate;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
}
