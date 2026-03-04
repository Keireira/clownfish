export type Platform = 'macos' | 'windows';

export type SymbolEntry = [char: string, name: string];

export type SymbolCategory = {
	name: string;
	chars: SymbolEntry[];
};
