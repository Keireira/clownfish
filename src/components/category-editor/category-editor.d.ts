import type { Category } from '../../types';

export type Props = {
	category: Category;
	onChange: (category: Category) => void;
	onOpenPresets: () => void;
	onDeleteChar?: (charIdx: number) => void;
	onAddShortcut?: (char: string, name: string) => void;
	existingExpansions?: string[];
};
