export type CharEntry = [string, string];

export interface Category {
	name: string;
	chars: CharEntry[];
}

export type ThemeChoice = 'auto' | 'light' | 'dark';

export type LanguageChoice = 'auto' | 'en' | 'ru' | 'es' | 'ja';

export interface Shortcut {
	trigger: string;
	expansion: string;
}

export interface StopListEntry {
	exe: string;
	expansion: boolean;
	hints: boolean;
}

const DISPLAY_MAP: Record<string, string> = {
	' ': '⍽', // non-breaking space -> shouldered open box
	'​': '╌' // zero-width space -> box drawings light double dash
};

export function displayChar(char: string): string {
	return DISPLAY_MAP[char] ?? char;
}
