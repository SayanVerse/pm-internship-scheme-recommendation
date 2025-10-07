import { en } from "./en";
import { hi } from "./hi";
import { bn } from "./bn";

export const translations = {
  en,
  hi,
  bn,
} as const;

export type SupportedLanguage = keyof typeof translations;
