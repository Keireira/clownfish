export type CharEntry = [string, string];

export interface Category {
  name: string;
  chars: CharEntry[];
}

export type ThemeChoice = "auto" | "light" | "dark";

export type LanguageChoice = "auto" | "en" | "ru" | "es" | "ja";

const DISPLAY_MAP: Record<string, string> = {
  "\u00A0": "⍽",   // non-breaking space → shouldered open box
  "\u200B": "╌",   // zero-width space → box drawings light double dash
};

export function displayChar(char: string): string {
  return DISPLAY_MAP[char] ?? char;
}
