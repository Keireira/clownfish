import type { Category as CategoryType } from '../../types';

export type Props = {
	category: CategoryType;
	onCopy: (message: string) => void;
	onAddShortcut?: (char: string, name: string) => void;
	existingExpansions?: string[];
	focusedStart?: number;
	focusedIndex?: number;
	selectedChars?: Set<string>;
	onCharModifiedClick?: (char: string, flatIndex: number, e: React.MouseEvent) => void;
};
