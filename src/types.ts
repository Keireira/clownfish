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
	variables?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Plugin system
// ---------------------------------------------------------------------------

export type PluginId = string;

export interface AutoCorrectRule {
	pattern: string;
	replacement: string;
}

export interface Plugin {
	id: PluginId;
	name: string;
	version: string;
	builtin: boolean;
	categories: Category[];
	shortcuts: Shortcut[];
	autocorrect?: AutoCorrectRule[];
}

export interface PluginRegistryEntry {
	id: PluginId;
	enabled: boolean;
	order: number;
}

export type CompassDirection = 'auto' | 'NW' | 'N' | 'NE' | 'W' | 'E' | 'SW' | 'S' | 'SE';

export interface HintsOffset {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export interface StopListEntry {
	exe: string;
	expansion: boolean;
	hints: boolean;
	direction: CompassDirection;
	offset: HintsOffset;
	autocorrect?: boolean;
	autocorrect_rules?: AutoCorrectRule[];
}

const DISPLAY_MAP: Record<string, string> = {
	' ': '⍽', // non-breaking space -> shouldered open box
	'​': '╌' // zero-width space -> box drawings light double dash
};

export function displayChar(char: string): string {
	return DISPLAY_MAP[char] ?? char;
}
